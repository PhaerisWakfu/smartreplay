# 项目：高情商嘴替

## 1. 项目概述
这是一个完全部署在 Cloudflare 生态上的单页面应用（SPA）。用户通过粘贴对方发送的文本或上传聊天截图，选择期望的应对语气，系统将调用 Cloudflare Workers AI 生成得体、可以直接复制发送的回复文案。

## 2. 技术栈与部署架构
* **前端：** 原生 HTML/Tailwind CSS/Vanilla JS (轻量化，部署于 Cloudflare Pages)。
* **后端 API：** Cloudflare Workers (使用 Hono.js 框架处理路由)。
* **AI 服务：** Cloudflare Workers AI。
    * 文本生成模型：`@cf/google/gemma-4-26b-a4b-it` (处理中英文回复)。
    * 视觉/OCR 模型：`@cf/google/gemma-4-26b-a4b-it` (如果用户上传图片，用于提取截图中的文本)。

## 3. 核心功能与 UI 需求
1.  **输入区：** * 一个支持多行文本输入的 Textarea，支持读取剪贴板。
    * 一个图片上传按钮（限制 5MB 内，支持拖拽）。
2.  **语气选择器（Radio Buttons / Tags）：**
    * 选项包括：高情商安抚、礼貌拒绝、据理力争、阴阳怪气、甩锅自保。
3.  **操作区：** “生成回复”按钮。
4.  **输出区：** * 展示 AI 生成的文本。
    * 提供“一键复制”按钮。

## 4. 后端 API 设计 (Workers)
* `POST /api/generate`
    * **请求体 (JSON):** `{ "inputType": "text" | "image", "content": "文本内容或图片的 Base64", "tone": "礼貌拒绝" }`
    * **处理逻辑：**
        1. 如果是 `image`，先调用视觉模型提取图片中的对话文本。
        2. 将提取的文本（或直接传入的文本）结合选定的 `tone`，拼接成 System Prompt。
        3. 调用 Llama-3 模型生成回复。
        4. 返回 JSON: `{ "success": true, "reply": "生成的文本" }`

## 5. AI 系统提示词 (System Prompt) 预设示例
你需要为 Llama-3 预设强大的 System Prompt，例如：
"你是一个精通人际交往和沟通技巧的公关专家。用户会提供一段别人发给他的消息，以及他期望回复的语气为【{{tone}}】。
请你根据该语气，直接生成一段可以复制发送的回复文本。要求：口语化、符合真实聊天场景、不要有任何多余的解释和前置语。"

## 6. 开发任务分配
1. 请先提供 `wrangler.toml` 文件的配置，绑定 Workers AI。
2. 编写后端的 Worker 核心代码（处理文本和图片双路逻辑）。
3. 编写前端单页面 `index.html`，实现美观、响应式的 UI 和 API 调用逻辑。