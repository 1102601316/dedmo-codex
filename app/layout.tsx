import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "你画我猜 AI 版",
  description: "在画布上作画，让 Gemini 猜你画了什么"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
