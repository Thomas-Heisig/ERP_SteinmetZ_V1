// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/CallLog.tsx

import React, { useState, useEffect } from "react";
import { Table, Button, Input } from "../../components/ui";

interface Call {
  id: string;
  direction: "incoming" | "outgoing";
  phoneNumber: string;
  contactName?: string;
  timestamp: string;
  duration: number;
  status: string;
  notes?: string;
}

export const CallLog: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockCalls: Call[] = [
      {
        id: "1",
        direction: "incoming",
        phoneNumber: "+49 30 12345678",
        contactName: "Max Mustermann",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        duration: 180,
        status: "answered",
      },
      {
        id: "2",
        direction: "outgoing",
        phoneNumber: "+49 40 98765432",
        contactName: "Firma ABC",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        duration: 420,
        status: "completed",
      },
      {
        id: "3",
        direction: "incoming",
        phoneNumber: "+49 89 11223344",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        duration: 0,
        status: "missed",
      },
    ];

    setCalls(mockCalls);
    setLoading(false);
  }, []);

  const filteredCalls = calls.filter((call) => {
    if (filter !== "all" && call.direction !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        call.phoneNumber.toLowerCase().includes(searchLower) ||
        call.contactName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const columns = [
    {
      key: "direction",
      header: "",
      width: "40px",
      render: (value: unknown) => (
        <span style={{ fontSize: "1.25rem" }}>
          {(value as string) === "incoming" ? "📥" : "📤"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      header: "Nummer",
      render: (value: unknown, row: Call) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {row.contactName || (value as string)}
          </div>
          {row.contactName && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {value as string}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "timestamp",
      header: "Zeit",
      width: "100px",
      render: (value: unknown) => formatTime(value as string),
    },
    {
      key: "duration",
      header: "Dauer",
      width: "80px",
      render: (value: unknown) => formatDuration(value as number),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (value: unknown) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
          answered: { label: "Angenommen", color: "var(--success-500)" },
          completed: { label: "Beendet", color: "var(--success-500)" },
          missed: { label: "Verpasst", color: "var(--error-500)" },
          rejected: { label: "Abgelehnt", color: "var(--warning-500)" },
        };
        const config = statusConfig[value as string] || {
          label: value as string,
          color: "var(--text-tertiary)",
        };
        return (
          <span style={{ color: config.color, fontSize: "0.875rem" }}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (_: unknown, row: Call) => (
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <Button variant="ghost" size="sm" title="Anrufen">
            📞
          </Button>
          <Button variant="ghost" size="sm" title="Notiz">
            📝
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<span>🔍</span>}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "incoming", "outgoing"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "primary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "Alle"
                : f === "incoming"
                  ? "Eingehend"
                  : "Ausgehend"}
            </Button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCalls}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Anrufe vorhanden"
        hoverable
        striped={false}
      />
    </div>
  );
};

export default CallLog;
