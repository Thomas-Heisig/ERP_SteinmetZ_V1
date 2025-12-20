// SPDX-License-Identifier: MIT
// apps/frontend/src/features/crm/CustomerList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input, Modal } from "../../components/ui";
import styles from "./CustomerList.module.css";

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
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/crm/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();

        interface DbCustomer {
          id: string;
          company?: string;
          name: string;
          email?: string;
          phone?: string;
          status: CustomerStatus;
          updated_at?: string;
          created_at: string;
        }

        // Map database format to component format
        const mappedCustomers: Customer[] = data.data.map((c: DbCustomer) => ({
          id: c.id,
          companyName: c.company || c.name,
          contactPerson: c.name,
          email: c.email || "",
          phone: c.phone || "",
          status: c.status,
          revenue: 0, // TODO: Add revenue tracking
          lastContact: c.updated_at || c.created_at,
        }));

        setCustomers(mappedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        // Fallback to empty array on error
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
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
        className={styles.header}
        style={{ background: c.bg, color: c.color }}
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
          <div className={styles.customerName}>{value as string}</div>
          <div className={styles.customerEmail}>{row.contactPerson}</div>
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
      <div className={styles.header}>
        <h2 className={styles.headerText}>🏢 Kunden</h2>
        <div className={styles.filterGroup}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
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
          <div className={styles.modalContent}>
            <div className={styles.infoGrid}>
              <div>
                <label className={styles.label}>Ansprechpartner</label>
                <p className={styles.value}>{selectedCustomer.contactPerson}</p>
              </div>
              <div>
                <label className={styles.label}>E-Mail</label>
                <p className={styles.value}>{selectedCustomer.email}</p>
              </div>
              <div>
                <label className={styles.label}>Telefon</label>
                <p className={styles.value}>{selectedCustomer.phone}</p>
              </div>
              <div>
                <label className={styles.label}>Umsatz</label>
                <p className={styles.value}>
                  {formatCurrency(selectedCustomer.revenue)}
                </p>
              </div>
            </div>
            <div className={styles.actions}>
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
