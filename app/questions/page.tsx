// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { QuestionCard } from "@/components/question-card";
// import { GradientBackground } from "@/components/gradient-bg";
// import { LoadingSpinner } from "@/components/loading-spinner";
// import { supabase } from "@/lib/supabase";
// import { Database } from "@/lib/db";
// import { toast } from "sonner";

// const QUESTIONS = [
//   "What problem does your project solve?",
//   "Who is your target audience or user base?",
//   "What are the key features you want to include?",
//   "What's your preferred technology stack or platform?",
//   "What's your timeline for this project?",
//   "What's your budget range or resource constraints?",
//   "How will users interact with your solution?",
//   "What makes your project unique or different?",
//   "How will you measure success?",
//   "What are potential challenges you foresee?",
// ];

// export default function QuestionsPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const projectId = searchParams.get("projectId");

//   const [currentStep, setCurrentStep] = useState(1);
//   const [answers, setAnswers] = useState<Record<number, string>>({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) {
//         router.push("/auth");
//         return;
//       }

//       if (!projectId) {
//         router.push("/dashboard");
//         return;
//       }

//       // Load existing answers if any
//       try {
//         const projectAnswers = await Database.getProjectAnswers(projectId);
//         const answersMap: Record<number, string> = {};
//         projectAnswers.forEach((answer, index) => {
//           answersMap[index + 1] = answer.answer_text;
//         });
//         setAnswers(answersMap);

//         // Find the first unanswered question
//         const firstUnanswered = QUESTIONS.findIndex(
//           (_, index) => !answersMap[index + 1]
//         );
//         if (firstUnanswered !== -1) {
//           setCurrentStep(firstUnanswered + 1);
//         } else if (Object.keys(answersMap).length === QUESTIONS.length) {
//           // All questions answered, redirect to results
//           router.push(`/results?projectId=${projectId}`);
//           return;
//         }
//       } catch (error) {
//         toast.error("Failed to load previous answers");
//       }

//       setLoading(false);
//     };
//     checkAuth();
//   }, [router, projectId]);

// const saveAnswer = async (questionIndex: number, answer: string) => {
//   console.log("Save Ans-1");
//   if (!projectId) return;
//   console.log("Save Ans-2");
//   try {
//     console.log("Save Ans-3");
//     await Database.saveAnswer(
//       projectId,
//       QUESTIONS[questionIndex],
//       questionIndex,
//       answer
//     );
//     console.log("Save Ans-4");
//   } catch (error) {
//     console.log("Save Ans-5");
//     toast.error("Failed to save answer");
//   }
// };

