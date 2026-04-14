# 🚀 高情商嘴替 (Smart Replay) 部署指南

本项目包含一个基于 Hono 的后端 API（依托于 Cloudflare Workers 与 Workers AI）以及一个纯静态的 HTML 网页前端。基于 Cloudflare 生态，您可以**完全免费**地将两者部署上线。

## 准备工作
1. 环境中需要已安装 [Node.js](https://nodejs.org/)。
2. 已经注册了 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)。
3. 在终端中运行 Wrangler CLI 登录命令并根据提示完成浏览器授权：
   ```bash
   npx wrangler login
   ```

---

## 一、 部署后端 API (Cloudflare Workers)

后端负责接收前端传来的消息并调用大模型（Workers AI）生成神回复。

1. 在项目根目录（`d:\cloudflare\smart-replay`），确保依赖已安装（如果之前运行过无需重复）：
   ```bash
   npm install
   ```

2. 运行 Wrangler 的部署命令将代码推送到云端：
   ```bash
   npx wrangler deploy
   ```

3. 部署成功后，终端末尾会返回一个 API 的线上访问地址，例如：
   👉 `https://smart-replay.<您的用户名>.workers.dev`
   **请将其复制并记下**，我们在下一步中需要用到它。

---

## 二、 部署前端页面 (Cloudflare Pages)

前端是一套精美的静态 HTML 页面文件。由于我们将其与后端拆分成独立服务，需要告知静态页面我们刚刚部署好的后端位于哪里。

### 第 1 步：绑定线上 API 地址
打开 `public/index.html`，滚动到约 224 行 JavaScript 发起 `fetch` 请求的地方：
```javascript
// Determine API endpoint based on environment
const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
              ? 'http://127.0.0.1:8787' : '';
```
将其中的 `''` 替换为您刚刚记住的**后端线上 API 地址**（注意不能以 `/` 结尾），修改后如下所示：
```javascript
const baseUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
              ? 'http://127.0.0.1:8787' : 'https://smart-replay.<您的用户名>.workers.dev';
```
*(注意：请确保上面的 `<您的用户名>` 和前缀替换为你真实的生成链接)*

### 第 2 步：推送发布
使用 Wrangler 直接将 `public` 文件夹作为页面推送至 Cloudflare Pages：
```bash
npx wrangler pages deploy public
```

### 第 3 步：初次部署的交互向导
运行后，终端内会询问您一些问题：
1. **Create a new project?** (是否创建新项目) -> 选择 `Create a new project`。
2. **Enter the name of your new project:** (输入工程名称) -> 输入 `smart-replay-ui` 或者您喜欢的任意名称。
3. **Enter the production branch name:** (输入生产分支名称) -> 直接按回车默认即可。

---

## 🎉 完成
全部上传完成后，在控制台的输出结尾，您将得到类似这样的最终前端线上网址：
👉 `https://smart-replay-ui.pages.dev`现在，打开您的手机或电脑浏览器访问这个链接，您的高颜值私人“高情商嘴替”就已经完全部署在公网了！随时随地解决您的聊天冷场。

---

## 三、 持续更新与后续维护

如果未来需要新增功能、修改系统提示词或更换其它 AI 模型，只要按照以下流程一键更新发布即可，非常简便：

### 1. 修改后端服务代码（如更换模型）
在您的项目中编辑 `src/index.ts` 代码，修改完毕后。
在根目录运行：
```bash
npx wrangler deploy
```
发布大概只需要 2~5 秒钟。一旦终端显示 `Deployed smart-replay...`，后端更新就立刻生效。线上前端也会自动读到您的最新逻辑。

### 2. 修改前端页面效果
如果您修改了 `public/index.html` 等静态文件。
同理，在项目根目录运行一遍 Pages 上传：
```bash
npx wrangler pages deploy public
```
完成后刷新浏览器页面，就能欣赏到最新的前台更新了。前后端可完全独立进行发版！
