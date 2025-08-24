// app/api/transcribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs/promises";
import os from "os";
import path from "path";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "No audio file found." },
    { status: 400 }
  );

  // try {
  //   const data = await req.formData();
  //   const audio = data.get("audio") as File | null;

  //   if (!audio) {
  //     return NextResponse.json(
  //       { error: "No audio file found." },
  //       { status: 400 }
  //     );
  //   }

  //   // Convert the audio file to a buffer
  //   const audioBuffer = Buffer.from(await audio.arrayBuffer());

  //   // Create a temporary file path
  //   const tempDir = os.tmpdir();
  //   const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);

  //   // Write the audio buffer to the temporary file
  //   await fs.writeFile(tempFilePath, audioBuffer);
    
  //   // --- OpenAI Transcription ---
  //   // Note: The prompt mentioned "gpt-4o-mini-transcribe", 
  //   // but the correct model for this API is "whisper-1".
  //   const transcription = await openai.audio.transcriptions.create({
  //     file: await OpenAI.toFile(audioBuffer, 'audio.webm'),
  //     model: "gpt-4o-mini-transcribe",
  //   });

  //   // Clean up the temporary file
  //   await fs.unlink(tempFilePath);

  //   // Return the transcription text
  //   return NextResponse.json({ text: transcription.text });
    
  // } catch (error) {
  //   console.error("Error during transcription:", error);
  //   return NextResponse.json(
  //     { error: "Transcription failed." },
  //     { status: 500 }
  //   );
  // }
}