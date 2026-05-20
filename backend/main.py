import asyncio
import os
import sqlite3
import smtplib
import uuid
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from openai import AsyncOpenAI
import bcrypt as _bcrypt
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
KNOWLEDGE_PATH = Path(__file__).parent / "knowledge" / "resume.md"
DB_PATH = Path(__file__).parent / os.getenv("DB_PATH", "data/app.db")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")

# ── Mutable state ─────────────────────────────────────────────────────────────
RESUME_CONTEXT: str = ""
sessions: dict[str, list] = {}

# ── Services ──────────────────────────────────────────────────────────────────
security = HTTPBearer()
limiter = Limiter(key_func=get_remote_address)
ai_client = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")


def load_knowledge() -> str:
    if KNOWLEDGE_PATH.exists():
        return KNOWLEDGE_PATH.read_text(encoding="utf-8")
    return "暂无知识库内容，请在管理后台添加。"


_DDL = """
CREATE TABLE IF NOT EXISTS chat_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    ip         TEXT NOT NULL,
    session_id TEXT NOT NULL,
    question   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS interests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    name       TEXT NOT NULL,
    company    TEXT NOT NULL,
    position   TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    jd_url     TEXT,
    message    TEXT
);
CREATE TABLE IF NOT EXISTS time_slots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT    NOT NULL,
    start_time TEXT    NOT NULL,
    end_time   TEXT    NOT NULL,
    note       TEXT,
    is_booked  INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    slot_id    INTEGER NOT NULL REFERENCES time_slots(id),
    name       TEXT NOT NULL,
    company    TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT
);
"""


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(_DDL)


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _send_email_sync(subject: str, html_body: str):
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL]):
        return
    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = NOTIFY_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, NOTIFY_EMAIL, msg.as_string())
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    global RESUME_CONTEXT
    RESUME_CONTEXT = load_knowledge()
    init_db()
    yield


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Resume AI Backend", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://101.200.35.168",
        "https://maojike.me",
        "https://www.maojike.me",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ──────────────────────────────────────────────────────────────────────
def create_token(username: str) -> str:
    exp = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": username, "exp": exp}, JWT_SECRET, algorithm="HS256")


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Schemas ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class KnowledgeUpdate(BaseModel):
    content: str


class InterestCreate(BaseModel):
    name: str
    company: str
    position: str
    email: str
    phone: str = ""
    jd_url: str = ""
    message: str = ""


class SlotCreate(BaseModel):
    date: str
    start_time: str
    end_time: str
    note: str = ""


class BookingCreate(BaseModel):
    slot_id: int
    name: str
    company: str
    email: str
    phone: str = ""


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest):
    if body.username != ADMIN_USERNAME or not ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not _bcrypt.checkpw(body.password.encode(), ADMIN_PASSWORD_HASH.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(body.username)}


@app.post("/create_session")
async def create_session(_: str = Depends(verify_token)):
    session_id = str(uuid.uuid4())
    sessions[session_id] = []
    return {"session_id": session_id}


@app.post("/chat_on_docs")
@limiter.limit("30/minute")
async def chat_on_docs(
    request: Request,
    body: ChatRequest,
    _: str = Depends(verify_token),
):
    if body.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    sessions[body.session_id].append({"role": "user", "content": body.message})

    client_ip = request.client.host if request.client else "unknown"
    with get_db() as db:
        db.execute(
            "INSERT INTO chat_logs (ip, session_id, question) VALUES (?, ?, ?)",
            (client_ip, body.session_id, body.message),
        )

    async def event_stream():
        assistant_reply = ""
        try:
            stream = await ai_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "你是一个个人简历网站的AI助手。"
                            "请根据以下知识库内容，用中文友好专业地回答访客的问题。"
                            "如果问题超出知识库范围，请如实说明。\n\n"
                            f"---\n{RESUME_CONTEXT}\n---"
                        ),
                    },
                    *sessions[body.session_id],
                ],
                stream=True,
                max_tokens=1024,
            )
            async for chunk in stream:
                token = chunk.choices[0].delta.content or ""
                if token:
                    assistant_reply += token
                    yield f"data: {token}\n\n"
            sessions[body.session_id].append(
                {"role": "assistant", "content": assistant_reply}
            )
            yield "data: [DONE]\n\n"
        except asyncio.CancelledError:
            pass
        except Exception as e:
            yield f"data: [ERROR] {e}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/admin/knowledge")
async def get_knowledge(_: str = Depends(verify_token)):
    return {"content": RESUME_CONTEXT}


@app.put("/admin/knowledge")
async def update_knowledge(body: KnowledgeUpdate, _: str = Depends(verify_token)):
    global RESUME_CONTEXT
    KNOWLEDGE_PATH.parent.mkdir(parents=True, exist_ok=True)
    KNOWLEDGE_PATH.write_text(body.content, encoding="utf-8")
    RESUME_CONTEXT = body.content
    return {"message": "Knowledge base updated"}


