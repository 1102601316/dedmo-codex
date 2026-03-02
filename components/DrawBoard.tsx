"use client";

import { useEffect, useRef, useState } from "react";

type GuessResponse = {
  guess: string;
};

const CANVAS_WIDTH = 920;
const CANVAS_HEIGHT = 540;

export default function DrawBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState("还没有猜测，先画点什么吧！");
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#222222";
  }, []);

  const getPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPosition(event);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas?.setPointerCapture(event.pointerId);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setGuess("画布已清空，重新画一个让 AI 猜！");
    setError("");
  };

  const askAiToGuess = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError("");

    try {
      const imageDataUrl = canvas.toDataURL("image/png");
      const response = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl })
      });

      const data = (await response.json()) as GuessResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "猜测失败");
      }
      setGuess(data.guess);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1>你画我猜（AI 版）</h1>
      <p className="tip">在下方画布作画，点击“让 AI 猜猜”后，后端会调用 Gemini API 返回猜测结果。</p>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>

      <div className="controls">
        <button className="primary" onClick={askAiToGuess} disabled={loading}>
          {loading ? "AI 正在思考..." : "让 AI 猜猜"}
        </button>
        <button className="secondary" onClick={clearCanvas} disabled={loading}>
          清空画布
        </button>
      </div>

      <div className="result">
        <strong>AI 猜测：</strong> {guess}
      </div>
      {error ? <p style={{ color: "#b91c1c", marginTop: 10 }}>错误：{error}</p> : null}
    </div>
  );
}
