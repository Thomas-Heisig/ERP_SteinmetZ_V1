// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/PhoneDialer.tsx

import React, { useState } from "react";
import { Button, Input } from "../../components/ui";

interface PhoneDialerProps {
  onClose?: () => void;
  onCall?: (phoneNumber: string) => void;
}

export const PhoneDialer: React.FC<PhoneDialerProps> = ({ onClose, onCall }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDialing, setIsDialing] = useState(false);

  const handleDigitClick = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber("");
  };

  const handleCall = async () => {
    if (!phoneNumber.trim()) return;
    
    setIsDialing(true);
    try {
      // In production, call the API
      onCall?.(phoneNumber);
      console.log(`📞 Calling ${phoneNumber}...`);
    } catch (error) {
      console.error("Call failed:", error);
    } finally {
      setIsDialing(false);
    }
  };

  const dialPadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];

  return (
    <div style={{ maxWidth: "300px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
          📞 Wähler
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Display */}
      <div
        style={{
          padding: "1rem",
          background: "var(--gray-50)",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Telefonnummer eingeben"
          style={{
            width: "100%",
            padding: "0.5rem",
            fontSize: "1.5rem",
            fontFamily: "monospace",
            textAlign: "center",
            border: "none",
            background: "transparent",
            outline: "none",
          }}
        />
      </div>

      {/* Dial Pad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {dialPadButtons.flat().map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            style={{
              padding: "1rem",
              fontSize: "1.5rem",
              fontWeight: 500,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
        }}
      >
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={!phoneNumber}
        >
          C
        </Button>
        <Button
          variant="primary"
          onClick={handleCall}
          loading={isDialing}
          disabled={!phoneNumber.trim()}
          style={{
            background: "var(--success-500)",
            fontSize: "1.25rem",
          }}
        >
          📞
        </Button>
        <Button
          variant="ghost"
          onClick={handleBackspace}
          disabled={!phoneNumber}
        >
          ⌫
        </Button>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem",
            fontSize: "0.75rem",
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
          }}
        >
          Letzte Anrufe
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {["+49 30 12345678", "+49 40 98765432"].map((number) => (
            <button
              key={number}
              onClick={() => setPhoneNumber(number)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.875rem",
                fontFamily: "monospace",
              }}
            >
              <span>📞</span> {number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneDialer;
