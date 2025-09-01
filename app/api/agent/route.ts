import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { generateProjectPlan } from "@/lib/groq";
import { ConsoleCallbackHandler } from "langchain/callbacks";

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    // Get project details
    const project = await Database.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get project answers
    const answers = await Database.getProjectAnswers(projectId);
    const answersMap: Record<string, string> = {};
    answers.forEach((answer) => {
      answersMap[answer.question_id] = answer.answer_text;
    });

    // Generate AI plan
    const aiResult = await generateProjectPlan(
      `${project.title}: ${project.description}`,
      answersMap
    );
    // console.log("Before saving db  api/agent ");
    // console.log(aiResult);
    // Save result to database
    const result = await Database.saveResult(projectId, aiResult);
    // console.log("In api/agent ");
    // console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate project plan" },
      { status: 500 }
    );
  }
}
