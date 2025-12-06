// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChatAlt/QuickChatContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  command?: string;
  commandResult?: unknown;
}

interface QuickChatContextValue {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
  toggleOpen: () => void;
  toggleMinimize: () => void;
  sendMessage: (message: string) => Promise<void>;
  executeCommand: (command: string, args?: string) => Promise<void>;
  clearMessages: () => void;
}

const QuickChatContext = createContext<QuickChatContextValue | null>(null);

export const useQuickChat = () => {
  const context = useContext(QuickChatContext);
  if (!context) {
    throw new Error("useQuickChat must be used within QuickChatProvider");
  }
  return context;
};

export const QuickChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/quickchat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message: content.trim(),
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (!sessionId && data.sessionId) {
            setSessionId(data.sessionId);
          }

          const assistantMessage: Message = {
            id: data.message.id || crypto.randomUUID(),
            role: "assistant",
            content: data.message.content,
            timestamp: data.message.timestamp || new Date().toISOString(),
            command: data.message.command,
            commandResult: data.commandResult,
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error) {
        console.error("QuickChat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const executeCommand = useCallback(
    async (command: string, args?: string) => {
      const fullMessage = args ? `${command} ${args}` : command;
      await sendMessage(fullMessage);
    },
    [sendMessage],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return (
    <QuickChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        messages,
        isLoading,
        sessionId,
        toggleOpen,
        toggleMinimize,
        sendMessage,
        executeCommand,
        clearMessages,
      }}
    >
      {children}
    </QuickChatContext.Provider>
  );
};

export default QuickChatProvider;
