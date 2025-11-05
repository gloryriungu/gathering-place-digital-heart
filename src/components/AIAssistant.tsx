import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  category?: "qa" | "assessment" | "content";
  downloadUrl?: string;
}

interface AIAssistantProps {
  // Optional API endpoint for AI integration
  apiEndpoint?: string;
  // Optional custom handler for sending messages
  onSendMessage?: (message: string) => Promise<string>;
  // Optional welcome message
  welcomeMessage?: string;
}

export const AIAssistant = ({
  apiEndpoint,
  onSendMessage,
  welcomeMessage = "Hi! How can I help you today?",
}: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      let responseText = "";
      let category: "qa" | "assessment" | "content" | undefined;
      let downloadUrl: string | undefined;

      if (onSendMessage) {
        // Use custom handler if provided
        responseText = await onSendMessage(inputMessage);
      } else if (apiEndpoint) {
        // Use API endpoint if provided
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: inputMessage }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        responseText = data.result || "I received your message!";
        category = data.category;
        downloadUrl = data.download_url;
      } else {
        // Default mock response
        responseText = "Thank you for your message! Please configure the AI integration to get intelligent responses.";
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        category,
        downloadUrl,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorContent = "Sorry, I encountered an error. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = "Unable to connect to the AI service. This may be a network or CORS issue. The chatbot will work when deployed to Netlify.";
      } else if (error instanceof Error) {
        errorContent = `Error: ${error.message}. Please try again or contact support if the issue persists.`;
      }
      
      const errorMessage: Message = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "scale-0"
        )}
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10 text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col gap-1",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  {message.role === "assistant" && message.category && (
                    <Badge variant="secondary" className="text-xs">
                      {message.category.toUpperCase()}
                    </Badge>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.downloadUrl && (
                      <a
                        href={`https://web-production-61663.up.railway.app${message.downloadUrl}`}
                        download
                        className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-md text-sm transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                        Download Document
                      </a>
                    )}
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="h-[60px] w-12 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
