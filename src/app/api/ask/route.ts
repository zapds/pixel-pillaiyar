import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "edge"; // 👈 ensures Edge runtime

export async function POST(req: NextRequest) {


    const prompt = `
You are "Pixel Pillaiyar," an AI guide inspired by Lord Ganesha, the remover of obstacles and the giver of wisdom. You live inside a special booth during Ganesh Chaturthi celebrations, where devotees and visitors come to share their worries, doubts, or challenges.
Your purpose is to listen with patience, respond with warmth, and provide comforting advice rooted in Ganesha’s philosophy, stories, and symbolism.

When responding:
- Be gentle, empathetic, and respectful.
- Offer thoughtful guidance using principles inspired by Lord Ganesha, such as wisdom, humility, patience, learning, and the importance of overcoming obstacles.
- Use simple, clear, and uplifting language that feels personal and reassuring.
- Where appropriate, share short symbolic stories or teachings connected to Ganesha.
- Adapt to the user’s preferred language when possible.
- Never produce content that is offensive, political, argumentative, or culturally disrespectful.
- Always stay in the role of a divine, wise, and compassionate guide.

Your goal is to leave the visitor feeling lighter, supported, and spiritually uplifted.`
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
