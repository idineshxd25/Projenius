// import { Groq } from "groq-sdk";

// const groq = new Groq({
//   // apiKey: process.env.GROQ_API_KEY!
// });

// export interface ProjectResult {
//   problem_statement: string;
//   features: string[];
//   tech_stack: string[];
//   roadmap: Array<{
//     phase: string;
//     tasks: string[];
//   }>;
//   other_notes: string;
// }

// export async function generateProjectPlan(
//   idea: string,
//   answers: Record<string, string>
// ): Promise<ProjectResult> {
//   const prompt = `You are an AI Project Architect with an experinece of more than 15 years.
// Your job is to take a user's project idea and their Q&A answers, then generate a structured project plan.

// Always respond ONLY in valid JSON.
// No extra commentary, no markdown, no explanations.

// JSON Schema:
// {
//   "problem_statement": "string",
//   "features": ["string", "string", ...],
//   "tech_stack": ["string", "string", ...],
//   "roadmap": [
//     {"phase": "Phase 1", "tasks": ["task1", "task2"]},
//     {"phase": "Phase 2", "tasks": ["task1", "task2"]}
//   ],
//   "other_notes": "string"
// }

// Project Idea: ${idea}

// User Answers: ${JSON.stringify(answers, null, 2)}

// Guidelines:
// - The problem statement needs to be a MVP definition of the the project idea the user is building.
// - You need to include the features mentioned by users with those what you think needs to be added to make the project standout.
// - For Tech stack, divide it for frontend, backend, give reasons also, Dont solely depend on the answer given by user, Think yourself and give the answer suitable to user questions and the user project idea.
// - For roadmap it has to be very detailed step by step.
// - Be concise but detailed enough for implementation.
// - Adapt based on user answers (e.g., target audience, scale, constraints).
// - If unsure, make reasonable assumptions.
// - Always ensure output is valid JSON and fits schema.`;

//   const completion = await groq.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     model: "llama-3.3-70b-versatile",
//     temperature: 0.7,
//     max_tokens: 2000,
//   });

//   const content = completion.choices[0]?.message?.content;
//   if (!content) {
//     throw new Error("No response from AI");
//   }

//   try {
//     return JSON.parse(content) as ProjectResult;
//   } catch (error) {
//     console.error("Failed to parse AI response:", content);
//     throw new Error("Invalid AI response format");
//   }
// }

// export async function refineProjectPlan(
//   currentResult: ProjectResult,
//   feedback: string
// ): Promise<ProjectResult> {
//   const prompt = `You are an AI Project Architect refining an existing project plan.

// Current Project Plan: ${JSON.stringify(currentResult, null, 2)}

// User Feedback: ${feedback}

// Please refine the project plan based on the feedback. Respond ONLY in valid JSON matching this schema:

// {
//   "problem_statement": "string",
//   "features": ["string", "string", ...],
//   "tech_stack": ["string", "string", ...],
//   "roadmap": [
//     {"phase": "Phase 1", "tasks": ["task1", "task2"]},
//     {"phase": "Phase 2", "tasks": ["task1", "task2"]}
//   ],
//   "other_notes": "string"
// }

// Guidelines:
// - The problem statement needs to be a MVP definition of the the project idea the user is building.
// - You need to include the features mentioned by users with those what you think needs to be added to make the project standout.
// - For Tech stack, divide it for frontend, backend, give reasons also, Dont solely depend on the answer given by user, Think yourself and give the answer suitable to user questions and the user project idea.
// - For roadmap it has to be very detailed step by step.
// - Be concise but detailed enough for implementation.
// - Adapt based on user answers (e.g., target audience, scale, constraints).
// - If unsure, make reasonable assumptions.
// - Always ensure output is valid JSON and fits schema.`;

//   const completion = await groq.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     model: "llama-3.3-70b-versatile",
//     temperature: 0.7,
//     max_tokens: 2000,
//   });

//   const content = completion.choices[0]?.message?.content;
//   if (!content) {
//     throw new Error("No response from AI");
//   }

//   try {
//     return JSON.parse(content) as ProjectResult;
//   } catch (error) {
//     console.error("Failed to parse AI response:", content);
//     throw new Error("Invalid AI response format");
//   }
// }

// import { Groq } from "groq-sdk";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY!,
// });

