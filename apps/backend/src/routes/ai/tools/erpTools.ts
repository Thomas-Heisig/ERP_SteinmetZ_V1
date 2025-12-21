/**
 * erpTools.ts
 * Erweiterte ERP-Datenbanktools – dynamisch, sicher, KI-kompatibel.
 * Unterstützt SQLite, PostgreSQL, MySQL (über die universellen DB-Tools).
 */

import fs from "node:fs";
import path from "node:path";
import type { ToolFunction } from "./registry.js";
import { toolRegistry } from "./registry.js";

/* ─────────────────────────────────────────────
 * 🔧 Hilfsfunktionen
 * ───────────────────────────────────────────── */

async function findPrimaryDatabase(): Promise<string | null> {
  const baseDir = path.resolve("./data");
  if (!fs.existsSync(baseDir)) return null;
  const dbFiles = await fs.promises.readdir(baseDir);
  const sqlite = dbFiles.find((f) => /\.(db|sqlite|sqlite3)$/i.test(f));
  return sqlite ? path.join(baseDir, sqlite) : null;
}

async function ensureTable(
  dbFile: string,
  tableName: string,
  ddl: string,
): Promise<void> {
  const exists = (await toolRegistry.call("query_database", {
    file: dbFile,
    query: `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
    params: [tableName],
  })) as { count?: number };
  if ((exists?.count ?? 0) === 0) {
    await toolRegistry.call("query_database", { file: dbFile, query: ddl });
  }
}

/* ─────────────────────────────────────────────
 * 🧰 Tool-Registrierung
 * ───────────────────────────────────────────── */

export function registerTools(toolRegistryInstance: typeof toolRegistry) {
  /* ─────────────────────────────────────────────
   * 📦 Bestellung anlegen
   * ───────────────────────────────────────────── */
  const createOrderTool = (async ({
    customer,
    products,
    deliveryDate,
    database,
    status = "offen",
  }: {
    customer: string;
    products: Array<{ name: string; price: number; quantity: number }>;
    deliveryDate?: string;
    database?: string;
    status?: string;
  }) => {
    try {
      if (!customer || !Array.isArray(products) || products.length === 0)
        throw new Error("Kunde und Produktliste erforderlich.");

      const dbFile = database || (await findPrimaryDatabase());
      if (!dbFile) throw new Error("Keine ERP-Datenbank gefunden.");

      await ensureTable(
        dbFile,
        "orders",
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer TEXT,
          total REAL,
          status TEXT,
          delivery_date TEXT,
          created_at TEXT
        );`,
      );

      const total = products.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
        0,
      );
      const now = new Date().toISOString();

      await toolRegistry.call("query_database", {
        file: dbFile,
        query: `INSERT INTO orders (customer, total, status, delivery_date, created_at)
                VALUES (?, ?, ?, ?, ?)`,
        params: [customer, total, status, deliveryDate ?? null, now],
      });

      return {
        success: true,
        message: `Bestellung für ${customer} angelegt.`,
        total,
        products,
        status,
        createdAt: now,
        database: dbFile,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  createOrderTool.description =
    "Legt eine neue Bestellung mit Summierung und Status in der ERP-Datenbank an.";
  createOrderTool.parameters = {
    customer: "Kundenname",
    products: "Array mit Produktobjekten (name, price, quantity)",
    deliveryDate: "Optionales Lieferdatum",
    database: "Pfad zur Datenbankdatei (optional)",
    status: "Status der Bestellung (offen, abgeschlossen, storniert)",
  };
  createOrderTool.category = "erp_operations";
  toolRegistryInstance.register("create_order", createOrderTool);

  /* ─────────────────────────────────────────────
   * 🔍 Bestellungen abrufen
   * ───────────────────────────────────────────── */
  const listOrdersTool = (async ({
    database,
    limit = 25,
    status,
  }: {
    database?: string;
    limit?: number;
    status?: string;
  }) => {
    try {
      const dbFile = database || (await findPrimaryDatabase());
      if (!dbFile) throw new Error("Keine ERP-Datenbank gefunden.");

      await ensureTable(
        dbFile,
        "orders",
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer TEXT,
          total REAL,
          status TEXT,
          delivery_date TEXT,
          created_at TEXT
        );`,
      );

      const query = status
        ? `SELECT * FROM orders WHERE status LIKE ? ORDER BY created_at DESC LIMIT ?`
        : `SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`;

      const params = status ? [`%${status}%`, limit] : [limit];
      const result = (await toolRegistry.call("query_database", {
        file: dbFile,
        query,
        params,
      })) as { results?: unknown[]; count?: number };

      return {
        success: true,
        orders: result.results ?? [],
        count: result.count ?? 0,
        filter: { status },
        database: dbFile,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  listOrdersTool.description =
    "Listet Bestellungen, optional nach Status gefiltert.";
  listOrdersTool.parameters = {
    database: "Pfad zur Datenbank",
    limit: "Maximale Anzahl",
    status: "Filterstatus",
  };
  listOrdersTool.category = "erp_operations";
  toolRegistryInstance.register("list_orders", listOrdersTool);

  /* ─────────────────────────────────────────────
   * 📦 Lagerbestand prüfen / Artikel abrufen
   * ───────────────────────────────────────────── */
  const checkInventoryTool = (async ({
    product,
    database,
  }: {
    product: string;
    database?: string;
  }) => {
    try {
      const dbFile = database || (await findPrimaryDatabase());
      if (!dbFile) throw new Error("Keine ERP-Datenbank gefunden.");

      await ensureTable(
        dbFile,
        "inventory",
        `CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product TEXT,
          stock INTEGER,
          updated_at TEXT
        );`,
      );

      const result = (await toolRegistry.call("query_database", {
        file: dbFile,
        query: `SELECT * FROM inventory WHERE product LIKE ? LIMIT 10`,
        params: [`%${product}%`],
      })) as { results?: unknown[]; count?: number };

      return {
        success: true,
        matches: result.results ?? [],
        count: result.count ?? 0,
        product,
        database: dbFile,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  checkInventoryTool.description =
    "Sucht Produkte im Lagerbestand nach Namen oder Teilbegriff.";
  checkInventoryTool.parameters = {
    product: "Suchbegriff",
    database: "Pfad zur Datenbankdatei",
  };
  checkInventoryTool.category = "erp_operations";
  toolRegistryInstance.register("check_inventory", checkInventoryTool);

  /* ─────────────────────────────────────────────
   * 💰 Rechnungen abrufen / prüfen
   * ───────────────────────────────────────────── */
  const listInvoicesTool = (async ({
    database,
    status,
  }: {
    database?: string;
    status?: string;
  }) => {
    try {
      const dbFile = database || (await findPrimaryDatabase());
      if (!dbFile) throw new Error("Keine ERP-Datenbank gefunden.");

      await ensureTable(
        dbFile,
        "invoices",
        `CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          amount REAL,
          status TEXT,
          date TEXT
        );`,
      );

      const query = status
        ? `SELECT * FROM invoices WHERE status LIKE ? ORDER BY date DESC`
        : `SELECT * FROM invoices ORDER BY date DESC`;
      const params = status ? [`%${status}%`] : [];

      const result = (await toolRegistry.call("query_database", {
        file: dbFile,
        query,
        params,
      })) as { results?: unknown[]; count?: number };
      return {
        success: true,
        invoices: result.results ?? [],
        count: result.count ?? 0,
        database: dbFile,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  listInvoicesTool.description =
    "Listet Rechnungen, optional nach Status gefiltert.";
  listInvoicesTool.parameters = {
    database: "Pfad zur Datenbank",
    status: "Filterstatus",
  };
  listInvoicesTool.category = "erp_operations";
  toolRegistryInstance.register("list_invoices", listInvoicesTool);

  /* ─────────────────────────────────────────────
   * 🧾 Rechnung erstellen (automatisch)
   * ───────────────────────────────────────────── */
  const createInvoiceTool = (async ({
    orderId,
    amount,
    status = "offen",
    database,
  }: {
    orderId: number;
    amount: number;
    status?: string;
    database?: string;
  }) => {
    try {
      const dbFile = database || (await findPrimaryDatabase());
      if (!dbFile) throw new Error("Keine ERP-Datenbank gefunden.");

      await ensureTable(
        dbFile,
        "invoices",
        `CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          amount REAL,
          status TEXT,
          date TEXT
        );`,
      );

      const date = new Date().toISOString();

      await toolRegistry.call("query_database", {
        file: dbFile,
        query: `INSERT INTO invoices (order_id, amount, status, date) VALUES (?, ?, ?, ?)`,
        params: [orderId, amount, status, date],
      });

      return {
        success: true,
        message: `Rechnung zu Auftrag ${orderId} erstellt.`,
        amount,
        status,
        date,
        database: dbFile,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  createInvoiceTool.description =
    "Erstellt eine Rechnung zu einem bestehenden Auftrag.";
  createInvoiceTool.parameters = {
    orderId: "ID des zugehörigen Auftrags",
    amount: "Betrag der Rechnung",
    status: "Status (z. B. offen, bezahlt)",
    database: "Pfad zur Datenbank",
  };
  createInvoiceTool.category = "erp_operations";
  toolRegistryInstance.register("create_invoice", createInvoiceTool);
}
