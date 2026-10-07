import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ safe: true });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: imageUrl },
            },
            {
              type: "text",
              text: 'Does this image contain nudity, explicit sexual content, graphic violence, or other content inappropriate for a public marketplace? Reply with only "SAFE" or "UNSAFE".',
            },
          ],
        },
      ],
    });

    const verdict = (response.content[0] as any).text?.trim().toUpperCase();
    const safe = verdict !== "UNSAFE";
    return NextResponse.json({ safe });
  } catch {
    // If moderation fails (e.g. missing API key), allow the upload
    return NextResponse.json({ safe: true });
  }
}
