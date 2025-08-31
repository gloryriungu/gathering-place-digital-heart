import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { ProgressTracker, defaultSteps } from "@/components/shared/ProgressTracker";
import { ReadingModule } from "@/components/shared/ReadingModule";
import { TestInterface } from "@/components/shared/TestInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Award, Download } from "lucide-react";

const baptismTopics = [
  {
    id: "meaning",
    title: "What is Baptism?",
    content: `Baptism is a public declaration of your faith in Jesus Christ and your commitment to follow Him. It symbolizes the spiritual cleansing from sin and your new life in Christ.

The word "baptism" comes from the Greek word "baptizo," which means to immerse or submerge. This act represents being buried with Christ in His death and raised with Him in His resurrection.

Biblical Foundation:
"Therefore we were buried with Him through baptism into death, that just as Christ was raised from the dead by the glory of the Father, even so we also should walk in newness of life." - Romans 6:4

Key Meanings:
• Public testimony of your faith
• Symbol of spiritual cleansing
• Declaration of new life in Christ
• Following Jesus' example`,
    estimatedTime: "5 minutes",
    completed: false
  },
  {
    id: "biblical",
    title: "Biblical Foundation of Baptism",
    content: `Baptism is clearly established in Scripture as a command from Jesus and practice of the early church.

Jesus' Example:
"Then Jesus came from Galilee to John at the Jordan to be baptized by him." - Matthew 3:13

The Great Commission:
"Go therefore and make disciples of all the nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." - Matthew 28:19

Early Church Practice:
"Then Peter said to them, 'Repent, and let every one of you be baptized in the name of Jesus Christ for the remission of sins; and you shall receive the gift of the Holy Spirit.'" - Acts 2:38

Requirements for Baptism:
• Personal faith in Jesus Christ
• Understanding of the Gospel
• Desire to publicly declare your faith
• Commitment to follow Christ`,
    estimatedTime: "7 minutes",
    completed: false
  },
  {
    id: "preparation",
    title: "Preparing for Your Baptism",
    content: `Preparing for baptism is an important step in your spiritual journey. Here's what you need to know:

Before Baptism:
• Reflect on your faith journey
• Prepare your testimony (optional but encouraged)
• Bring a change of clothes
• Consider inviting family and friends

What to Expect:
• Brief meeting with pastoral team
• Simple profession of faith
• Full immersion in water
• Celebration with the church family

After Baptism:
• Continue growing in your faith
• Join a small group or Bible study
• Explore opportunities to serve
• Begin or continue reading the Bible regularly

Common Questions:
• Do I need to be perfect? No, baptism is about declaring your faith, not your perfection
• What if I've been baptized before? Discuss with pastoral team about your specific situation
• Can I be baptized with others? Yes, group baptisms are celebrated!`,
    estimatedTime: "6 minutes",
    completed: false
  }
];

const baptismQuestions = [
  {
    id: "q1",
    question: "What does the word 'baptism' mean in Greek?",
    options: ["To sprinkle", "To immerse or submerge", "To bless", "To dedicate"],
    correctAnswer: 1,
    explanation: "Baptism comes from 'baptizo' meaning to immerse or submerge completely."
  },
  {
    id: "q2",
    question: "According to Romans 6:4, baptism symbolizes:",
    options: ["Joining the church", "Being buried and raised with Christ", "Becoming perfect", "Following traditions"],
    correctAnswer: 1,
    explanation: "Baptism represents dying to sin and rising to new life in Christ."
  },
  {
    id: "q3",
    question: "What is required before baptism?",
    options: ["Church membership", "Perfect behavior", "Personal faith in Jesus Christ", "Completing all church programs"],
    correctAnswer: 2,
    explanation: "The primary requirement is personal faith in Jesus Christ as Lord and Savior."
  },
  {
    id: "q4",
    question: "In the Great Commission, Jesus commands disciples to:",
    options: ["Build churches", "Baptize in the name of the Trinity", "Create religious rules", "Form committees"],
    correctAnswer: 1,
    explanation: "Jesus specifically commanded baptizing 'in the name of the Father and of the Son and of the Holy Spirit.'"
  },
  {
    id: "q5",
    question: "Baptism is primarily:",
    options: ["A private ritual", "A public declaration of faith", "A church requirement", "A family tradition"],
    correctAnswer: 1,
    explanation: "Baptism is a public testimony of your personal faith in Jesus Christ."
  }
];

const Baptism = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status from localStorage
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    setIsAuthenticated(!!userRole && !!userEmail);
  }, []);
  const [currentStage, setCurrentStage] = useState<"reading" | "test" | "complete">("reading");
  const [readingTopics, setReadingTopics] = useState(baptismTopics);
  const [testScore, setTestScore] = useState<number | null>(null);
  const [testPassed, setTestPassed] = useState(false);

  const handleTopicComplete = (topicId: string) => {
    setReadingTopics(prev => 
      prev.map(topic => 
        topic.id === topicId ? { ...topic, completed: true } : topic
      )
    );
  };

  const handleReadingComplete = () => {
    setCurrentStage("test");
  };

  const handleTestComplete = (score: number, passed: boolean) => {
    setTestScore(score);
    setTestPassed(passed);
    if (passed) {
      setCurrentStage("complete");
    }
  };

  const getProgressSteps = () => {
    const steps = [...defaultSteps];
    
    if (currentStage === "reading") {
      steps[0].status = "current";
      steps[1].status = "upcoming";
      steps[2].status = "upcoming";
    } else if (currentStage === "test") {
      steps[0].status = "completed";
      steps[1].status = "current";
      steps[2].status = "upcoming";
    } else if (currentStage === "complete") {
      steps[0].status = "completed";
      steps[1].status = "completed";
      steps[2].status = "completed";
    }
    
    return steps;
  };

  const getCurrentStep = () => {
    if (currentStage === "reading") return 0;
    if (currentStage === "test") return 1;
    if (currentStage === "complete") return 2;
    return 0;
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

          {/* Progress Tracker */}
          <div className="mb-8">
            <ProgressTracker 
              currentStep={getCurrentStep()} 
              totalSteps={3} 
              steps={getProgressSteps()} 
            />
          </div>

          {/* Content */}
          {currentStage === "reading" && (
            <ReadingModule
              topics={readingTopics}
              onTopicComplete={handleTopicComplete}
              onAllComplete={handleReadingComplete}
            />
          )}

          {currentStage === "test" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Baptism Assessment</h2>
                <p className="text-muted-foreground">
                  Test your understanding of the baptism principles
                </p>
              </div>
              <TestInterface
                questions={baptismQuestions}
                onComplete={handleTestComplete}
                passingScore={80}
              />
            </div>
          )}

          {currentStage === "complete" && (
            <Card className="border-primary bg-primary/5">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Award className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Baptism Preparation Complete!</CardTitle>
                <CardDescription>
                  Congratulations! You've successfully completed the baptism preparation course.
                  Final Score: {testScore}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You're now ready to take the next step in your faith journey. 
                    Contact our pastoral team to schedule your baptism ceremony.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline">
                      Schedule Baptism
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Baptism;