// export interface ProjectResult {
//   problem_statement: string;
//   features: string[];
//   tech_stack: string[];
//   roadmap: Array<{
//     phase: string;
//     tasks: string[];
//   }>;
//   other_notes: string;
// }

// export interface NextQuestionsResult {
//   questions: string[];
// }

// export async function generateProjectPlan(
//   idea: string,
//   answers: Record<string, string>
// ): Promise<ProjectResult> {
//   const prompt = `You are an AI Project Architect with 15+ years of experience.
// Your job is to take a user's project idea and Q&A answers, then generate a structured project plan.

// Always respond ONLY in valid JSON. No extra commentary.

// JSON Schema:
// {
//   "problem_statement": "string",
//   "features": ["string"],
//   "tech_stack": ["string"],
//   "roadmap": [{"phase": "string", "tasks": ["string"]}],
//   "other_notes": "string"
// }

// Project Idea: ${idea}
// User Answers: ${JSON.stringify(answers, null, 2)}

// Guidelines:
// - Make problem_statement an MVP definition.
// - Include user features plus additional necessary features.
// - Divide tech_stack into frontend, backend with reasoning.
// - Roadmap should be detailed step by step.
// - Concise but implementation-ready.
// - Adapt to user answers and make reasonable assumptions.
// `;

//   const completion = await groq.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: "llama-3.3-70b-versatile",
//     temperature: 0.7,
//     max_tokens: 2000,
//   });

//   const content = completion.choices[0]?.message?.content;
//   if (!content) throw new Error("No response from AI");

//   try {
//     return JSON.parse(content) as ProjectResult;
//   } catch (error) {
//     console.error("Failed to parse AI response:", content);
//     throw new Error("Invalid AI response format");
//   }
// }

// export async function refineProjectPlan(
//   currentResult: ProjectResult,
//   feedback: string
// ): Promise<ProjectResult> {
//   const prompt = `You are an AI Project Architect refining an existing project plan.

// Current Project Plan: ${JSON.stringify(currentResult, null, 2)}

// User Feedback: ${feedback}

// Refine the plan. Respond ONLY in valid JSON:
// {
//   "problem_statement": "string",
//   "features": ["string"],
//   "tech_stack": ["string"],
//   "roadmap": [{"phase": "string", "tasks": ["string"]}],
//   "other_notes": "string"
// }

// Guidelines:
// - Make problem_statement an MVP definition.
// - Include user features plus additional necessary features.
// - Divide tech_stack into frontend, backend with reasoning.
// - Roadmap should be detailed step by step.
// - Concise but implementation-ready.
// - Adapt to user answers and make reasonable assumptions
// `;

//   const completion = await groq.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: "llama-3.3-70b-versatile",
//     temperature: 0.7,
//     max_tokens: 2000,
//   });

//   const content = completion.choices[0]?.message?.content;
//   if (!content) throw new Error("No response from AI");

//   try {
//     return JSON.parse(content) as ProjectResult;
//   } catch (error) {
//     console.error("Failed to parse AI response:", content);
//     throw new Error("Invalid AI response format");
//   }
// }

// /**
//  * Generate follow-up or "next questions" based on the user's idea, answers, and/or plan.
//  */
// // export async function generateNextQuestions(
// //   idea: string,
// //   answers: Record<string, string>,
// //   currentResult?: ProjectResult
// // ): Promise<NextQuestionsResult> {
// //   const prompt = `You are an AI assistant helping gather more details about a project idea.

// // Project Idea: ${idea}
// // User Answers: ${JSON.stringify(answers, null, 2)}
// // ${
// //   currentResult
// //     ? `Current Project Plan: ${JSON.stringify(currentResult, null, 2)}`
// //     : ""
// // }

// // Think of the most important gaps or clarifications needed to make this plan stronger.
// // Respond ONLY in valid JSON like this:
// // {
// //   "questions": [
// //        "What is your preferred authentication method?",
// //       "Do you plan to support mobile devices?",
// //       "What is your budget range?"
// //   ]
// // }
// // `;

// //   const completion = await groq.chat.completions.create({
// //     messages: [{ role: "user", content: prompt }],
// //     model: "llama-3.3-70b-versatile",
// //     temperature: 0.6,
// //     max_tokens: 1000,
// //   });

// //   const content = completion.choices[0]?.message?.content;
// //   if (!content) throw new Error("No response from AI");

