import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { project_id, questionText, question_id, answer_text } =
      await request.json();

    const answer = await Database.saveAnswer(
      project_id,
      questionText,
      question_id,
      answer_text
    );
    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
