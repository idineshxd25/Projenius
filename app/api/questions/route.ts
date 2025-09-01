import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { generateNextQuestion } from "@/lib/groq";

// export async function POST(request: NextRequest) {
//   try {
//     console.log("In api page");
//     const { projectId } = await request.json();

//     // 1. Get project details
//     const project = await Database.getProject(projectId);
//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // 2. Get project answers and map them
//     const answers = await Database.getProjectAnswers(projectId);
//     const answersMap: Record<string, string> = {};
//     answers.forEach((answer) => {
//       answersMap[answer.question_id] = answer.answer_text;
//     });

//     // 3. (Optional) Get the latest project result if needed
//     const currentResult = await Database.getProjectResult(projectId);

//     // 4. Generate and save next questions
//     const nextQuestions = await Database.generateAndSaveNextQuestions(
//       projectId,
//       `${project.title}: ${project.description}`,
//       answersMap,
//       currentResult || undefined
//     );

//     return NextResponse.json(nextQuestions);
//   } catch (error) {
//     console.error("Error generating next questions:", error);
//     return NextResponse.json(
//       { error: "Failed to generate next questions" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    //console.log("In api page");
    const { projectId, questionIndex, answers, updatedQuestionSoFar } =
      await request.json();
    //console.log(answers);

    // 1. Get project details
    const project = await Database.getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Get project answers
    // const answers = await Database.getProjectAnswers(projectId);
    // const answersMap: Record<string, string> = {};
    // answers.forEach((answer) => {
    //   answersMap[answer.question_id] = answer.answer_text;
    // });
    // console.log(answersMap);

    // 3. Get latest project result (optional)
    const currentResult = await Database.getProjectResult(projectId);

    // 4. Generate and save next question (returns string)
    const question = await Database.generateAndSaveNextQuestion(
      projectId,
      questionIndex,
      `${project.title}: ${project.description}`,
      answers,
      updatedQuestionSoFar,
      currentResult || undefined
    );

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error generating next question:", error);
    return NextResponse.json(
      { error: "Failed to generate next question" },
      { status: 500 }
    );
  }
}
