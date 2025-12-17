// SPDX-License-Identifier: MIT
// apps/frontend/src/features/projects/ProjectList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../components/ui";

type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";

interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  manager: string;
}

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();

        // Map database format to component format
        const mappedProjects: Project[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          client: p.client || "",
          startDate: p.start_date || "",
          endDate: p.end_date,
          status: p.status as ProjectStatus,
          progress: p.progress || 0,
          budget: p.budget || 0,
          spent: p.spent || 0,
          manager: p.manager || "",
        }));

        setProjects(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.client.toLowerCase().includes(searchLower) ||
      p.manager.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: ProjectStatus) => {
    const config: Record<
      ProjectStatus,
      { label: string; bg: string; color: string }
    > = {
      planning: {
        label: "Planung",
        bg: "var(--gray-100)",
        color: "var(--gray-600)",
      },
      active: {
        label: "Aktiv",
        bg: "var(--success-50)",
        color: "var(--success-600)",
      },
      on_hold: {
        label: "Pausiert",
        bg: "var(--warning-50)",
        color: "var(--warning-600)",
      },
      completed: {
        label: "Abgeschlossen",
        bg: "var(--primary-50)",
        color: "var(--primary-600)",
      },
      cancelled: {
        label: "Abgebrochen",
        bg: "var(--error-50)",
        color: "var(--error-600)",
      },
    };
    const c = config[status];
    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          background: c.bg,
          color: c.color,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {c.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const columns = [
    {
      key: "name",
      header: "Projekt",
      render: (value: unknown, row: Project) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value as string}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            {row.client}
          </div>
        </div>
      ),
    },
    { key: "manager", header: "Manager" },
    {
      key: "progress",
      header: "Fortschritt",
      width: "120px",
      render: (value: unknown) => {
        const progress = value as number;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                flex: 1,
                height: "8px",
                background: "var(--gray-200)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    progress === 100
                      ? "var(--success-500)"
                      : "var(--primary-500)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {progress}%
            </span>
          </div>
        );
      },
    },
    {
      key: "budget",
      header: "Budget",
      width: "140px",
      render: (value: unknown, row: Project) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {formatCurrency(value as number)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            {formatCurrency(row.spent)} verbraucht
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (value: unknown) => getStatusBadge(value as ProjectStatus),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: () => (
        <Button variant="ghost" size="sm">
          👁️
        </Button>
      ),
    },
  ];

  return (
    <Card variant="elevated" padding="none">
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
          📋 Projekte
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span>🔍</span>}
          />
          <Button variant="primary">+ Neues Projekt</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredProjects}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Projekte gefunden"
        hoverable
      />
    </Card>
  );
};

export default ProjectList;
