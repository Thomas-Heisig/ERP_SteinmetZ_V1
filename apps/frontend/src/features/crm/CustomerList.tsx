// SPDX-License-Identifier: MIT
// apps/frontend/src/features/crm/CustomerList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input, Modal } from "../../components/ui";

type CustomerStatus = "lead" | "prospect" | "customer" | "inactive";

interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  revenue: number;
  lastContact: string;
}

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: "1",
        companyName: "ABC GmbH",
        contactPerson: "Hans Meyer",
        email: "meyer@abc.de",
        phone: "+49 30 12345678",
        status: "customer",
        revenue: 45000,
        lastContact: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: "2",
        companyName: "XYZ AG",
        contactPerson: "Anna Schmidt",
        email: "schmidt@xyz.de",
        phone: "+49 40 98765432",
        status: "prospect",
        revenue: 0,
        lastContact: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "3",
        companyName: "Test & Partner",
        contactPerson: "Thomas Test",
        email: "test@partner.de",
        phone: "+49 89 11223344",
        status: "lead",
        revenue: 0,
        lastContact: new Date().toISOString(),
      },
    ];

    setCustomers(mockCustomers);
    setLoading(false);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(searchLower) ||
      c.contactPerson.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: CustomerStatus) => {
    const config: Record<
      CustomerStatus,
      { label: string; color: string; bg: string }
    > = {
      lead: {
        label: "Lead",
        bg: "var(--primary-50)",
        color: "var(--primary-600)",
      },
      prospect: {
        label: "Interessent",
        bg: "var(--warning-50)",
        color: "var(--warning-600)",
      },
      customer: {
        label: "Kunde",
        bg: "var(--success-50)",
        color: "var(--success-600)",
      },
      inactive: {
        label: "Inaktiv",
        bg: "var(--gray-100)",
        color: "var(--gray-600)",
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
      key: "companyName",
      header: "Firma",
      render: (value: unknown, row: Customer) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value as string}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            {row.contactPerson}
          </div>
        </div>
      ),
    },
    { key: "email", header: "E-Mail" },
    { key: "phone", header: "Telefon", width: "150px" },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (value: unknown) => getStatusBadge(value as CustomerStatus),
    },
    {
      key: "revenue",
      header: "Umsatz",
      width: "120px",
      render: (value: unknown) =>
        (value as number) > 0 ? formatCurrency(value as number) : "-",
    },
    {
      key: "lastContact",
      header: "Letzter Kontakt",
      width: "120px",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("de-DE"),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (_: unknown, row: Customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCustomer(row)}
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
          🏢 Kunden
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span>🔍</span>}
          />
          <Button variant="primary">+ Neuer Kunde</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCustomers}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Kunden gefunden"
        hoverable
      />

      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.companyName || "Kunde"}
        size="md"
      >
        {selectedCustomer && (
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
                  Ansprechpartner
                </label>
                <p style={{ margin: "0.25rem 0" }}>
                  {selectedCustomer.contactPerson}
                </p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  E-Mail
                </label>
                <p style={{ margin: "0.25rem 0" }}>{selectedCustomer.email}</p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Telefon
                </label>
                <p style={{ margin: "0.25rem 0" }}>{selectedCustomer.phone}</p>
              </div>
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Umsatz
                </label>
                <p style={{ margin: "0.25rem 0" }}>
                  {formatCurrency(selectedCustomer.revenue)}
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
              <Button variant="primary">📞 Kontaktieren</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default CustomerList;