//   const handleNext = async (answer: string) => {
//     console.log("Handle Next-1");
//     setAnswers((prev) => ({ ...prev, [currentStep]: answer }));
//     await saveAnswer(currentStep, answer);
//     console.log("Handle Next-2");
//     if (currentStep < QUESTIONS.length) {
//       setCurrentStep(currentStep + 1);
//       console.log("Handle Next-3");
//     } else {
//       // All questions completed, redirect to results
//       router.push(`/results?projectId=${projectId}`);
//       console.log("Handle Next-4");
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSkip = async () => {
//     if (currentStep < QUESTIONS.length) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       router.push(`/results?projectId=${projectId}`);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <GradientBackground />
//         <LoadingSpinner size={32} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       <GradientBackground />
//       <QuestionCard
//         question={QUESTIONS[currentStep - 1]}
//         currentStep={currentStep}
//         totalSteps={QUESTIONS.length}
//         onNext={handleNext}
//         onPrevious={handlePrevious}
//         onSkip={handleSkip}
//         initialValue={answers[currentStep] || ""}
//         canGoBack={currentStep > 1}
//       />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { GradientBackground } from "@/components/gradient-bg";
import { LoadingSpinner } from "@/components/loading-spinner";
import { toast } from "sonner";
import { getQuestion } from "@/lib/api";
import { Database } from "@/lib/db";

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [questionsSoFar, setQuestionsSoFar] = useState<string[]>([]);

  // useEffect(() => {
  //   const init = async () => {
  //     if (!projectId) {
  //       router.push("/dashboard");
  //       return;
  //     }

  //     try {
  //       console.log("Getting questions......");
  //       const res = await getQuestions(projectId);
  //       // if (!res.ok) throw new Error("Failed to load first question");
  //       // const data = await res.json();
  //       //console.log(res);
  //       setQuestion(res[0].question_text);
  //     } catch (err) {
  //       toast.error("Failed to load question");
  //     }
  //     setLoading(false);
  //   };

  //   init();
  // }, [projectId, router]);

  useEffect(() => {
    const init = async () => {
      //console.log("after calling init");
      if (!projectId) {
        router.push("/dashboard");
        return;
      }
      //console.log("before calling try");

      try {
        //console.log("Getting question...");
        //console.log("before calling getQuestion in apt.ts");
        //console.log(Object.keys(answers).length);
        //console.log(answers);
        const question = await getQuestion(
          projectId,
          Object.keys(answers).length,
          answers,
          questionsSoFar
        ); // returns string
        setQuestion(question);
        // setCurrentStep(currentStep + 1);
      } catch (err) {
        toast.error("Failed to load question");
      }

      setLoading(false);
    };

    //console.log("before calling init");

    init();
  }, [projectId, router]);

  // const handleNext = async (answer: string) => {
  //   if (!projectId || !question) return;
  //   setLoading(true);

  //   try {
  //     const res = await fetch(`/api/questions`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ projectId, previousQuestion: question, answer }),
  //     });
  //     const data = await res.json();

  //     if (data.done) {
  //       router.push(`/results?projectId=${projectId}`);
  //       return;
  //     }

  //     setQuestion(data.question);
  //     setStep((s) => s + 1);
  //   } catch (err) {
  //     toast.error("Failed to get next question");
  //   }

  //   setLoading(false);
  // };

  const saveAnswer = async (questionIndex: number, answer: string) => {
    //console.log("Save Ans-1");
    if (!projectId) return;
    //console.log("Save Ans-2");
    try {
      // console.log("Save Ans-3");
      await Database.saveAnswer(projectId, question, questionIndex, answer);
      //console.log("Save Ans-4");
    } catch (error) {
      //console.log("Save Ans-5");
      toast.error("Failed to save answer");
    }
  };

  const handleNext = async (answer: string) => {
    // Compute the new answers object first
    const updatedAnswers = { ...answers, [question]: answer };

    // Update state
    setAnswers(updatedAnswers);

    const updatedQuestionSoFar = questionsSoFar;
    updatedQuestionSoFar.push(question);
    setQuestionsSoFar(updatedQuestionSoFar);

    // Now use the updated object
    // console.log(Object.keys(updatedAnswers).length);
    //console.log(updatedAnswers);

    await saveAnswer(Object.keys(updatedAnswers).length, answer);

    if (Object.keys(updatedAnswers).length < 10) {
      setCurrentStep((prev) => prev + 1);

      if (!projectId) {
        router.push("/dashboard");
        return;
      }

      setQuestion("Loading Question......");

      const nextQuestion = await getQuestion(
        projectId,
        Object.keys(updatedAnswers).length,
        updatedAnswers,
        updatedQuestionSoFar
      );

      setQuestion(nextQuestion);
    } else {
      router.push(`/results?projectId=${projectId}`);
    }
  };

  // Dummy handlers for now (can be enhanced later)
  const handlePrevious = () => {
    toast.info("Previous button not implemented yet");
  };

  const handleSkip = async () => {
    await handleNext("");
    toast.info("Question skipped");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <p className="text-white text-xl">No question available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GradientBackground />
      <QuestionCard
        question={question}
        currentStep={currentStep}
        totalSteps={10} // unknown dynamic length
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        canGoBack={false}
      />
    </div>
  );
}
