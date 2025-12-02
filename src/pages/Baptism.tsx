import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Navigation } from "@/components/Navigation";
import { ProgramApplicationFlow } from "@/components/preparation/ProgramApplicationFlow";
import { DynamicPreparationCourse } from "@/components/preparation/DynamicPreparationCourse";

const Baptism = () => {
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
            <h1 className="text-3xl font-bold mb-2">Baptism Preparation</h1>
            <p className="text-muted-foreground">
              Prepare for your baptism through study, understanding, and commitment
            </p>
          </div>

          {/* Content */}
          {approvedApplication ? (
            <DynamicPreparationCourse
              applicationId={approvedApplication.applicationId}
              programId={approvedApplication.programId}
              programType="baptism"
            />
          ) : (
            <ProgramApplicationFlow
              programType="baptism"
              onApplicationApproved={handleApplicationApproved}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Baptism;
