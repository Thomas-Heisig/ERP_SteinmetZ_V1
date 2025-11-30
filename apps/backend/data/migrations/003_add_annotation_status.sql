-- SPDX-License-Identifier: MIT
-- Migration 003: Annotation-Status hinzufügen

PRAGMA foreign_keys = off;

-- Nur ausführen, wenn Tabelle "nodes" existiert und Spalte fehlt
ALTER TABLE nodes ADD COLUMN annotation_status TEXT DEFAULT 'unannotated';

PRAGMA foreign_keys = on;
