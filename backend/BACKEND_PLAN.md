# 后端方案 — 个人简历网站

> 版本：v1.0  |  日期：2026-05-06  |  负责人：backend-engineer

---

## 1. 架构决策：静态站点 + Serverless 表单

### 1.1 是否需要真正的后端？

**结论：不需要自建后端。推荐纯静态站点 + 第三方表单服务。**

| 维度 | 自建后端 (Node.js/Express) | 纯静态 + Serverless 表单 |
|------|---------------------------|------------------------|
| 开发成本 | 高（路由、校验、邮件、数据库） | 极低（配置即用） |
| 运维成本 | 需要服务器/进程监控 | 零运维 |
| 冷启动延迟 | 需长期运行 | CDN 直出，毫秒级 |
| 成本 | 最低 $5/月 VPS | 免费额度足够（<50 次/月） |
| 安全风险 | 需自行处理 CSRF/垃圾/限流 | 第三方已封装 |
| 对简历展示的增益 | 无 | 无 |

简历网站的核心是**快速可靠地展示个人信息**，流量小、写入场景仅限"联系表单"这一处。引入 Node.js 服务只会增加攻击面与维护负担，不划算。

### 1.2 架构图

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   浏览器    │────▶│  CDN（Vercel）    │────▶│  静态资源   │
│  (访客)    │      │  HTML/CSS/JS/IMG │      │  (Git 托管) │
└─────────────┘      └──────────────────┘      └─────────────┘
       │
       │ POST 表单提交
       ▼
┌──────────────────┐      ┌──────────────┐
│   Formspree API  │────▶│  邮箱通知    │
│  (无服务器)      │      │  (站主收件)  │
└──────────────────┘      └──────────────┘
```

---

## 2. 技术栈推荐

### 2.1 前端（由前端工程师实现，此处仅列边界）

- **框架**：Vite + 原生 HTML/CSS/JS，或 Astro（推荐，构建产物接近纯静态）
- **构建产物**：`dist/` 目录，纯 `.html` + `.css` + `.js` + 静态资源
- **不需要**：Node.js runtime、数据库、API 服务器

### 2.2 联系表单服务（三选一）

| 方案 | 免费额度 | 集成方式 | 推荐场景 |
|------|---------|---------|---------|
| **Formspree** | 50 次/月 | `<form action="https://formspree.io/f/{id}">` | 首选，配置最简 |
| **Netlify Forms** | 100 次/月 | `<form netlify>` 属性 | 若部署在 Netlify |
| **Web3Forms** | 250 次/月 | `access_key` + fetch POST | 需要更高免费额度 |

**推荐：Formspree**，原因：
- 与部署平台解耦（换 Vercel/Netlify/GitHub Pages 都能用）
- 自带反垃圾（honeypot + reCAPTCHA 可选）
- 邮件模板可定制，支持自动回复
- 文档完善，5 分钟接入

### 2.3 部署平台

**首选：Vercel**

| 平台 | 部署方式 | 自定义域名 | HTTPS | 构建时间 | 适配度 |
|------|---------|-----------|-------|---------|--------|
| **Vercel** | Git 推送自动部署 | 免费支持 | 自动 Let's Encrypt | 秒级 | 最佳 |
| Netlify | Git 推送自动部署 | 免费支持 | 自动 | 秒级 | 好 |
| GitHub Pages | Actions 部署 | 需手动 CNAME | 自动 | 1–2 分钟 | 够用 |

**推荐 Vercel 的理由：**
- 全球边缘网络，国内访问相对稳定
- 预览部署（每个 PR 自动生成预览链接）
- 支持 Serverless Functions（后续若要加 API 可无缝扩展）
- 免费额度：100GB 带宽/月，足够个人简历使用

---

## 3. 联系表单集成方案（Formspree）

### 3.1 注册与配置

1. 访问 `formspree.io` → 用 GitHub 账号注册
2. 创建新表单，获取 `form_id`（形如 `xyzabcde`）
3. 配置收件邮箱为站主邮箱
4. 开启反垃圾选项（honeypot + 邮件验证）

### 3.2 前端 HTML 片段（交付前端工程师）

```html
<form
  action="https://formspree.io/f/YOUR_FORM_ID"
  method="POST"
  class="contact-form"
>
  <label>
    姓名
    <input type="text" name="name" required />
  </label>

  <label>
    邮箱
    <input type="email" name="email" required />
  </label>

  <label>
    留言
    <textarea name="message" rows="5" required></textarea>
  </label>

  <input type="text" name="_gotcha" style="display:none" />

  <button type="submit">发送</button>
</form>
```

**字段说明：**
- `action`：Formspree 提供的 endpoint，`YOUR_FORM_ID` 需替换
- `_gotcha`：蜜罐字段，机器人填写后服务端自动丢弃
- 可选 `_next` 隐藏字段：提交后跳转 URL（如 `/thank-you.html`）
- 可选 `_subject` 隐藏字段：自定义邮件主题

### 3.3 成功/失败反馈（AJAX 版本，推荐）

```javascript
document.querySelector('.contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.reset();
      showToast('发送成功，将尽快回复');
    } else {
      showToast('发送失败，请稍后重试或直接发邮件');
    }
  } catch (err) {
    showToast('网络错误，请检查连接');
  }
});
```

### 3.4 环境变量管理

Formspree 的 `form_id` 不算机密（暴露在 HTML 中），但为便于切换生产/测试环境，建议：

```bash
# .env.production
VITE_FORMSPREE_ID=xyzabcde

