// SPDX-License-Identifier: MIT
// apps/frontend/src/components/quickchat/QuickChatWidget.tsx

import React from "react";
import { useQuickChat } from "./QuickChatContext";
import { QuickChatInput } from "./QuickChatInput";
import { Button } from "../ui";

export const QuickChatWidget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    toggleOpen,
    toggleMinimize,
    sendMessage,
    clearMessages,
  } = useQuickChat();

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--primary-500)",
          border: "none",
          boxShadow: "var(--shadow-lg)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "white",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          zIndex: 1000,
        }}
        title="QuickChat öffnen"
      >
        💬
      </button>
    );
  }

  return (
    <div
      className="quickchat-widget"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: isMinimized ? "300px" : "400px",
        height: isMinimized ? "50px" : "500px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-2xl)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          background: "var(--primary-500)",
          color: "white",
          cursor: "pointer",
        }}
        onClick={toggleMinimize}
      >
        <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          💬 QuickChat
          {isLoading && (
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "white",
                borderRadius: "50%",
                animation: "pulse 1s infinite",
              }}
            />
          )}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearMessages();
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.25rem",
              fontSize: "0.875rem",
            }}
            title="Chat leeren"
          >
            🗑️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                  padding: "2rem",
                }}
              >
                <p>👋 Willkommen im QuickChat!</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Tippe / für schnelle Befehle wie /idee, /rechnung oder /termin
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "0.75rem 1rem",
                      borderRadius: message.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                      background:
                        message.role === "user" ? "var(--primary-500)" : "var(--gray-100)",
                      color: message.role === "user" ? "white" : "var(--text-primary)",
                    }}
                  >
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                    {message.command && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.5rem",
                          padding: "0.125rem 0.375rem",
                          background: "rgba(0,0,0,0.1)",
                          borderRadius: "4px",
                          fontSize: "0.625rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {message.command}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "12px 12px 12px 0",
                    background: "var(--gray-100)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span style={{ animation: "pulse 1s infinite" }}>...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
            <QuickChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </>
      )}
    </div>
  );
};

export default QuickChatWidget;
