// SPDX-License-Identifier: MIT
// apps/frontend/src/features/finance/InvoiceList.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Table, Button, Input, Modal } from "../../components/ui";
import styles from "./InvoiceList.module.css";

// Toast Hook Fallback
const useToast = () => {
  const addToast = useCallback((options: { type: string; message: string }) => {
    if (options.type === "error" || options.type === "warning") {
      console.error(`[${options.type.toUpperCase()}] ${options.message}`);
    }
  }, []);

  return {
    addToast,
    success: (message: string) => addToast({ type: "success", message }),
    error: (message: string) => addToast({ type: "error", message }),
    warning: (message: string) => addToast({ type: "warning", message }),
    info: (message: string) => addToast({ type: "info", message }),
  };
};

// Utility functions
const formatCurrency = (amount: number, currency: string = "EUR") => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { label: string; icon: string; className: string }
  > = {
    draft: { label: "Entwurf", icon: "📝", className: "statusDraft" },
    sent: { label: "Versendet", icon: "📤", className: "statusSent" },
    paid: { label: "Bezahlt", icon: "✅", className: "statusPaid" },
    overdue: { label: "Überfällig", icon: "⚠️", className: "statusOverdue" },
    partially_paid: {
      label: "Teilbezahlt",
      icon: "💰",
      className: "statusPartiallyPaid",
    },
    cancelled: { label: "Storniert", icon: "❌", className: "statusCancelled" },
  };
  return configs[status] || configs.draft;
};

const calculateDaysOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = now.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

// Types
type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "partially_paid";
type PaymentMethod =
  | "bank_transfer"
  | "credit_card"
  | "paypal"
  | "sepa_direct_debit"
  | "cash";
type InvoicePriority = "low" | "medium" | "high" | "critical";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
  amount: {
    net: number;
    tax: number;
    gross: number;
    currency: string;
    taxRate: number;
  };
  dates: {
    issued: string;
    due: string;
    paid?: string;
  };
  status: InvoiceStatus;
  priority: InvoicePriority;
  paymentMethod?: PaymentMethod;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
}

interface FilterState {
  search: string;
  status: InvoiceStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

// Mock data generator
const generateMockInvoices = (count: number): Invoice[] => {
  const customers = [
    { id: "1", name: "ABC GmbH", email: "info@abc.de" },
    { id: "2", name: "XYZ AG", email: "contact@xyz.de" },
    { id: "3", name: "Musterfirma KG", email: "office@musterfirma.de" },
    { id: "4", name: "Tech Solutions Inc.", email: "hello@techsol.com" },
    {
      id: "5",
      name: "Digital Ventures Ltd.",
      email: "info@digitalventures.com",
    },
  ];

  const statuses: InvoiceStatus[] = [
    "draft",
    "sent",
    "paid",
    "overdue",
    "partially_paid",
    "cancelled",
  ];
  const paymentMethods: PaymentMethod[] = [
    "bank_transfer",
    "credit_card",
    "paypal",
    "sepa_direct_debit",
  ];
  const priorities: InvoicePriority[] = ["low", "medium", "high", "critical"];

  const invoices: Invoice[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const netAmount = Math.random() * 5000 + 100;
    const taxRate = 0.19;
    const taxAmount = netAmount * taxRate;
    const grossAmount = netAmount + taxAmount;

    const issuedDate = new Date(now);
    issuedDate.setDate(issuedDate.getDate() - Math.floor(Math.random() * 60));

    const dueDate = new Date(issuedDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 7);

    const isOverdue =
      status === "overdue" || (status === "sent" && dueDate < now);

    invoices.push({
      id: `inv_${i + 1}`,
      invoiceNumber: `RE-2024-${String(i + 1).padStart(3, "0")}`,
      customer,
      amount: {
        net: netAmount,
        tax: taxAmount,
        gross: grossAmount,
        currency: "EUR",
        taxRate,
      },
      dates: {
        issued: issuedDate.toISOString(),
        due: dueDate.toISOString(),
        paid:
          status === "paid"
            ? new Date(
                dueDate.getTime() - Math.floor(Math.random() * 7) * 86400000,
              ).toISOString()
            : undefined,
      },
      status: isOverdue ? "overdue" : status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      items: [
        {
          id: "1",
          description: "Beratungsleistungen",
          quantity: Math.floor(Math.random() * 10) + 1,
          unitPrice: netAmount / (Math.floor(Math.random() * 10) + 1),
          taxRate,
          total: netAmount,
        },
      ],
    });
  }

  return invoices;
};

export const InvoiceList: React.FC = () => {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "dates.due",
    direction: "asc",
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"overview" | "overdue" | "drafts">(
    "overview",
  );
  const [useMockData] = useState(true); // Development mode

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        throw new Error("Using mock data");
      }

