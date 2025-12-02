// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/CommunicationCenter.tsx

import React, { useState } from "react";
import { Card, Tabs, Button } from "../../components/ui";
import { CallLog } from "./CallLog";
import { FaxInbox } from "./FaxInbox";
import { PhoneDialer } from "./PhoneDialer";

export const CommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("calls");
  const [showDialer, setShowDialer] = useState(false);

  const tabs = [
    {
      id: "calls",
      label: "Anrufe",
      icon: "📞",
      content: <CallLog />,
    },
    {
      id: "fax",
      label: "Fax",
      icon: "📠",
      content: <FaxInbox />,
    },
    {
      id: "sms",
      label: "SMS",
      icon: "💬",
      content: (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <p>SMS-Funktion wird in einer zukünftigen Version verfügbar sein.</p>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card variant="elevated" padding="md">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              📡 Kommunikationszentrale
            </h1>
            <p
              style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)" }}
            >
              Unified Inbox für Anrufe, Fax und Nachrichten
            </p>
          </div>
          <Button onClick={() => setShowDialer(!showDialer)}>
            📞 {showDialer ? "Wähler schließen" : "Anrufen"}
          </Button>
        </div>
      </Card>

      {showDialer && (
        <Card variant="elevated" padding="md">
          <PhoneDialer onClose={() => setShowDialer(false)} />
        </Card>
      )}

      <Card variant="elevated" padding="none">
        <Tabs
          tabs={tabs}
          defaultTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
          fullWidth
        />
      </Card>
    </div>
  );
};

export default CommunicationCenter;
