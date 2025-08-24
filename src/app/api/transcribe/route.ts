import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "edge"; // 👈 ensures Edge runtime

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Re-wrap into a real Blob (Edge friendly)
    const blob = new Blob([await file.arrayBuffer()], {
      type: file.type || "audio/webm",
    });

    // OpenAI accepts Blob in Edge runtime
    const transcription = await openai.audio.transcriptions.create({
      file: new File([blob], file.name || "recording.webm", { type: blob.type }),
      model: "gpt-4o-mini-transcribe",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
