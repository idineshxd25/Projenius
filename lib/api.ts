// import { supabase } from "@/lib/supabase";

// export interface Project {
//   id: string;
//   user_id: string;
//   title: string;
//   description: string;
//   created_at: string;
// }

// export interface Question {
//   id: string;
//   question_text: string;
//   order: number;
// }

// export interface Answer {
//   id: string;
//   project_id: string;
//   question_id: string;
//   answer_text: string;
// }

// export interface Result {
//   id: string;
//   project_id: string;
//   problem_statement: string;
//   features: string[];
//   tech_stack: string[];
//   roadmap: Array<{ phase: string; tasks: string[] }>;
//   other_notes: string;
// }

// const {
//   data: { session },
// } = await supabase.auth.getSession();
// const token = session?.access_token;

// // API client functions
// export async function createProject(
//   title: string,
//   description: string
// ): Promise<Project> {
//   console.log("Api-1");
//   const response = await fetch("/api/projects", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ title, description }),
//   });
//   console.log("Api-2");

//   if (!response.ok) {
//     throw new Error("Failed to create project");
//   }

//   return response.json();
// }

// export async function getProjects(): Promise<Project[]> {
//   const response = await fetch("/api/projects");

//   if (!response.ok) {
//     throw new Error("Failed to fetch projects");
//   }

//   return response.json();
// }

// export async function getProject(
//   id: string
// ): Promise<Project & { result?: Result }> {
//   const response = await fetch(`/api/projects/${id}`);

//   if (!response.ok) {
//     throw new Error("Failed to fetch project");
//   }

//   return response.json();
// }

// export async function saveAnswer(
//   projectId: string,
//   questionId: string,
//   answer: string
// ): Promise<void> {
//   const response = await fetch("/api/answers", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       project_id: projectId,
//       question_id: questionId,
//       answer_text: answer,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to save answer");
//   }
// }

// export async function generatePlan(projectId: string): Promise<Result> {
//   const response = await fetch("/api/agent", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ projectId }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to generate plan");
//   }

//   return response.json();
// }

// export async function refinePlan(
//   projectId: string,
//   feedback: string
// ): Promise<Result> {
//   const response = await fetch("/api/agent/refine", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ projectId, feedback }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to refine plan");
//   }

//   return response.json();
// }

import { supabase } from "@/lib/supabase";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  order: number;
}

export interface Answer {
  id: string;
  project_id: string;
  question_id: string;
  answer_text: string;
}

export interface Result {
  id: string;
  project_id: string;
  problem_statement: string;
  features: string[];
  tech_stack: string[];
  roadmap: Array<{ phase: string; tasks: string[] }>;
  other_notes: string;
}

// Helper to get the latest access token
async function getToken(): Promise<string | undefined> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

// API client functions
export async function createProject(
  title: string,
  description: string
): Promise<Project> {
  const token = await getToken();
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}

export async function getProjects(): Promise<Project[]> {
  const token = await getToken();
  const response = await fetch("/api/projects", {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}

export async function getProject(
  id: string
): Promise<Project & { result?: Result }> {
  const token = await getToken();
  const response = await fetch(`/api/projects/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }

  return response.json();
}

export async function saveAnswer(
  projectId: string,
  questionId: string,
  answer: string
): Promise<void> {
  const token = await getToken();
  const response = await fetch("/api/answers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      project_id: projectId,
      question_id: questionId,
      answer_text: answer,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save answer");
  }
}

export async function generatePlan(projectId: string): Promise<Result> {
  const token = await getToken();
  const response = await fetch("https://projenius-virid.vercel.app/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate plan");
  }
  // console.log(
  //   "After calling api/agent for generate new plan" + response.json()
  // );
  return response.json();
}

export async function refinePlan(
  projectId: string,
  feedback: string
): Promise<Result> {
  const token = await getToken();
  const response = await fetch("https://projenius-virid.vercel.app/api/agent/refine", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ projectId, feedback }),
  });

  if (!response.ok) {
    throw new Error("Failed to refine plan");
  }

  return response.json();
}

// export async function getQuestions(projectId: string): Promise<Result> {
//   const token = await getToken();
//   console.log("Going to api page -1 ");
//   const response = await fetch(`/api/questions?projectId=${projectId}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: JSON.stringify({ projectId }),
//   });
//   console.log("Came from api page -1 ");

//   if (!response.ok) {
//     throw new Error("Failed to Get Questions.....");
//   }

//   return response.json();
// }

export async function getQuestion(
  projectId: string,
  questionIndex: number,
  answers: Record<string, string>,
  updatedQuestionSoFar: string[]
): Promise<string> {
  const token = await getToken();
  // console.log("In api.ts");
  // console.log(answers);

  const response = await fetch(
    `/api/questions?projectId=${projectId}&questionIndex=${questionIndex}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        projectId,
        questionIndex,
        answers,
        updatedQuestionSoFar,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get question...");
  }

  const data = await response.json();
  return data.question || "";
}
