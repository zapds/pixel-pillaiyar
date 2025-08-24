// app/api/ask/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, previousResponseId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // const response = await client.responses.create({
    //   model: "gpt-5",
    //   instructions: SYSTEM_PROMPT,
    //   input: message,
    //   store: true,
    //   ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
    // });
    const response = await client.responses.create({
      prompt: {
        "id": "pmpt_68aadab7c8b88193a311dae6e27b38d10c64f834186a33fb",
        "version": "4"
      },
      input: message,
      store: true,
      previous_response_id: previousResponseId || null,
    });

    return NextResponse.json({
      id: response.id,
      output: response.output_text, // shortcut for plain text
    });

  } catch (err: any) {
    console.error("Error in /api/ask:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
