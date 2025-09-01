/*import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!, // Keep this key secret
});

interface ProjectResult {
  problem_statement: string;
  features: string[];
  tech_stack: string[];
  roadmap: Array<{
    phase: string;
    tasks: string[];
  }>;
  success_metrics?: string[]; // optional for flexibility
  risks_and_mitigations?: Array<{
    risk: string;
    mitigation: string;
  }>;
  future_scope?: string[];
  integrations?: string[];
  cost_estimate?: string;
  roles_and_responsibilities?: string[]; // changed to plural for clarity
  other_notes?: string;
  refinement_history?: Array<{
    feedback: string;
    updated_at: string; // ISO timestamp
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { action, idea, answers, questionIndex, currentResult, feedback } =
      await req.json();

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    if (action === "generatePlan") {
      return NextResponse.json(await generateProjectPlan(idea, answers));
    }

    if (action === "refinePlan") {
      return NextResponse.json(
        await refineProjectPlan(currentResult, feedback)
      );
    }

    if (action === "nextQuestion") {
      return NextResponse.json({
        question: await generateNextQuestion(
          idea,
          answers,
          questionIndex,
          currentResult
        ),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}


async function generateProjectPlan(
  idea: string,
  answers: Record<string, string>
): Promise<ProjectResult> {
  console.log(answers);
  const prompt = `You are an AI Project Architect with 15+ years of experience. 
Your job is to take a user's project idea and Q&A answers, then generate a structured and actionable project plan.

Always respond ONLY in valid JSON. No extra commentary. No code fences.

JSON Schema:
{
  "problem_statement": "string",
  "features": ["string"],
  "tech_stack": ["string"],
  "roadmap": [{"phase": "string", "tasks": ["string"]}],
  "success_metrics": ["string"],
  "risks_and_mitigations": [{"risk": "string", "mitigation": "string"}],
  "future_scope": ["string"],
  "integrations": ["string"],
  "cost_estimate": "string",
  "roles_and_responsibilities": ["string"],
  "other_notes": "string"
}

Inputs:
- Project Idea: ${idea}
- User Answers: ${JSON.stringify(answers, null, 2)}

Guidelines:
1. **Builder Type Awareness:** If builder type is provided (Student, Founder, Hobbyist), tailor the plan:
   - Students: emphasize academic outcomes, manageable complexity, documentation.
   - Founders: emphasize market fit, monetization, MVP-first, scalability.
   - Hobbyists: emphasize fun, exploration, simplicity, low cost.
   If builder type is unclear, assume Founder by default.
2. **Problem Statement:** A detailed MVP definition aligning with the builder’s goals.
3. **Features:** Include user-requested features plus any essential missing ones.
4. **Tech Stack:** Divide into layers (frontend, backend, DB, auth, etc.) with brief reasoning.
5. **Roadmap:** Detailed, phased steps (tailor phases to builder type).
6. **Success Metrics:** Clear KPIs or indicators of success.
7. **Risks & Mitigations:** Anticipate top 2–4 risks with ways to mitigate them.
8. **Future Scope:** Optional or advanced features to consider later.
9. **Integrations:** Suggest APIs/tools to enhance the project.
10. **Cost Estimate:** High-level estimate (time, resources, or budget).
11. **Roles & Responsibilities:** Suggested roles if multiple people are involved.
12. **Other Notes:** Any additional tips or assumptions.
13. If any answer is missing/garbage, silently assume defaults and proceed.

Output:
Return ONLY valid JSON following the schema above.

`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as ProjectResult;
}


async function refineProjectPlan(
  currentResult: ProjectResult,
  feedback: string
): Promise<ProjectResult> {
  const prompt = `You are an AI Project Architect refining an existing project plan.

Inputs:
- Current Project Plan: ${JSON.stringify(currentResult, null, 2)}
- User Feedback: ${feedback}


Respond ONLY with a single valid JSON object. No extra text, comments, or code fences.

JSON Schema:
{
  "problem_statement": "string",
  "features": ["string"],
  "tech_stack": ["string"],
  "roadmap": [{"phase": "string", "tasks": ["string"]}],
  "success_metrics": ["string"],
  "risks_and_mitigations": [{"risk": "string", "mitigation": "string"}],
  "future_scope": ["string"],
  "integrations": ["string"],
  "cost_estimate": "string",
  "roles_and_responsibilities": ["string"],
  "other_notes": "string"
}

Refinement Rules:
1. **Builder Type Awareness:** Adjust focus based on builder type (academic, business, or exploration) assuming from the current project plan. Assume Founder if unknown.
2. Merge user feedback into the current plan; enhance or correct content. 
3. If feedback is missing, irrelevant, or garbage, make reasonable silent assumptions and improve the plan anyway.
4. Keep "problem_statement" as an MVP definition.
5. Maintain and improve all other sections; add missing details where possible.
6. Ensure the refined plan stays actionable and clear.

Output:
Return ONLY the JSON object, strictly following the schema above.

`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as ProjectResult;
}

async function generateNextQuestion(
  idea: string,
  answers: Record<string, string>,
  questionIndex: number,
  currentResult?: ProjectResult
): Promise<string> {
  // console.log("In api of groq");
  // console.log(questionIndex);
  const prompt = `
You are an expert AI assistant helping to gather all essential details to create a complete and actionable project plan.  

Inputs:  
- Project Idea: ${idea}  
- User Answers so far: ${JSON.stringify(answers, null, 2)}  
- Current Project Plan: ${
    currentResult ? JSON.stringify(currentResult, null, 2) : "None"
  }  
- Question Index (0-9): ${questionIndex}  

Your Goal:  
Ask a maximum of 10 highly relevant and non-repetitive questions to fully understand the project. Each question should fill the most important knowledge gap.

We want to build a tool that feels like a personal AI mentor for builders at all levels:
- Students can confidently define academic projects.
- Founders can shape raw ideas into MVP roadmaps.
- Hobbyists can get clear guidance to explore their interests.

**Special Rule for Question Index 0:**  
If questionIndex is 0, the first question must always identify the builder type (e.g., Student, Founder, Hobbyist).

**Key Guidelines:**  
1. Analyze the idea and previous answers carefully.  
2. After questionIndex 0, **tailor each question** to the builder type:  
   - **Students:** Focus on academic goals, learning outcomes, project complexity, evaluation criteria.  
   - **Founders:** Focus on market need, MVP scope, monetization, scalability, integrations.  
   - **Hobbyists:** Focus on fun, exploration, features to try, ease of use, budget constraints.  
3. Identify the single most critical missing detail for each step.  
4. If the last answer is incomplete, irrelevant, or garbage (e.g., "pp", "idk", blank, random characters), **assume a reasonable default** based on the context, and **move to the next most important question**. **Never repeat the same question.**  
5. If needed, ask follow-up questions for clarification, but avoid redundancy.  
6. Stop asking questions once questionIndex reaches 10.  
7. Focus on key areas: purpose, target users, features, tech stack, integrations, security, monetization, scalability, timeline, and success metrics.  

**Output Format:**  
Respond ONLY in this valid JSON object with this structure, and nothing else:  
{
  "question": "What is your preferred authentication method?"
}
`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 500,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");
  //console.log(content);

  const parsed = JSON.parse(content) as { question: string };
  return parsed.question;
}

*/

