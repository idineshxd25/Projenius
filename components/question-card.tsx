"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, SkipBack as Skip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface QuestionCardProps {
  question: string;
  currentStep: number;
  totalSteps: number;
  onNext: (answer: string) => void;
  onPrevious: () => void;
  onSkip: () => void;
  initialValue?: string;
  canGoBack: boolean;
}

export function QuestionCard({
  question,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  initialValue = "",
  canGoBack,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState(initialValue);
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    setAnswer(""); // always blank
    // or: setAnswer(initialValue); if you want a prefilled default
  }, [currentStep, initialValue]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl leading-relaxed">
                  {question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[120px] resize-none"
                  autoFocus
                />

                <div className="flex justify-between items-center">
                  <div>
                    {canGoBack && (
                      <Button variant="outline" onClick={onPrevious}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-3">
{/*                     <Button variant="ghost" onClick={onSkip}>
                      <Skip className="h-4 w-4 mr-2" />
                      Skip
                    </Button> */}
                    <Button
                      onClick={() => onNext(answer)}
                      disabled={!answer.trim()}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
