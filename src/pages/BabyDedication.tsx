import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { ProgressTracker, defaultSteps } from "@/components/shared/ProgressTracker";
import { ReadingModule } from "@/components/shared/ReadingModule";
import { TestInterface } from "@/components/shared/TestInterface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Award, Download, Heart } from "lucide-react";

const dedicationTopics = [
  {
    id: "understanding",
    title: "Understanding Baby Dedication",
    content: `Baby dedication is a meaningful ceremony where parents publicly commit to raising their child according to biblical principles and the church community pledges to support the family.

Unlike baptism, which is a personal decision of faith, baby dedication is about parental commitment and community support. It's based on biblical examples like Hannah dedicating Samuel to the Lord.

Key Principles:
• Acknowledgment that children are gifts from God
• Parental commitment to raise children in Christian values
• Church community's pledge to support the family
• Setting spiritual foundations early in life

Biblical Foundation:
"Train up a child in the way he should go, and when he is old he will not depart from it." - Proverbs 22:6

"Children are a heritage from the Lord, offspring a reward from him." - Psalm 127:3`,
    estimatedTime: "6 minutes",
    completed: false
  },
  {
    id: "responsibilities",
    title: "Parental Responsibilities and Commitment",
    content: `As parents dedicating your child, you're making important commitments that will shape your child's spiritual foundation.

Primary Commitments:
• Model Christian character and values
• Provide spiritual instruction and guidance
• Regular prayer for your child
• Active participation in church community
• Creating a Christian home environment

Practical Applications:
• Daily family devotions or prayer time
• Teaching biblical principles through everyday situations
• Demonstrating love, forgiveness, and grace
• Encouraging questions about faith
• Building relationships with other Christian families

Long-term Vision:
• Raising children who know and love God
• Equipping them to make their own faith decisions
• Preparing them to be positive influences in the world
• Supporting them through life's challenges with biblical wisdom

Remember: You're not perfect parents, but committed parents trusting God's grace.`,
    estimatedTime: "8 minutes",
    completed: false
  },
  {
    id: "ceremony",
    title: "The Dedication Ceremony and Community",
    content: `The baby dedication ceremony is a beautiful celebration involving the entire church family.

What Happens During the Ceremony:
• Pastoral prayer over the child and family
• Public commitment from parents
• Church pledge to support the family
• Special blessing for the child
• Celebration with the congregation

Preparing for the Ceremony:
• Complete this preparation course
• Meet with pastoral team
• Invite family and friends
• Consider sharing your story (optional)
• Prepare any special requests

The Church's Role:
• Pray for your family regularly
• Provide spiritual support and encouragement
• Offer practical help when needed
• Create safe spaces for children to learn and grow
• Connect families with resources and community

After the Dedication:
• Continue growing in your faith as a family
• Participate in family ministries and programs
• Build relationships with other families
• Seek guidance and support when needed
• Trust God's faithfulness in your parenting journey`,
    estimatedTime: "7 minutes",
    completed: false
  }
];

const dedicationQuestions = [
  {
    id: "q1",
    question: "Baby dedication is primarily about:",
    options: ["The baby's salvation", "Parental commitment and community support", "Church membership", "Infant baptism"],
    correctAnswer: 1,
    explanation: "Baby dedication focuses on parents' commitment to raise their child biblically and the church's pledge to support them."
  },
  {
    id: "q2",
    question: "According to Proverbs 22:6, parents should:",
    options: ["Let children choose their own path", "Train children in the way they should go", "Wait until children are older to teach them", "Focus only on academic education"],
    correctAnswer: 1,
    explanation: "This verse emphasizes the importance of early spiritual training and guidance."
  },
  {
    id: "q3",
    question: "The church community's role in baby dedication includes:",
    options: ["Taking over parental responsibilities", "Pledging to support the family", "Making decisions for the child", "Providing financial support only"],
    correctAnswer: 1,
    explanation: "The church commits to supporting, encouraging, and praying for the family as they raise their child."
  },
  {
    id: "q4",
    question: "What is a key difference between baby dedication and baptism?",
    options: ["There is no difference", "Dedication is about parental commitment, baptism is personal faith", "Dedication is only for boys", "Baptism happens first"],
    correctAnswer: 1,
    explanation: "Dedication involves parental commitment while baptism is an individual's personal declaration of faith."
  },
  {
    id: "q5",
    question: "After baby dedication, parents should focus on:",
    options: ["Completing church requirements", "Modeling Christian character and providing spiritual instruction", "Waiting until the child is older", "Only attending church services"],
    correctAnswer: 1,
    explanation: "The ongoing responsibility is to model faith and provide consistent spiritual guidance."
  }
];

const BabyDedication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status from localStorage
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    setIsAuthenticated(!!userRole && !!userEmail);
  }, []);
  const [currentStage, setCurrentStage] = useState<"reading" | "test" | "complete">("reading");
  const [readingTopics, setReadingTopics] = useState(dedicationTopics);
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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Baby Dedication Preparation</h1>
            <p className="text-muted-foreground">
              Prepare to dedicate your child and commit to raising them in faith
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
                <h2 className="text-2xl font-semibold mb-2">Baby Dedication Assessment</h2>
                <p className="text-muted-foreground">
                  Test your understanding of baby dedication principles and commitments
                </p>
              </div>
              <TestInterface
                questions={dedicationQuestions}
                onComplete={handleTestComplete}
                passingScore={75}
              />
            </div>
          )}

          {currentStage === "complete" && (
            <Card className="border-primary bg-primary/5">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Award className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Baby Dedication Preparation Complete!</CardTitle>
                <CardDescription>
                  Congratulations! You've successfully completed the baby dedication preparation course.
                  Final Score: {testScore}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You're now ready to dedicate your child before God and the church community. 
                    Contact our pastoral team to schedule your baby dedication ceremony.
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Next Steps:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Schedule a meeting with pastoral team</li>
                      <li>• Plan your ceremony details</li>
                      <li>• Invite family and friends</li>
                      <li>• Continue growing as a family of faith</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline">
                      Schedule Ceremony
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

export default BabyDedication;