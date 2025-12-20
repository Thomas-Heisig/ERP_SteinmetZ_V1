// SPDX-License-Identifier: MIT
// apps/frontend/src/features/hr/EmployeeList.tsx

import React, { useState } from "react";
import { Card, Table, Button, Input, Modal } from "../../components/ui";
import styles from "./EmployeeList.module.css";

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

  const [employees] = useState<Employee[]>(mockEmployees);
  const [loading] = useState(false);
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
      <span className={styles.statusText} style={{ color: c.color }}>
        <span
          className={styles.directionIcon}
          style={{ background: c.color }}
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
        <div className={styles.contactInfo}>
          <div className={styles.directionIcon}>
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <div className={styles.contactName}>
              {row.firstName} {row.lastName}
            </div>
            <div className={styles.phoneNumber}>{row.email}</div>
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
      <div className={styles.header}>
        <h2 className={styles.headerText}>👥 Mitarbeiter</h2>
        <div className={styles.filterGroup}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
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
          <div className={styles.modalContent}>
            <div className={styles.infoGrid}>
              <div>
                <label className={styles.label}>E-Mail</label>
                <p className={styles.value}>{selectedEmployee.email}</p>
              </div>
              <div>
                <label className={styles.label}>Abteilung</label>
                <p className={styles.value}>{selectedEmployee.department}</p>
              </div>
              <div>
                <label className={styles.label}>Position</label>
                <p className={styles.value}>{selectedEmployee.position}</p>
              </div>
              <div>
                <label className={styles.label}>Eintritt</label>
                <p className={styles.value}>
                  {new Date(selectedEmployee.startDate).toLocaleDateString(
                    "de-DE",
                  )}
                </p>
              </div>
            </div>
            <div className={styles.actions}>
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
