import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, ChevronRight, BookOpen } from "lucide-react";

interface ReadingTopic {
  id: string;
  title: string;
  content: string;
  estimatedTime: string;
  completed: boolean;
}

interface ReadingModuleProps {
  topics: ReadingTopic[];
  onTopicComplete: (topicId: string) => void;
  onAllComplete: () => void;
}

export const ReadingModule = ({ topics, onTopicComplete, onAllComplete }: ReadingModuleProps) => {
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  
  const completedCount = topics.filter(topic => topic.completed).length;
  const allCompleted = completedCount === topics.length;

  const toggleTopic = (topicId: string) => {
    setOpenTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const markAsComplete = (topicId: string) => {
    onTopicComplete(topicId);
    if (completedCount + 1 === topics.length) {
      onAllComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Reading Materials</h3>
        </div>
        <Badge variant={allCompleted ? "default" : "secondary"}>
          {completedCount} of {topics.length} completed
        </Badge>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <Card key={topic.id} className={topic.completed ? "border-primary/50 bg-primary/5" : ""}>
            <Collapsible open={openTopics[topic.id]} onOpenChange={() => toggleTopic(topic.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        flex h-6 w-6 items-center justify-center rounded-full
                        ${topic.completed ? "bg-primary text-primary-foreground" : "bg-muted"}
                      `}>
                        {topic.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{topics.indexOf(topic) + 1}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-base">{topic.title}</CardTitle>
                        <CardDescription className="text-sm">
                          Estimated reading time: {topic.estimatedTime}
                        </CardDescription>
                      </div>
                    </div>
                    {openTopics[topic.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="prose prose-sm max-w-none mb-4">
                    <div className="whitespace-pre-line text-muted-foreground">
                      {topic.content}
                    </div>
                  </div>
                  
                  {!topic.completed && (
                    <Button
                      onClick={() => markAsComplete(topic.id)}
                      className="w-full"
                    >
                      Mark as Complete
                    </Button>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {allCompleted && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-semibold">Reading Complete!</h4>
              <p className="text-sm text-muted-foreground">
                You've completed all reading materials. You can now proceed to the test.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};