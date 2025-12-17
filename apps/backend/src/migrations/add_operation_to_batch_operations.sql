-- apps/backend/src/migrations/add_operation_to_batch_operations.sql
ALTER TABLE batch_operations ADD operation NVARCHAR(MAX) NOT NULL DEFAULT 'generate_meta';