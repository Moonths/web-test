# 个人简介

姓名：毛际可
职位：前端工程师
年龄：33岁
邮箱：moonths@yeah.net
手机号：15810503259（同微信号）
所在地：中国

简介：资深前端工程师，具备10年+企业级与AI原生应用开发经验，擅长Vue3全家桶及TypeScript工程化体系建设。具备跨端开发能力（uni-app/小程序）主导过集团级ERP与仓储管理等复杂后台系统。同时具备NestJS BFF层开发能力，能从前端到服务层闭环解决复杂业务问题。

---

# 工作经历

## [挖酒网] — [前端] (2018.11 - 2026.6)

- [管理大前端部门 一线开发网页 小程序 管理系统 协调各部门资源 管理客户端重构制定计划 推广新技术]
- * 前端工程化：TypeScript、ESLint/Prettier/Stylelint、Husky/commitlint、Vite 打包优化、代码规范与可维护性

* Web 框架：Vue3 + Vite + TypeScript、Pinia、Vue Router、Element Plus；Vue2 + Vue Router + Vuex + ElementUI
* 数据与交互：Axios 请求封装与拦截器、状态持久化、权限/路由守卫、表单与复杂表格交互
* 流式与大模型交互：SSE 流式渲染、流式 token 增量展示、前端与后端的事件协议适配

••移动端经验（补充）：uni-app、小程序原生 开发 H5 与小程序业务页面

## [逻辑适点] — [前端] (2016.01 - 2018.10)

- [前端开发 配合后端]
- [纯css实现教学动画项目]

---

# 技能

## 前端

- Vue3, TypeScript,uniapp,nest.js,javascript原生,jquery
- Vite, Webpack
- CSS3, Tailwind CSS

## 后端

- Python, FastAPI, Node.js,
- RESTful API 设计

## 工具 & 其他

- Git, Docker
- Linux

---

# 项目经历

## 集团 ERP2.0 管理平台（conglomerates-erp）

- **描述**：集团化 ERP 管理后台，覆盖客户、产品、订单、采购、仓储、财务、供应商、价格、系统设置等核心业务模块，并集成 AI 代理对话入口，解决集团多业务统一管理与智能化协作问题。
- **技术栈**：Vue3, TypeScript, Vite, Element Plus, Pinia, Vue Router, Axios
- **亮点**：搭建工程架构（请求/响应拦截器、动态路由权限控制、Pinia 持久化）；实现登录鉴权、Token 注入与全局异常处理；落地多业务模块查询筛选、导出打印等能力；对接 AI 代理后端（agentPC/agentH5），完成请求编排与交互适配；集成阿里云 OSS、PDF/条码、暗黑模式等功能。封装protable组件实现搜索框表格联动，可视化拖拽表头调整位置，个性化定制表头。

## AI 对话后端服务（ai-chat）

- **描述**：为 ERP 场景提供流式对话能力，支持纯文本与文件驱动的流式生成，对接前端 SSE 流式渲染体验，解决 ERP 中智能对话与订单文件处理的实时性问题。
- **技术栈**：Python, Flask, DashScope, 百炼工作流, SSE
- **亮点**：实现 SSE 流式接口 `/stream`，使用 `stream_with_context` 返回 `text/event-stream`，自定义 `type=content/done/error` 协议并禁用 Nginx 缓冲；根据 fileContent/fileType 分流纯文本或文件工作流；调用百炼工作流流式接口（`stream=True` + `flow_stream_mode="message_format"`），逐块 yield 实现打字机效果；支持会话追溯与日志落库。

## 仓储管理后台（jss-storage-admin）

- **描述**：酒闪闪仓储管理系统管理后台，覆盖仓内流程、入出库、盘点/异常、销售采购、售后退款等业务，解决仓储全流程的可视化与操作追踪问题。
- **技术栈**：Vue2, Vue CLI, ElementUI, Axios
- **亮点**：开发并维护多业务域页面（sales/purchase/receive、storageIn/Out、checkGoods、afterSale/refund 等）；统一对接网关/BFF 地址体系，通过环境变量配置多服务入口；实现复杂列表/表单/弹窗交互、批量操作与下载导出功能，保证“能用、可追踪”的操作链路。

## 仓储管理 BFF（jss-storage-admin-bff）

- **描述**：作为仓储管理前后端解耦层，统一封装仓储业务的 BFF 管理 API，并代理转发到下游仓储、销售、采购等服务，解决前端多服务对接与鉴权透传问题。
- **技术栈**：NestJS, TypeScript, Swagger, RxJS
- **亮点**：统一鉴权与上下文 Header 约定（Authorization、current-account-id、current_account_associated_warehouse 等），Swagger 明确并透传到下游；按 sales/purchase/receive/expired/checkgoods/aftersale 等模块组织控制器与服务编排；实现全局异常过滤器、XML 支持中间件、请求日志中间件；通过 HttpService + RxJS 封装下游调用为前端统一返回结构。

## 智能文档问答系统