import { NextRequest, NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { LangChainTracer } from "langchain/callbacks";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

// -----------------------------
// Schema & Parser
// -----------------------------
const projectPlanSchema = z.object({
  problem_statement: z.string(),
  features: z.array(z.string()),
  tech_stack: z.array(z.string()),
  roadmap: z.array(
    z.object({
      phase: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  success_metrics: z.array(z.string()),
  risks_and_mitigations: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
    })
  ),
  future_scope: z.array(z.string()),
  integrations: z.array(z.string()),
  cost_estimate: z.string(),
  roles_and_responsibilities: z.array(z.string()),
  other_notes: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(projectPlanSchema);
const formatInstructions = parser.getFormatInstructions();

// -----------------------------
// Model
// -----------------------------
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// -----------------------------
// Prompts
// -----------------------------
const generatePlanPrompt = ChatPromptTemplate.fromTemplate(`
You are an AI Project Architect with 15+ years of experience. 
Your job is to take a user's project idea and Q&A answers, then generate a structured and actionable project plan.

Always respond ONLY in valid JSON. No extra commentary. No code fences.

JSON Schema:
{{
  "problem_statement": "string",
  "features": ["string"],
  "tech_stack": ["string"],
  "roadmap": [{{"phase": "string", "tasks": ["string"]}}],
  "success_metrics": ["string"],
  "risks_and_mitigations": [{{"risk": "string", "mitigation": "string"}}],
  "future_scope": ["string"],
  "integrations": ["string"],
  "cost_estimate": "string",
  "roles_and_responsibilities": ["string"],
  "other_notes": "string"
}}

Inputs:
- Project Idea: {idea}
- User Answers: {answers}

Guidelines:
1. **Builder Type Awareness:** If builder type is provided (Student, Founder, Hobbyist), tailor the plan:
   - Students: emphasize academic outcomes, manageable complexity, documentation.
   - Founders: emphasize market fit, monetization, MVP-first, scalability.
   - Hobbyists: emphasize fun, exploration, simplicity, low cost.
   If builder type is unclear, assume Founder by default.
2. **Problem Statement:** A detailed MVP definition aligning with the builder’s goals.
3. **Features:** Include user-requested features plus any essential missing ones.
4. **Tech Stack:** Divide into layers (frontend, backend, DB, auth, etc.) with brief reasoning.
5. **Roadmap:** Detailed, phased steps (tailor phases to builder type).
6. **Success Metrics:** Clear KPIs or indicators of success.
7. **Risks & Mitigations:** Anticipate top 2–4 risks with ways to mitigate them.
8. **Future Scope:** Optional or advanced features to consider later.
9. **Integrations:** Suggest APIs/tools to enhance the project.
10. **Cost Estimate:** High-level estimate (time, resources, or budget).
11. **Roles & Responsibilities:** Suggested roles if multiple people are involved.
12. **Other Notes:** Any additional tips or assumptions.
13. If any answer is missing/garbage, silently assume defaults and proceed.

Output:
Return ONLY valid JSON following the schema above.
`);

const refinePlanPrompt = ChatPromptTemplate.fromTemplate(`
You are an AI Project Architect refining an existing project plan.

Inputs:
- Current Project Plan: {current}
- User Feedback: {feedback}


Respond ONLY with a single valid JSON object. No extra text, comments, or code fences.

JSON Schema:
{{
  "problem_statement": "string",
  "features": ["string"],
  "tech_stack": ["string"],
  "roadmap": [{{"phase": "string", "tasks": ["string"]}}],
  "success_metrics": ["string"],
  "risks_and_mitigations": [{{"risk": "string", "mitigation": "string"}}],
  "future_scope": ["string"],
  "integrations": ["string"],
  "cost_estimate": "string",
  "roles_and_responsibilities": ["string"],
  "other_notes": "string"
}}

Refinement Rules:
1. **Builder Type Awareness:** Adjust focus based on builder type (academic, business, or exploration) assuming from the current project plan. Assume Founder if unknown.
2. Merge user feedback into the current plan; enhance or correct content. 
3. If feedback is missing, irrelevant, or garbage, make reasonable silent assumptions and improve the plan anyway.
4. Keep "problem_statement" as an MVP definition.
5. Maintain and improve all other sections; add missing details where possible.
6. Ensure the refined plan stays actionable and clear.

Output:
Return ONLY the JSON object, strictly following the schema above.
`);

const nextQuestionPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert AI assistant helping to gather all essential details to create a complete and actionable project plan.  

Inputs:  
- Project Idea: {idea}  
- User Answers so far: {answers}  
- Current Project Plan: {current}
- Question Index (0-9): {index}  
- Already Asked Questions: {updatedQuestionSoFar}


Your Goal:  
Ask a maximum of 10 highly relevant and non-repetitive questions to fully understand the project. Each question should fill the most important knowledge gap.

We want to build a tool that feels like a personal AI mentor for builders at all levels:
- Students can confidently define academic projects.
- Founders can shape raw ideas into MVP roadmaps.
- Hobbyists can get clear guidance to explore their interests.

**Special Rule for Question Index 0:**  
If questionIndex is 0, the first question must always identify the builder type (e.g., Student, Founder, Hobbyist).

**Key Guidelines:**  
1. Analyze {idea}, {answers}, {updatedQuestionSoFar}, and {current} carefully.  
2. NEVER repeat, rephrase, or overlap with any question in {updatedQuestionSoFar}.  
   - If the most important knowledge gap overlaps with a previous question, SKIP it and move to the next most important gap.  
3. After questionIndex 0, tailor each question to the builder type:  
   - **Students:** academic goals, learning outcomes, evaluation criteria.  
   - **Founders:** market need, MVP scope, monetization, scalability, integrations.  
   - **Hobbyists:** fun, exploration, ease of use, budget.  
4. If the answer to a previous question is blank, garbage, or irrelevant (e.g., "pp", "idk", random chars), assume a reasonable default based on the context and CONTINUE without repeating the question.  
5. Stop asking questions once questionIndex reaches 10.  
6. Focus only on essential areas: purpose, target users, features, tech stack, integrations, security, monetization, scalability, timeline, and success metrics.  
**Output Format:**  
Respond ONLY in this valid JSON object with this structure, and nothing else:  
{{"question": "string"}}
`);

function extractContent(content: any): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    // For LangChain: array of complex AIMessageChunk content
    return content
      .filter(
        (c) =>
          typeof c === "object" &&
          c.type === "text" &&
          typeof c.text === "string"
      )
      .map((c) => c.text)
      .join("");
  }
  if (typeof content === "object" && content !== null && "text" in content) {
    // Sometimes it's a single chunk object: { type: "text", text: "..." }
    return (content as any).text || "";
  }
  return "";
}

// -----------------------------
// Functions (LangChain-powered)
// -----------------------------
async function generateProjectPlan(idea: string, answers: any) {
  const input = await generatePlanPrompt.format({
    instructions: formatInstructions,
    idea,
    answers: JSON.stringify(answers ?? {}, null, 2),
  });
  const response = await llm.invoke(input);
  const contentStr = extractContent(response.content);
  return parser.parse(contentStr);
}

async function refineProjectPlan(currentResult: any, feedback: string) {
  const input = await refinePlanPrompt.format({
    instructions: formatInstructions,
    current: JSON.stringify(currentResult ?? {}, null, 2),
    feedback,
  });
  const response = await llm.invoke(input);
  const contentStr = extractContent(response.content);
  return parser.parse(contentStr);
}

async function generateNextQuestion(
  idea: string,
  answers: any,
  updatedQuestionSoFar: String[],
  questionIndex: number,
  currentResult?: any
): Promise<string> {
  const input = await nextQuestionPrompt.format({
    idea,
    answers: JSON.stringify(answers ?? {}, null, 2),
    updatedQuestionSoFar: JSON.stringify(updatedQuestionSoFar ?? {}, null, 2),
    current: currentResult ? JSON.stringify(currentResult, null, 2) : "None",
    index: questionIndex,
  });
  const response = await llm.invoke(input);
  const parsed = JSON.parse(response.content as string);
  //console.log(parsed.question);
  return parsed.question;
}

// -----------------------------
// LangGraph Workflow
// -----------------------------
// const MyState = Annotation.Root({
//   action: Annotation<string>(),
//   data: Annotation<any>(),
// });

// // 2. Create graph with state
// const workflow = new StateGraph(MyState)
//   // Add nodes first to register their names with the graph's type system
//   .addNode("generatePlan", async ({ data }) => {
//     // your node logic here
//     return { action: "done", data: {} };
//   })
//   .addNode("refinePlan", async ({ data }) => {
//     return { action: "done", data: {} };
//   })
//   .addNode("nextQuestion", async ({ data }) => {
//     return { action: "done", data: {} };
//   });

// // 3. Now safely add edges using registered node names and special constants
// workflow
//   .addEdge(START, "generatePlan")
//   .addEdge(START, "refinePlan")
//   .addEdge(START, "nextQuestion")
//   .addEdge("generatePlan", END)
//   .addEdge("refinePlan", END)
//   .addEdge("nextQuestion", END);

// const planGraph = workflow.compile();

const MyState = Annotation.Root({
  action: Annotation<string>(),
  data: Annotation<any>(),
});

const workflow = new StateGraph(MyState)
  // --- Generate Project Plan ---
  .addNode("generatePlan", async ({ data }) => {
    console.log("👉 Running generatePlan node");

    const { idea, answers } = data;
    const plan = await generateProjectPlan(idea, answers);

    // return {
    //   data: {
    //     ...data,
    //     step: "generated",
    //     currentResult: plan,
    //   },
    // };
    return {
      data: plan,
    };
  })

  // --- Refine Project Plan ---
  .addNode("refinePlan", async ({ data }) => {
    console.log("👉 Running refinePlan node");

    const { currentResult, feedback } = data;
    const refined = await refineProjectPlan(currentResult, feedback);

    // return {
    //   data: {
    //     ...data,
    //     step: "refined",
    //     currentResult: refined,
    //   },
    // };
    return {
      data: refined,
    };
  })

  // --- Next Question ---
  .addNode("nextQuestion", async ({ data }) => {
    console.log("👉 Running nextQuestion node");

    const {
      idea,
      answers,
      questionIndex,
      currentResult,
      updatedQuestionSoFar,
    } = data;
    const question = await generateNextQuestion(
      idea,
      answers,
      questionIndex,
      currentResult,
      updatedQuestionSoFar
    );

    // return {
    //   data: {
    //     ...data,
    //     step: "nextQuestion",
    //     questionIndex: (questionIndex ?? 0) + 1,
    //     currentQuestion: question,
    //   },
    // };

    return {
      data: {
        question: question,
      },
    };
  });

// Route based on `action`
workflow.addConditionalEdges(START, (state) => state.action, {
  generatePlan: "generatePlan",
  refinePlan: "refinePlan",
  nextQuestion: "nextQuestion",
});

// End each node
workflow
  .addEdge("generatePlan", END)
  .addEdge("refinePlan", END)
  .addEdge("nextQuestion", END);

const planGraph = workflow.compile();

// -----------------------------
// Next.js API Handler
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      idea,
      answers,
      questionIndex,
      currentResult,
      feedback,
      updatedQuestionSoFar,
    } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    // Enable LangSmith tracing
    const tracer = new LangChainTracer({
      projectName: process.env.LANGCHAIN_PROJECT || "project-planner",
    });

    const result = await planGraph.invoke(
      {
        action,
        data: {
          idea,
          answers,
          questionIndex,
          currentResult,
          feedback,
          updatedQuestionSoFar,
        },
      },
      { callbacks: [tracer] }
    );
    //console.log(result.data);
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
