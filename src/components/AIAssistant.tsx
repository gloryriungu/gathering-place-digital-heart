/**
 * AIAssistant Component
 * 
 * Language: TypeScript + React
 * 
 * Purpose:
 * - Floating AI chatbot assistant with offline mode support
 * - Provides intelligent Q&A, assessments, and content generation
 * - Syncs chat history with Supabase when online
 * - Stores messages locally for offline access
 * - Requires user authentication to function
 * 
 * Key Features:
 * - Real-time network status detection
 * - Automatic message sync between local storage and Supabase
 * - Custom API endpoint integration support
 * - Downloadable content generation
 * - Message categorization (Q&A, assessment, content)
 * - Persistent chat history across devices
 */

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Download, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { chatStorage } from "@/utils/chatStorage";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const isOnline = useNetworkStatus();
  const { toast } = useToast();
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
  const [isSyncing, setIsSyncing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedMessages = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load messages from Supabase or localStorage on mount
  useEffect(() => {
    if (!user || hasLoadedMessages.current) return;

    const loadMessages = async () => {
      try {
        if (isOnline) {
          // Load from Supabase when online
          const { data, error } = await supabase
            .from('chat_history' as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            const loadedMessages: Message[] = data.map((msg: any) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
              timestamp: new Date(msg.created_at),
              category: msg.category as "qa" | "assessment" | "content" | undefined,
              downloadUrl: msg.download_url || undefined,
            }));

            setMessages(prev => [...prev, ...loadedMessages]);
            
            // Update localStorage
            const storedMessages = loadedMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp.toISOString(),
              category: msg.category,
              downloadUrl: msg.downloadUrl,
              synced: true,
            }));
            chatStorage.saveMessages(user.id, storedMessages);
          }
        } else {
          // Load from localStorage when offline
          const storedMessages = chatStorage.getMessages(user.id);
          if (storedMessages.length > 0) {
            const loadedMessages: Message[] = storedMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              category: msg.category,
              downloadUrl: msg.downloadUrl,
            }));
            setMessages(prev => [...prev, ...loadedMessages]);
          }
        }
        hasLoadedMessages.current = true;
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          variant: "destructive",
          title: "Error loading chat history",
          description: "Failed to load previous messages",
        });
      }
    };

    loadMessages();
  }, [user, isOnline, toast]);

  // Sync unsynced messages when coming back online
  useEffect(() => {
    if (!user || !isOnline || isSyncing) return;

    const syncMessages = async () => {
      const unsyncedMessages = chatStorage.getUnsyncedMessages(user.id);
      if (unsyncedMessages.length === 0) return;

      setIsSyncing(true);
      try {
        const messagesToSync = unsyncedMessages.map(msg => ({
          user_id: user.id,
          role: msg.role,
          content: msg.content,
          category: msg.category || null,
          download_url: msg.downloadUrl || null,
          created_at: msg.timestamp,
        }));

        const { error } = await supabase
          .from('chat_history' as any)
          .insert(messagesToSync);

        if (error) throw error;

        chatStorage.markMessagesSynced(user.id);
        
        toast({
          title: "Chat synced",
          description: "Your offline messages have been synced to the cloud",
        });
      } catch (error) {
        console.error('Error syncing messages:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncMessages();
  }, [user, isOnline, isSyncing, toast]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Save to localStorage immediately
    const storedUserMessage = {
      role: userMessage.role,
      content: userMessage.content,
      timestamp: userMessage.timestamp.toISOString(),
      synced: false,
    };
    chatStorage.addMessage(user.id, storedUserMessage);

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

      // Save both messages to localStorage
      const storedAssistantMessage = {
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp.toISOString(),
        category: assistantMessage.category,
        downloadUrl: assistantMessage.downloadUrl,
        synced: false,
      };
      chatStorage.addMessage(user.id, storedAssistantMessage);

      // Save to Supabase if online
      if (isOnline) {
        try {
          await supabase.from('chat_history' as any).insert([
            {
              user_id: user.id,
              role: userMessage.role,
              content: userMessage.content,
              category: null,
              download_url: null,
            },
            {
              user_id: user.id,
              role: assistantMessage.role,
              content: assistantMessage.content,
              category: assistantMessage.category || null,
              download_url: assistantMessage.downloadUrl || null,
            },
          ]);

          // Mark as synced
          chatStorage.markMessagesSynced(user.id);
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      }
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

      // Save error message to localStorage
      const storedErrorMessage = {
        role: errorMessage.role,
        content: errorMessage.content,
        timestamp: errorMessage.timestamp.toISOString(),
        synced: false,
      };
      chatStorage.addMessage(user.id, storedErrorMessage);
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

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

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
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-yellow-400" />
              )}
              {isSyncing && (
                <span className="text-xs">Syncing...</span>
              )}
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