      const response = await fetch("/api/finance/invoices");
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setInvoices(data.invoices || data);
    } catch {
      const mockInvoices = generateMockInvoices(25);
      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const totalOpen = invoices
      .filter(
        (i) =>
          i.status === "sent" ||
          i.status === "overdue" ||
          i.status === "partially_paid",
      )
      .reduce((sum, i) => sum + i.amount.gross, 0);

    const totalOverdue = invoices
      .filter((i) => i.status === "overdue")
      .reduce((sum, i) => sum + i.amount.gross, 0);

    return {
      totalOpen,
      totalOverdue,
      totalInvoices: invoices.length,
      draftCount: invoices.filter((i) => i.status === "draft").length,
      paidCount: invoices.filter((i) => i.status === "paid").length,
      overdueCount: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          inv.customer.name.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((inv) => filters.status.includes(inv.status));
    }

    // Apply tab filter
    if (activeTab === "overdue") {
      result = result.filter((inv) => inv.status === "overdue");
    } else if (activeTab === "drafts") {
      result = result.filter((inv) => inv.status === "draft");
    }

    return result;
  }, [invoices, filters, activeTab]);

  // Handlers
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowSelect = (invoiceId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm("Rechnung wirklich löschen?")) {
      try {
        await fetch(`/api/finance/invoices/${invoiceId}`, { method: "DELETE" });
        setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
        toast.success("Rechnung gelöscht");
      } catch {
        toast.error("Löschen fehlgeschlagen");
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      await fetch(`/api/finance/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
      });
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId ? { ...i, status: "paid" as InvoiceStatus } : i,
        ),
      );
      toast.success("Als bezahlt markiert");
    } catch {
      toast.error("Aktion fehlgeschlagen");
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "select",
        header: "☑",
        width: "50px",
        render: (_: unknown, row: Invoice) => (
          <input
            type="checkbox"
            aria-label="Rechnung auswählen"
            checked={selectedIds.has(row.id)}
            onChange={() => handleRowSelect(row.id)}
            className={styles.rowCheckbox}
          />
        ),
      },
      {
        key: "invoiceNumber",
        header: "Rechnung Nr.",
        sortable: true,
        width: "140px",
        render: (value: unknown, row: Invoice) => (
          <div className={styles.invoiceNumberCell}>
            <span className={styles.invoiceIcon}>🧾</span>
            <strong>{value as string}</strong>
            {row.priority === "critical" && (
              <span
                className={styles.priorityBadge}
                title="Kritische Priorität"
              >
                🚨
              </span>
            )}
          </div>
        ),
      },
      {
        key: "customer",
        header: "Kunde",
        sortable: true,
        render: (value: unknown) => {
          const customer = value as Invoice["customer"];
          return (
            <div className={styles.customerCell}>
              <div className={styles.customerName}>{customer.name}</div>
              {customer.email && (
                <div className={styles.customerEmail}>{customer.email}</div>
              )}
            </div>
          );
        },
      },
      {
        key: "amount",
        header: "Betrag",
        sortable: true,
        width: "120px",
        render: (_: unknown, row: Invoice) => (
          <div className={styles.amountCell}>
            <div className={styles.amountGross}>
              {formatCurrency(row.amount.gross, row.amount.currency)}
            </div>
            <div className={styles.amountNet}>
              Netto: {formatCurrency(row.amount.net, row.amount.currency)}
            </div>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Fällig",
        sortable: true,
        width: "110px",
        render: (_: unknown, row: Invoice) => {
          const daysOverdue = calculateDaysOverdue(row.dates.due);
          const isOverdue = row.status === "overdue" || daysOverdue > 0;

          return (
            <div
              className={`${styles.dateCell} ${isOverdue ? styles.overdueDate : ""}`}
            >
              <div className={styles.dateFormatted}>
                {formatDate(row.dates.due)}
              </div>
              {isOverdue && (
                <div className={styles.daysOverdue}>
                  {daysOverdue} Tag{daysOverdue !== 1 ? "e" : ""} überfällig
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        width: "120px",
        render: (value: unknown) => {
          const status = value as InvoiceStatus;
          const config = getStatusConfig(status);
          return (
            <span
              className={`${styles.statusBadge} ${styles[config.className]}`}
            >
              {config.icon} {config.label}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Aktionen",
        width: "150px",
        render: (_: unknown, row: Invoice) => (
          <div className={styles.actionButtons}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedInvoice(row);
                setIsDetailModalOpen(true);
              }}
              title="Details"
            >
              👁️
            </Button>
            {(row.status === "sent" || row.status === "overdue") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsPaid(row.id)}
                title="Als bezahlt markieren"
              >
                ✅
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.id)}
              title="Löschen"
              className={styles.deleteButton}
            >
              🗑️
            </Button>
          </div>
        ),
      },
    ],
    [selectedIds, handleRowSelect],
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Lade Rechnungen...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Card variant="elevated" padding="md" className={styles.managerHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.managerTitle}>
              💰 Rechnungsverwaltung
              <span className={styles.countBadge}>{stats.totalInvoices}</span>
            </h1>

            {/* Development Mode Banner */}
            {useMockData && (
              <div className={styles.devBanner}>
                🔧 Entwicklungsmodus: Mock-Daten werden verwendet
              </div>
            )}

            {/* Tabs */}
            <div className={styles.tabsContainer}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                📋 Alle ({stats.totalInvoices})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "overdue" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("overdue")}
              >
                ⚠️ Überfällig ({stats.overdueCount})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === "drafts" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("drafts")}
              >
                📝 Entwürfe ({stats.draftCount})
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card variant="outlined" padding="md" className={styles.statCard}>
          <div className={styles.statLabel}>Gesamt offen</div>
          <div className={`${styles.statValue} ${styles.totalOpen}`}>
            {formatCurrency(stats.totalOpen)}
          </div>
        </Card>

        <Card variant="outlined" padding="md" className={styles.statCard}>
          <div className={styles.statLabel}>Überfällig</div>
          <div className={`${styles.statValue} ${styles.overdue}`}>
            {formatCurrency(stats.totalOverdue)}
          </div>
          <div className={styles.statSubtext}>
            {stats.overdueCount} Rechnung{stats.overdueCount !== 1 ? "en" : ""}
          </div>
        </Card>

        <Card variant="outlined" padding="md" className={styles.statCard}>
          <div className={styles.statLabel}>Bezahlt</div>
          <div className={styles.statValue}>{stats.paidCount}</div>
          <div className={styles.statSubtext}>Rechnungen</div>
        </Card>

        <Card variant="outlined" padding="md" className={styles.statCard}>
          <div className={styles.statLabel}>Entwürfe</div>
          <div className={styles.statValue}>{stats.draftCount}</div>
          <div className={styles.statSubtext}>Nicht versendet</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card variant="elevated" padding="md">
        <div className={styles.filterBar}>
          <Input
            placeholder="🔍 Rechnungen durchsuchen..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className={styles.searchInput}
          />

          <select
            className={styles.filterSelect}
            value=""
            aria-label="Status filtern"
            onChange={(e) => {
              const status = e.target.value as InvoiceStatus;
              if (status) {
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status.includes(status)
                    ? prev.status.filter((s) => s !== status)
                    : [...prev.status, status],
                }));
                e.target.value = "";
              }
            }}
          >
            <option value="">
              🏷️ Status filtern{" "}
              {filters.status.length > 0 && `(${filters.status.length})`}
            </option>
            <option value="draft">📝 Entwurf</option>
            <option value="sent">📤 Versendet</option>
            <option value="paid">✅ Bezahlt</option>
            <option value="overdue">⚠️ Überfällig</option>
            <option value="partially_paid">💰 Teilbezahlt</option>
            <option value="cancelled">❌ Storniert</option>
          </select>

          {(filters.search || filters.status.length > 0) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ search: "", status: [] })}
            >
              ✖ Filter zurücksetzen
            </Button>
          )}
        </div>
      </Card>

      {/* Bulk Selection */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkSelection}>
          <span className={styles.selectionCount}>
            {selectedIds.size} ausgewählt
          </span>
          <div className={styles.bulkActions}>
            <Button type="button" variant="outline" size="sm">
              📥 Exportieren
            </Button>
            <Button type="button" variant="outline" size="sm">
              📧 Erinnerung senden
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              ✖ Abbrechen
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card variant="elevated" padding="none">
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={filteredInvoices}
            keyField="id"
            loading={loading}
            emptyMessage="Keine Rechnungen gefunden"
            hoverable
            onSort={handleSort}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedInvoice(null);
          }}
          title={selectedInvoice.invoiceNumber}
          size="lg"
        >
          <div className={styles.detailContent}>
            <div className={styles.detailGrid}>
              <div className={styles.detailSection}>
                <h4>Kundeninformationen</h4>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Name:</span>
                  <span className={styles.detailValue}>
                    {selectedInvoice.customer.name}
                  </span>
                </div>
                {selectedInvoice.customer.email && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>E-Mail:</span>
                    <span className={styles.detailValue}>
                      {selectedInvoice.customer.email}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h4>Rechnungsdetails</h4>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ausgestellt:</span>
                  <span className={styles.detailValue}>
                    {formatDate(selectedInvoice.dates.issued)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Fällig:</span>
                  <span className={styles.detailValue}>
                    {formatDate(selectedInvoice.dates.due)}
                  </span>
                </div>
                {selectedInvoice.dates.paid && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Bezahlt:</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedInvoice.dates.paid)}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h4>Positionen</h4>
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      {item.description}:
                    </span>
                    <span className={styles.detailValue}>
                      {item.quantity} × {formatCurrency(item.unitPrice)} ={" "}
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.detailSection}>
                <h4>Zusammenfassung</h4>
                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span>Netto:</span>
                    <span>{formatCurrency(selectedInvoice.amount.net)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>USt. ({selectedInvoice.amount.taxRate * 100}%):</span>
                    <span>{formatCurrency(selectedInvoice.amount.tax)}</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Brutto:</span>
                    <span>{formatCurrency(selectedInvoice.amount.gross)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Schließen
              </Button>
              <Button type="button" variant="ghost">
                📄 PDF
              </Button>
              {(selectedInvoice.status === "sent" ||
                selectedInvoice.status === "overdue") && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                >
                  ✅ Als bezahlt markieren
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceList;
