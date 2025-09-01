// import { supabase } from "./supabase";

// export interface DbProject {
//   id: string;
//   user_id: string;
//   title: string;
//   description: string;
//   created_at: string;
// }

// export interface DbQuestion {
//   id: string;
//   question_text: string;
//   order: number;
// }

// export interface DbAnswer {
//   id: string;
//   project_id: string;
//   question_id: string;
//   answer_text: string;
// }

// export interface DbResult {
//   id: string;
//   project_id: string;
//   problem_statement: string;
//   features: string[];
//   tech_stack: string[];
//   roadmap: Array<{ phase: string; tasks: string[] }>;
//   other_notes: string;
// }

// export class Database {
//   static async createProject(
//     userId: string,
//     title: string,
//     description: string
//   ): Promise<DbProject> {
//     const { data, error } = await supabase
//       .from("projects")
//       .insert({
//         user_id: userId,
//         title,
//         description,
//       })
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   }

//   static async getUserProjects(userId: string): Promise<DbProject[]> {
//     const { data, error } = await supabase
//       .from("projects")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false });

//     if (error) throw error;
//     return data || [];
//   }

//   static async getProject(projectId: string): Promise<DbProject | null> {
//     const { data, error } = await supabase
//       .from("projects")
//       .select("*")
//       .eq("id", projectId)
//       .single();

//     if (error && error.code !== "PGRST116") throw error;
//     return data;
//   }

//   static async getQuestions(): Promise<DbQuestion[]> {
//     const { data, error } = await supabase
//       .from("questions")
//       .select("*")
//       .order("order");

//     if (error) throw error;
//     return data || [];
//   }

//   static async saveAnswer(
//     projectId: string,
//     questionText: string,
//     questionId: number,
//     answerText: string
//   ): Promise<DbAnswer> {
//     console.log("Db-1");

//     const { data: questionData, error: questionError } = await supabase
//       .from("questions")
//       .upsert({ question_text: questionText, order: questionId as any })
//       .select()
//       .single();

//     //console.log(data);
//     if (questionError) throw questionError;

//     const { data: answerData, error: answerError } = await supabase
//       .from("answers")
//       .upsert({
//         project_id: projectId,
//         question_id: questionData.id,
//         answer_text: answerText,
//       })
//       .select()
//       .single();
//     console.log("Db-2");
//     if (answerError) throw answerError;
//     console.log("Db-3");
//     return answerData;
//   }

//   static async getProjectAnswers(projectId: string): Promise<DbAnswer[]> {
//     const { data, error } = await supabase
//       .from("answers")
//       .select("*")
//       .eq("project_id", projectId);

//     if (error) throw error;
//     return data || [];
//   }

//   static async saveResult(
//     projectId: string,
//     result: Omit<DbResult, "id" | "project_id">
//   ): Promise<DbResult> {
//     const { data, error } = await supabase
//       .from("results")
//       .upsert({
//         project_id: projectId,
//         ...result,
//       })
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   }

//   static async getProjectResult(projectId: string): Promise<DbResult | null> {
//     const { data, error } = await supabase
//       .from("results")
//       .select("*")
//       .eq("project_id", projectId)
//       .single();

//     if (error && error.code !== "PGRST116") throw error;
//     return data;
//   }
// }

import { supabase } from "./supabase";
import {
  generateNextQuestion,
  // NextQuestionsResult,
  ProjectResult,
} from "./groq";

export interface DbNextQuestion {
  id: string;
  project_id: string;
  question_text: string;
  order_num: number;
}

export interface DbProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface DbQuestion {
  id: string;
  question_text: string;
  order: number;
}

export interface DbAnswer {
  id: string;
  project_id: string;
  question_id: string;
  answer_text: string;
}

export interface DbResult {
  id: string;
  project_id: string;
  problem_statement: string;
  features: string[];
  tech_stack: string[];
  roadmap: Array<{ phase: string; tasks: string[] }>;
  other_notes: string;
}

