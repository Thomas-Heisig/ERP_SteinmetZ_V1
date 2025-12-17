-- SPDX-License-Identifier: MIT
-- Migration 003: Annotation-Status hinzufügen

-- SQL Server syntax (remove PRAGMA statements and COLUMN keyword)
-- Nur ausführen, wenn Tabelle "nodes" existiert und Spalte fehlt
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'nodes') AND name = 'annotation_status')
BEGIN
	ALTER TABLE nodes ADD annotation_status NVARCHAR(50) DEFAULT 'unannotated';
END