- **描述**：智能文档问答系统，支持文档解析建库、知识检索、带引用的生成问答，解决私有文档的智能检索与流式问答问题。
- **技术栈**：vue3 Vite, TypeScript, Antd, ahooks, Valtio（前端）；FastAPI, PostgreSQL, Elasticsearch, Redis, JWT, DashScope（后端）
- **亮点**：前端实现 SSE 流式渲染（Fetch ReadableStream 按 data: 行解析，增量更新内容/思考态/推荐问题），统一鉴权 Header；后端实现离线建库（解析/Chunking → Embedding → ES 每用户索引 → PG 落元信息，Redis 临时文档快速解析）与在线问答（混合检索 + rerank → Prompt 组装要求引用 → 大模型流式生成 → SSE 输出并落库）；Docker Compose 多服务编排（FastAPI/ES/Redis/PG），支持快速验证与部署。

## 红酒宝小程序

面向酒类经销商的微信小程序电商平台，用户需通过资质认证（营业执照/名片）后方可下单，具备完整的 B2B 采购交易流程。

**技术栈**

微信小程序原生框架（WXML/WXSS/JS）、阿里云 OSS（STS 临时凭证上传）、RESTful API、微信支付

## 核心模块

### 用户体系

微信授权登录、手机号绑定、经销商资质认证审核流程（支持拒绝后重新提交）

### 商品模块

商品列表多维筛选（品类/价格/新品/获奖酒）、关键词搜索（热搜词、历史记录、联想词）、商品详情

### 交易链路

购物车管理（SKU 级别数量调整）→ 预创建订单 → 运费计算（省级可达查询）→ 优惠券抵扣 → 微信支付 → 订单状态跟踪（取消/确认收货）

### 营销体系

新人优惠券、优惠券中心、推荐人分销（专属推荐二维码 + 下线用户列表）

### 地址管理

收货地址增删改查、默认地址、不可达省份提示

### 安全合规

图片上传前同步内容安全检测（对接微信安全 API），OSS 上传使用 STS 临时凭证避免密钥泄露，前端集成 MD5/SHA1/HMAC/TripleDES 多种加密工具

---

## 万能报名 · 微信小程序

### 项目描述

一款面向个人及企业的**活动报名与团购接龙**微信小程序，提供活动发布、在线报名、收费管理、签到核销、钱包结算等完整闭环功能。支持发起普通活动和团购接龙两大场景，覆盖活动创建、名单管理、二维码签到、分账提现全流程，服务多类型活动组织者（个人/企业）。

---

### 技术栈

- **框架**：mpvue（基于 Vue 2.x），支持一套代码编译至微信/百度/头条/支付宝四端小程序
- **状态管理**：Vuex，集中管理购物车、用户信息、跨页面参数等全局状态
- **样式**：Less + px2rpx 自动转换，适配不同屏幕尺寸
- **构建**：Webpack 3.x + 多环境（dev/test/prod）脚本
- **网络层**：`wx.request` Promise 封装，统一 token 注入与 401 自动登出
- **存储**：wx.Storage 本地持久化登录态
- **图片上传**：阿里云 OSS 客户端直传（STS 临时凭证 + HMAC-SHA1 签名）
- **加密**：本地实现 MD5、HMAC-SHA1、Base64、TripleDES
- **支付**：微信支付电商分账（ecommerce）API
- **插件**：OCR 证件识别插件、第三方日历时间选择插件

---

### 项目亮点

1. **多端跨平台编译**：基于 mpvue 实现一套 Vue 代码同时打包到微信、百度、头条、支付宝四个小程序平台，工程化构建脚本按平台分离，显著降低多端维护成本。

2. **分包加载优化**：将活动管理（my）和接龙（jielong）两大子功能拆分为独立子包，主包体积符合微信平台限制，页面按需加载，启动性能显著提升。

3. **OSS 客户端直传 + 安全密钥传输**：accessKeySecret 由服务端 DES 加密下发，客户端本地解密后签名，避免密钥明文暴露；上传文件名用 MD5(时间戳) 生成，防止重名冲突。

4. **发布前图片内容安全审核**：图片上传后异步提交内容安全检测，前端通过轮询机制（500ms 间隔，最多 20 次）等待审核结果，不合规内容自动阻断发布，保障平台合规。

5. **Canvas 离屏海报生成**：在屏幕外的离屏 Canvas 上异步绘制活动分享海报（含 banner 图、文字、按钮图），下载完成后转为临时文件供微信分享，加入并发锁防止重复触发。

6. **完整微信支付电商分账流程**：完整实现四种商户类型（小微/个人卖家/个体/企业）资质申请，覆盖审核状态机（7 个状态流转）、账户验证、银行卡绑定、提现申请与流水明细，流程完整、状态管理清晰。

# 教育背景

## [北京信息科技大学] — [计算机科学与技术] (2011 - 2015)

- 学历：本科

---

# 其他

- 语言：中文（母语），英文（读写流利）
- 兴趣：[滑雪 音乐 钓鱼]
- 婚姻：已婚 孩子三岁
- 民族：汉族
- 政治面貌：群众
- 籍贯：浙江
- 户口：北京