export class Database {
  static async createProject(
    userId: string,
    title: string,
    description: string
  ): Promise<DbProject> {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        title,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserProjects(userId: string): Promise<DbProject[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getProject(projectId: string): Promise<DbProject | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    //console.log(data);
    return data;
  }

  static async getQuestions(): Promise<DbQuestion[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("order");

    if (error) throw error;
    return data || [];
  }

  static async saveAnswer(
    projectId: string,
    questionText: string,
    questionId: number,
    answerText: string
  ): Promise<DbAnswer> {
    //console.log("Db-1");

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .upsert({ question_text: questionText, order: questionId as any })
      .select()
      .single();

    //console.log(data);
    if (questionError) throw questionError;

    const { data: answerData, error: answerError } = await supabase
      .from("answers")
      .upsert({
        project_id: projectId,
        question_id: questionData.id,
        answer_text: answerText,
      })
      .select()
      .single();
    //console.log("Db-2");
    if (answerError) throw answerError;
    //console.log("Db-3");
    return answerData;
  }

  static async getProjectAnswers(projectId: string): Promise<DbAnswer[]> {
    const { data, error } = await supabase
      .from("answers")
      .select("*")
      .eq("project_id", projectId);

    if (error) throw error;
    return data || [];
  }

  static async saveResult(
    projectId: string,
    result: Omit<DbResult, "id" | "project_id">
  ): Promise<DbResult> {
    const { data, error } = await supabase
      .from("results")
      .upsert({
        project_id: projectId,
        ...result,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProjectResult(projectId: string): Promise<DbResult | null> {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    //console.log(data);
    return data;
  }

  // static async generateAndSaveNextQuestions(
  //   projectId: string,
  //   idea: string,
  //   answers: Record<string, string>,
  //   currentResult?: ProjectResult
  // ): Promise<DbNextQuestion[]> {
  //   // 1. Generate next questions from groq.ts
  //   const generated: NextQuestionsResult = await generateNextQuestions(
  //     idea,
  //     answers,
  //     currentResult
  //   );

  //   // 2. Clear old next questions for this project (optional)
  //   await supabase.from("next_questions").delete().eq("project_id", projectId);

  //   // 3. Insert the new ones
  //   const { data, error } = await supabase
  //     .from("next_questions")
  //     .insert(
  //       generated.questions.map((q, index) => ({
  //         project_id: projectId,
  //         question_text: q,
  //         order_num: index + 1,
  //       }))
  //     )
  //     .select();

  //   if (error) throw error;
  //   return data as DbNextQuestion[];
  // }

  static async generateAndSaveNextQuestion(
    projectId: string,
    questionIndex: number,
    idea: string,
    answers: Record<string, string>,
    updatedQuestionSoFar: string[],
    currentResult?: ProjectResult
  ): Promise<string> {
    // 1. Generate next question
    // console.log("In db.ts");
    // console.log(answers);
    const question = await generateNextQuestion(
      idea,
      answers,
      updatedQuestionSoFar,
      questionIndex,
      currentResult
    );

    // 2. Clear old next questions for this project (optional)
    //await supabase.from("next_questions").delete().eq("project_id", projectId);

    // 3. Insert the new one
    // const { data, error } = await supabase
    //   .from("next_questions")
    //   .insert([
    //     {
    //       project_id: projectId,
    //       question_text: question,
    //       order_num: 1,
    //     },
    //   ])
    //   .select();

    // if (error) throw error;
    // return data?.[0]?.question_text || "";
    return question;
  }

  /**
   * Get stored next questions for a project.
   */
  // static async getNextQuestions(projectId: string): Promise<DbNextQuestion[]> {
  //   const { data, error } = await supabase
  //     .from("next_questions")
  //     .select("*")
  //     .eq("project_id", projectId)
  //     .order("order_num");

  //   if (error) throw error;
  //   return data || [];
  // }
}
