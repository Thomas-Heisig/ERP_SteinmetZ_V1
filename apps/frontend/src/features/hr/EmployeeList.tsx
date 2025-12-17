// SPDX-License-Identifier: MIT
// apps/frontend/src/features/hr/EmployeeList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input, Modal } from "../../components/ui";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status: "active" | "inactive" | "on_leave";
  avatarUrl?: string;
}

export const EmployeeList: React.FC = () => {
  // Mock data
  const mockEmployees: Employee[] = [
    {
      id: "1",
      firstName: "Max",
      lastName: "Mustermann",
      email: "max.mustermann@company.de",
      department: "Entwicklung",
      position: "Senior Developer",
      startDate: "2020-03-15",
      status: "active",
    },
    {
      id: "2",
      firstName: "Anna",
      lastName: "Schmidt",
      email: "anna.schmidt@company.de",
      department: "Vertrieb",
      position: "Sales Manager",
      startDate: "2019-07-01",
      status: "active",
    },
    {
      id: "3",
      firstName: "Thomas",
      lastName: "Müller",
      email: "thomas.mueller@company.de",
      department: "Marketing",
      position: "Marketing Specialist",
      startDate: "2021-01-10",
      status: "on_leave",
    },
  ];

  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const filteredEmployees = employees.filter((emp) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(searchLower) ||
      emp.lastName.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: Employee["status"]) => {
    const config: Record<string, { label: string; color: string }> = {
      active: { label: "Aktiv", color: "var(--success-500)" },
      inactive: { label: "Inaktiv", color: "var(--gray-500)" },
      on_leave: { label: "Abwesend", color: "var(--warning-500)" },
    };
    const c = config[status];
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          color: c.color,
          fontSize: "0.875rem",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: c.color,
          }}
        />
        {c.label}
      </span>
    );
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (_: unknown, row: Employee) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--primary-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "var(--primary-600)",
            }}
          >
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>
              {row.firstName} {row.lastName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Abteilung" },
    { key: "position", header: "Position" },
    {
      key: "startDate",
      header: "Eintritt",
      width: "100px",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("de-DE"),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (value: unknown) => getStatusBadge(value as Employee["status"]),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (_: unknown, row: Employee) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedEmployee(row)}
        >
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
          👥 Mitarbeiter
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span>🔍</span>}
          />
          <Button variant="primary">+ Neu</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredEmployees}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Mitarbeiter gefunden"
        hoverable
      />

      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={`${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        size="md"
      >
        {selectedEmployee && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  E-Mail
                </label>
                <p style={{ margin: "0.25rem 0" }}>{selectedEmployee.email}</p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Abteilung
                </label>
                <p style={{ margin: "0.25rem 0" }}>
                  {selectedEmployee.department}
                </p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Position
                </label>
                <p style={{ margin: "0.25rem 0" }}>
                  {selectedEmployee.position}
                </p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Eintritt
                </label>
                <p style={{ margin: "0.25rem 0" }}>
                  {new Date(selectedEmployee.startDate).toLocaleDateString(
                    "de-DE",
                  )}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="outline">✏️ Bearbeiten</Button>
              <Button variant="primary">📅 Zeiterfassung</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default EmployeeList;
