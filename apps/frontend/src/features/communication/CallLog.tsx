// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/CallLog.tsx

import React, { useState, useEffect } from "react";
import { Table, Button, Input } from "../../components/ui";
import styles from "./CallLog.module.css";

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
  // Mock data - in production, fetch from API
  const [calls] = useState<Call[]>(() => [
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
  ]);
  const [loading] = useState(false);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [search, setSearch] = useState("");

  // In production, fetch from API on mount
  // useEffect(() => {
  //   fetchCallsFromAPI();
  // }, []);

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
        <span className={styles.directionIcon}>
          {(value as string) === "incoming" ? "📥" : "📤"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      header: "Nummer",
      render: (value: unknown, row: Call) => (
        <div className={styles.contactInfo}>
          <div className={styles.contactName}>
            {row.contactName || (value as string)}
          </div>
          {row.contactName && (
            <div className={styles.phoneNumber}>
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
          <span className={styles.statusText} style={{ color: config.color }}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (_: unknown, _row: Call) => (
        <div className={styles.actions}>
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
      <div className={styles.header}>
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          icon={<span>🔍</span>}
        />
        <div className={styles.filterGroup}>
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
