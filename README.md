# 你画我猜（Next.js + Gemini API）

一个简单的你画我猜游戏：
- 玩家在画布上绘画。
- 前端将画布图片发送到后端 API。
- 后端使用 **Gemini HTTP API**（不使用任何 SDK）进行猜测并返回结果。

## 运行方式

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env.local
```

然后在 `.env.local` 里填入 `GEMINI_API_KEY`。

3. 启动开发环境

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 技术点

- Next.js App Router
- HTML Canvas 绘图
- 后端路由 `app/api/guess/route.ts` 通过 `fetch` 直接调用 Gemini REST API
- 无任何 Gemini SDK
