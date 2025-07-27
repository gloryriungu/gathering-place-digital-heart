import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface TestInterfaceProps {
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  passingScore?: number;
}

export const TestInterface = ({ questions, onComplete, passingScore = 70 }: TestInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    const finalScore = (correct / questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);
    onComplete(finalScore, finalScore >= passingScore);
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ?.id] !== undefined;

  if (showResults) {
    const passed = score >= passingScore;
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}>
            {passed ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Congratulations!" : "Test Not Passed"}
          </CardTitle>
          <CardDescription>
            You scored {Math.round(score)}% ({Math.round((score / 100) * questions.length)} out of {questions.length} questions correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">AI Feedback</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {passed 
                ? "Excellent work! You've demonstrated a strong understanding of the material. You're ready to proceed to the next step."
                : `You'll need to score ${passingScore}% or higher to pass. Review the reading materials and try again when you're ready.`
              }
            </p>
          </div>
          
          {!passed && (
            <Button 
              className="w-full" 
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setScore(0);
              }}
            >
              Retake Test
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <Badge variant="secondary">
            {Object.keys(answers).length} answered
          </Badge>
        </div>
        <CardTitle className="text-lg">{currentQ?.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={answers[currentQ?.id]?.toString()}
          onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
        >
          {currentQ?.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {currentQuestion === questions.length - 1 ? "Complete Test" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};