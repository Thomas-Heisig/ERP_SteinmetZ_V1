// SPDX-License-Identifier: MIT
// apps/frontend/src/features/projects/ProjectList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../components/ui";
import styles from "./ProjectList.module.css";

interface ProjectApiResponse {
  id: string;
  name: string;
  client?: string;
  start_date?: string;
  end_date?: string;
  status: ProjectStatus;
  progress?: number;
  budget?: number;
  spent?: number;
  manager?: string;
}

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
        const mappedProjects: Project[] = data.data.map(
          (p: ProjectApiResponse) => ({
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
          }),
        );

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
        className={`${styles.statusBadge} ${styles[`status_${status}`]}`}
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
          <div className={styles.projectName}>{value as string}</div>
          <div className={styles.projectClient}>{row.client}</div>
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
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${progress === 100 ? styles.progressComplete : ''}`}
                data-progress={progress}
              />
            </div>
            <span className={styles.progressText}>{progress}%</span>
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
          <div className={styles.budgetValue}>
            {formatCurrency(value as number)}
          </div>
          <div className={styles.budgetSpent}>
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
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>📋 Projekte</h2>
        <div className={styles.headerActions}>
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
