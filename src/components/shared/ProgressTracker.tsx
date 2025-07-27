import { Progress } from "@/components/ui/progress";
import { Check, BookOpen, FileText, Award } from "lucide-react";

interface ProgressStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming";
}

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
}

export const ProgressTracker = ({ currentStep, totalSteps, steps }: ProgressTrackerProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{currentStep} of {totalSteps} steps completed</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center space-y-2">
            <div className={`
              flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
              ${step.status === "completed" 
                ? "bg-primary border-primary text-primary-foreground" 
                : step.status === "current"
                ? "border-primary bg-background text-primary"
                : "border-muted bg-background text-muted-foreground"
              }
            `}>
              {step.status === "completed" ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </div>
            <span className={`
              text-xs text-center max-w-[80px]
              ${step.status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}
            `}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const defaultSteps: ProgressStep[] = [
  {
    id: "reading",
    title: "Reading Materials",
    icon: <BookOpen className="h-5 w-5" />,
    status: "current"
  },
  {
    id: "test",
    title: "Take Test",
    icon: <FileText className="h-5 w-5" />,
    status: "upcoming"
  },
  {
    id: "completion",
    title: "Completion",
    icon: <Award className="h-5 w-5" />,
    status: "upcoming"
  }
];