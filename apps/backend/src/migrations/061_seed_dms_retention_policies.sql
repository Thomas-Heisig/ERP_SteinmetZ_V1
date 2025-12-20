-- SPDX-License-Identifier: MIT
-- Migration: Seed Default Retention Policies
-- Description: Fügt Standard-Aufbewahrungsrichtlinien für DMS ein (DSGVO, HGB, BGB konform)
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- STANDARD AUFBEWAHRUNGSRICHTLINIEN
-- =============================================================================

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('invoice', 10, 'Rechnungen müssen 10 Jahre aufbewahrt werden', 'HGB §257');

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('contract', 6, 'Verträge 6 Jahre aufbewahren', 'BGB §195');

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('employee_document', 3, 'Personalunterlagen 3 Jahre nach Ausscheiden aufbewahren', 'DSGVO Art. 17');

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('report', 5, 'Berichte 5 Jahre aufbewahren', 'Firmenpolicy');

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('correspondence', 5, 'Korrespondenz 5 Jahre aufbewahren', 'Firmenpolicy');

INSERT OR IGNORE INTO retention_policies (category, retention_years, description, legal_basis)
VALUES ('other', 1, 'Sonstige Dokumente 1 Jahr aufbewahren', 'Firmenpolicy');
