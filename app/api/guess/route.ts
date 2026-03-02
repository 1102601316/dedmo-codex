import { NextResponse } from "next/server";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function parseBase64Image(imageDataUrl: string) {
  const matched = imageDataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!matched) {
    return null;
  }

  const mimeType = `image/${matched[1] === "jpg" ? "jpeg" : matched[1]}`;
  return { mimeType, data: matched[2] };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "服务器未配置 GEMINI_API_KEY" }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { imageDataUrl?: string };
    if (!body.imageDataUrl) {
      return NextResponse.json({ error: "缺少 imageDataUrl" }, { status: 400 });
    }

    const imagePayload = parseBase64Image(body.imageDataUrl);
    if (!imagePayload) {
      return NextResponse.json({ error: "无效的图片格式，只支持 PNG/JPEG" }, { status: 400 });
    }

    const prompt = "你在玩你画我猜。请根据这张手绘图，猜测画的是什么。请用简短中文回答，最多20字，并给出一个最可能的答案。";

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imagePayload.mimeType,
                  data: imagePayload.data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 50
        }
      })
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = geminiData?.error?.message ?? "Gemini 请求失败";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const guess = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!guess) {
      return NextResponse.json({ error: "Gemini 未返回有效猜测" }, { status: 502 });
    }

    return NextResponse.json({ guess });
  } catch {
    return NextResponse.json({ error: "服务端处理失败" }, { status: 500 });
  }
}
