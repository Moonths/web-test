# Resume Website — 项目启动指南

## 目录结构

```
resume-website/
├── backend/       # Python FastAPI
├── admin/         # Vue3+TS 管理后台 (port 5174)
└── frontend/      # Vue3+TS 简历站   (port 5173)
```

---

## 1. 启动后端

```bash
cd backend

# 安装依赖
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入以下内容：
# 1. DEEPSEEK_API_KEY — 从 https://platform.deepseek.com 获取
# 2. ADMIN_PASSWORD_HASH — 用以下命令生成：
#    python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('你的密码'))"
# 3. JWT_SECRET — 任意随机字符串

# 启动
uvicorn main:app --reload --port 8000
```

---

## 2. 启动管理后台

```bash
cd admin
npm install
npm run dev   # → http://localhost:5174
```

登录后可编辑知识库（左侧 Markdown 编辑器），右侧可实时测试 AI 对话效果。

---

## 3. 启动简历站

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

创建 `frontend/.env.local`，配置 AI 聊天凭据：

```
VITE_API_URL=http://localhost:8000
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=123456
```

---

## 4. 填写知识库

启动后台后，登录 http://localhost:5174，在编辑器中填写 `knowledge/resume.md` 的内容（已有模板），保存后 AI 立即生效。

---

## 5. 验证 E2E

1. 后台编辑器中添加一条技能信息，点击「保存知识库」
2. 打开简历站 http://localhost:5173，点击右下角 AI 按钮
3. 提问「你会什么技术？」，确认回答包含刚才添加的内容