# .env.development
VITE_FORMSPREE_ID=test_form_id
```

前端构建时通过 `import.meta.env.VITE_FORMSPREE_ID` 注入。

---

## 4. 部署方案（Vercel）

### 4.1 初始化部署

```bash
cd /Users/maojike/resume-website
git init
git add .
git commit -m "chore: initial commit"
git remote add origin git@github.com:USERNAME/resume-website.git
git push -u origin main
```

在 Vercel Dashboard：
1. Import Git Repository → 选择 `resume-website`
2. Framework Preset：根据前端选择（Astro / Vite / Other）
3. Build Command：`npm run build`（或前端实际命令）
4. Output Directory：`dist`（或前端实际产物目录）
5. Environment Variables：添加 `VITE_FORMSPREE_ID`
6. 点击 Deploy

### 4.2 自定义域名（可选）

1. Vercel → Project → Settings → Domains
2. 添加自定义域名 `resume.yourname.com`
3. 按提示在域名 DNS 添加 CNAME 记录
4. Vercel 自动签发 Let's Encrypt 证书

### 4.3 CI/CD 流程

```
本地开发 (feat/xxx 分支)
    │
    ├──▶ git push → GitHub
    │         │
    │         ├──▶ Vercel 自动创建 Preview 部署
    │         │        └──▶ 生成预览 URL 供验收
    │         │
    │         └──▶ 合并到 main 分支
    │                  └──▶ Vercel 自动 Production 部署
    │                           └──▶ 线上站点更新
```

---

## 5. 安全与性能

### 5.1 安全考量

| 风险 | 缓解措施 |
|------|---------|
| 表单垃圾提交 | Formspree 内置 honeypot + 可选 reCAPTCHA |
| XSS（用户输入） | 静态站点无回显，天然免疫；表单数据仅发到邮箱 |
| CSRF | 同上，无服务端会话，无 CSRF 风险 |
| 邮件地址泄露 | 不要在页面明文写站主邮箱，改用表单联系 |
| HTTPS | Vercel 自动强制 HTTPS |
| 敏感信息 | `.env*` 加入 `.gitignore`；简历内的电话可选性脱敏 |

### 5.2 性能优化（后端/部署层）

- **CDN 缓存**：Vercel 默认启用全球边缘缓存
- **HTTP/2 + Brotli**：Vercel 默认开启
- **图片优化**：交前端使用 WebP/AVIF + `loading="lazy"`
- **缓存头**：静态资源文件名带 hash，可设置长期缓存

在项目根目录添加 `vercel.json`：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 6. 备选方案（如果 Formspree 免费额度不够）

若月提交量超过 50 次，可切换为 Vercel Serverless Functions 自建表单处理：

```
/api/contact.js  ──▶  校验 + 调 SendGrid/Resend API ──▶ 发邮件到站主
```

技术栈：
- Runtime：Vercel Functions（Node.js 20）
- 邮件服务：Resend（免费 100 封/天）或 SendGrid
- 校验：Zod
- 反垃圾：Cloudflare Turnstile（免费）

此方案仍零服务器运维，但需要一个轻量 Node.js 文件。当前阶段**不推荐先上**，按 YAGNI 原则等真正需要时再加。

---

## 7. 交付给前端工程师的约束

1. 联系表单使用 Formspree，`form_id` 通过环境变量注入
2. 表单字段：`name`、`email`、`message`、`_gotcha`（蜜罐）
3. 提交使用 AJAX fetch 而非原生跳转，提供 toast 反馈
4. 构建产物放在 `dist/` 目录，不得依赖 Node.js runtime
5. 页面不直接暴露站主邮箱明文，统一走表单
6. 图片资源放在 `public/assets/`，文件名带 hash

---

## 8. 待办清单（后续阶段）

- [ ] 注册 Formspree 账号，获取 `form_id`
- [ ] 创建 GitHub 仓库 `resume-website`
- [ ] 注册 Vercel 账号，关联 GitHub
- [ ] 前端开发完成后，配置环境变量并触发首次部署
- [ ] 提交测试表单，验证邮件到达
- [ ] （可选）配置自定义域名
- [ ] （可选）接入 Plausible/Umami 做隐私友好的访问统计

---

## 附录 A：成本预算

| 项目 | 费用 |
|------|------|
| Vercel Hobby Plan | $0 |
| Formspree Free | $0（50 次/月内） |
| GitHub 公开仓库 | $0 |
| 自定义域名（可选） | $10–15/年 |
| **合计** | **$0–15/年** |

## 附录 B：参考链接

- Formspree 文档：`https://help.formspree.io/`
- Vercel 部署文档：`https://vercel.com/docs`
- Netlify Forms 文档：`https://docs.netlify.com/forms/setup/`