@app.get("/admin/logs")
async def get_logs(_: str = Depends(verify_token)):
    with get_db() as db:
        rows = db.execute(
            "SELECT id, created_at, ip, session_id, question FROM chat_logs ORDER BY id DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@app.get("/admin/interests")
async def get_interests(_: str = Depends(verify_token)):
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM interests ORDER BY id DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@app.post("/interest")
@limiter.limit("5/hour")
async def submit_interest(
    request: Request,
    body: InterestCreate,
    background_tasks: BackgroundTasks,
):
    with get_db() as db:
        db.execute(
            "INSERT INTO interests (name, company, position, email, phone, jd_url, message) VALUES (?,?,?,?,?,?,?)",
            (body.name, body.company, body.position, body.email, body.phone, body.jd_url, body.message),
        )
    html = f"""<h3>新留资通知</h3>
<p><b>姓名：</b>{body.name}</p>
<p><b>公司：</b>{body.company}</p>
<p><b>职位：</b>{body.position}</p>
<p><b>邮箱：</b>{body.email}</p>
<p><b>电话：</b>{body.phone or '未填'}</p>
<p><b>JD：</b>{body.jd_url or '未填'}</p>
<p><b>留言：</b>{body.message or '无'}</p>"""
    background_tasks.add_task(_send_email_sync, f"【简历网站】{body.company} 对你感兴趣", html)
    return {"message": "ok"}


@app.get("/slots")
async def get_available_slots():
    now = datetime.now()
    today = now.date()
    today_str = today.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    # 往后找 7 个工作日（含今天）作为展示窗口上限
    workdays: list = []
    d = today
    while len(workdays) < 7:
        if d.weekday() < 5:
            workdays.append(d.strftime("%Y-%m-%d"))
        d += timedelta(days=1)

    cutoff_str = workdays[-1]

    with get_db() as db:
        rows = db.execute(
            """SELECT id, date, start_time, end_time, note
               FROM time_slots
               WHERE is_booked=0
                 AND date >= ?
                 AND date <= ?
               ORDER BY date, start_time""",
            (today_str, cutoff_str),
        ).fetchall()

    result = []
    for r in rows:
        # 今天的时段：end_time 已过当前时间则跳过
        if r["date"] == today_str and r["end_time"] <= current_time:
            continue
        # 只展示工作日内的时段（过滤管理员误建的周末时段）
        if r["date"] not in workdays:
            continue
        result.append(dict(r))
    return result


@app.get("/admin/slots")
async def get_all_slots(_: str = Depends(verify_token)):
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM time_slots ORDER BY date, start_time"
        ).fetchall()
    return [dict(r) for r in rows]


@app.post("/admin/slots")
async def create_slot(body: SlotCreate, _: str = Depends(verify_token)):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO time_slots (date, start_time, end_time, note) VALUES (?,?,?,?)",
            (body.date, body.start_time, body.end_time, body.note),
        )
        slot_id = cur.lastrowid
    return {"id": slot_id, **body.model_dump()}


@app.post("/admin/slots/generate")
async def generate_slots(_: str = Depends(verify_token)):
    """自动生成最近两周的上午/下午时段，跳过已存在的日期+时间组合"""
    today = datetime.now().date()
    slots_to_create = []
    periods = [("09:00", "11:00", "上午"), ("14:00", "16:00", "下午")]
    with get_db() as db:
        for i in range(14):
            day = today + timedelta(days=i)
            date_str = day.strftime("%Y-%m-%d")
            for start, end, note in periods:
                exists = db.execute(
                    "SELECT 1 FROM time_slots WHERE date=? AND start_time=?",
                    (date_str, start),
                ).fetchone()
                if not exists:
                    slots_to_create.append((date_str, start, end, note))
        for s in slots_to_create:
            db.execute(
                "INSERT INTO time_slots (date, start_time, end_time, note) VALUES (?,?,?,?)", s
            )
    return {"created": len(slots_to_create)}


@app.delete("/admin/slots/{slot_id}")
async def delete_slot(slot_id: int, _: str = Depends(verify_token)):
    with get_db() as db:
        row = db.execute("SELECT is_booked FROM time_slots WHERE id=?", (slot_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Slot not found")
        if row["is_booked"]:
            raise HTTPException(status_code=409, detail="Cannot delete a booked slot")
        db.execute("DELETE FROM time_slots WHERE id=?", (slot_id,))
    return {"message": "deleted"}


@app.post("/book")
@limiter.limit("5/hour")
async def book_slot(
    request: Request,
    body: BookingCreate,
    background_tasks: BackgroundTasks,
):
    with get_db() as db:
        cur = db.execute(
            "UPDATE time_slots SET is_booked=1 WHERE id=? AND is_booked=0",
            (body.slot_id,),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=409, detail="Slot already booked or not found")
        slot = db.execute(
            "SELECT date, start_time, end_time FROM time_slots WHERE id=?", (body.slot_id,)
        ).fetchone()
        db.execute(
            "INSERT INTO bookings (slot_id, name, company, email, phone) VALUES (?,?,?,?,?)",
            (body.slot_id, body.name, body.company, body.email, body.phone),
        )
    html = f"""<h3>新面试预约</h3>
<p><b>时间：</b>{slot['date']} {slot['start_time']}–{slot['end_time']}</p>
<p><b>姓名：</b>{body.name}</p>
<p><b>公司：</b>{body.company}</p>
<p><b>邮箱：</b>{body.email}</p>
<p><b>电话：</b>{body.phone or '未填'}</p>"""
    background_tasks.add_task(_send_email_sync, f"【简历网站】{body.company} 预约了面试", html)
    return {"message": "ok"}


@app.get("/admin/bookings")
async def get_bookings(_: str = Depends(verify_token)):
    with get_db() as db:
        rows = db.execute("""
            SELECT b.id, b.created_at, b.name, b.company, b.email, b.phone,
                   s.date, s.start_time, s.end_time
            FROM bookings b JOIN time_slots s ON b.slot_id = s.id
            ORDER BY b.id DESC
        """).fetchall()
    return [dict(r) for r in rows]
