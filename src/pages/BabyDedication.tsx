import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Navigation } from "@/components/Navigation";
import { Heart } from "lucide-react";
import { ProgramApplicationFlow } from "@/components/preparation/ProgramApplicationFlow";
import { DynamicPreparationCourse } from "@/components/preparation/DynamicPreparationCourse";

const BabyDedication = () => {
  const [approvedApplication, setApprovedApplication] = useState<{
    applicationId: string;
    programId: string;
  } | null>(null);

  const handleApplicationApproved = (applicationId: string, programId: string) => {
    setApprovedApplication({ applicationId, programId });
  };

  return (
    <AuthGuard>
      <Navigation />
      <div className="min-h-screen bg-background py-8 pt-28">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Baby Dedication Preparation</h1>
            <p className="text-muted-foreground">
              Prepare to dedicate your child and commit to raising them in faith
            </p>
          </div>

          {/* Content */}
          {approvedApplication ? (
            <DynamicPreparationCourse
              applicationId={approvedApplication.applicationId}
              programId={approvedApplication.programId}
              programType="baby_dedication"
            />
          ) : (
            <ProgramApplicationFlow
              programType="baby_dedication"
              onApplicationApproved={handleApplicationApproved}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default BabyDedication;
