import asyncio
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    global RESUME_CONTEXT
    RESUME_CONTEXT = load_knowledge()
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