// //   try {
// //     return JSON.parse(content) as NextQuestionsResult;
// //   } catch (error) {
// //     console.error("Failed to parse AI response:", content);
// //     throw new Error("Invalid AI response format");
// //   }
// // }

// export async function generateNextQuestion(
//   idea: string,
//   answers: Record<string, string>,
//   questionIndex: number,
//   currentResult?: ProjectResult
// ): Promise<string> {
//   //   const prompt = `You are an AI assistant helping gather more details about a project idea.

//   // Project Idea: ${idea}
//   // User Answers: ${JSON.stringify(answers, null, 2)}
//   // ${
//   //   currentResult
//   //     ? `Current Project Plan: ${JSON.stringify(currentResult, null, 2)}`
//   //     : ""
//   // }

//   // Think of the single most important missing detail or clarification needed to improve this plan.
//   // Respond ONLY in valid JSON like this:
//   // {
//   //   "question": "What is your preferred authentication method?"
//   // }

//   // Guidelines:
//   // - Analyse the User Answers and ask other questions to clarify your doubts about the project Idea. Take all actiosn necessary

//   // `;

//   const prompt = `
// You are an expert AI assistant helping to gather all essential details to create a complete and actionable project plan.

// **Inputs provided:**
// - Project Idea: ${idea}
// - User Answers so far: ${JSON.stringify(answers, null, 2)}
// - Current Project Plan (if available): ${
//     currentResult ? JSON.stringify(currentResult, null, 2) : "None"
//   }
// - Question Index (0-9): ${questionIndex}

// **Your Goal:**
// Ask a maximum of 10 highly relevant and non-repetitive questions to fully understand the project. Each question should fill the most important knowledge gap to improve or complete the plan.

// **Guidelines:**
// 1. Analyze the idea and previous answers carefully before forming the next question.
// 2. Identify the single most critical missing detail or clarification at this stage.
// 3. Avoid repeating questions already answered.
// 4. You have generated ${questionIndex} questions till now. Stop generating questions once ${questionIndex} reaches 10.
// 5. Focus areas to explore: project purpose, target users, key features, technical stack, integrations, security/authentication, monetization, scalability, timeline, and success metrics.
// 6. Respond ONLY in valid JSON like this:
// {
//   "question": "What is your preferred authentication method?"
// }

// `;

//   const completion = await groq.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: "llama-3.3-70b-versatile",
//     temperature: 0.6,
//     max_tokens: 500,
//   });

//   const content = completion.choices[0]?.message?.content;
//   if (!content) throw new Error("No response from AI");

//   try {
//     const parsed = JSON.parse(content) as { question: string };
//     return parsed.question;
//   } catch (error) {
//     console.error("Failed to parse AI response:", content);
//     throw new Error("Invalid AI response format");
//   }
// }

export interface ProjectResult {
  problem_statement: string;
  features: string[];
  tech_stack: string[];
  roadmap: Array<{
    phase: string;
    tasks: string[];
  }>;
  other_notes: string;
}

/**
 * Generate a project plan based on idea and Q&A answers.
 */
export async function generateProjectPlan(
  idea: string,
  answers: Record<string, string>
): Promise<ProjectResult> {
  const res = await fetch("http://localhost:3000/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "generatePlan",
      idea,
      answers,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate plan: ${res.statusText}`);
  }

  // console.log("In groq.ts");
  // console.log(res.json());

  return res.json();
}

/**
 * Refine an existing project plan based on feedback.
 */
export async function refineProjectPlan(
  currentResult: ProjectResult,
  feedback: string
): Promise<ProjectResult> {
  const res = await fetch("http://localhost:3000/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "refinePlan",
      currentResult,
      feedback,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refine plan: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Generate the next follow-up question (max 10 questions total).
 */
export async function generateNextQuestion(
  idea: string,
  answers: Record<string, string>,
  updatedQuestionSoFar: string[],
  questionIndex: number,
  currentResult?: ProjectResult
): Promise<string> {
  // console.log("In goq.ts");
  // console.log(answers);
  const res = await fetch("http://localhost:3000/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "nextQuestion",
      idea,
      answers,
      updatedQuestionSoFar,
      questionIndex,
      currentResult,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get next question: ${res.statusText}`);
  }

  const data = await res.json();
  return data.question;
}
