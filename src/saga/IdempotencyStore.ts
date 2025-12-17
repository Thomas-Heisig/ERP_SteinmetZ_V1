/* IdempotencyStore backed by Postgres
   - isDuplicate(requestId, operationHash): returns true if the same request was already completed
   - markCompleted(requestId, result): stores the result and TTL
*/

import { Pool } from "pg";

export class IdempotencyStore {
  private pool: Pool;
  private table = "core.idempotency";

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async isDuplicate(
    requestId: string,
    operationHash: string,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(
        `SELECT request_id FROM ${this.table} WHERE request_id = $1 AND operation_hash = $2 AND completed_at IS NOT NULL`,
        [requestId, operationHash],
      );
      return (res.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async markCompleted(
    requestId: string,
    operationHash: string,
    result: any,
    ttlSeconds = 60 * 60 * 24 * 365 * 10 /* 10 Jahre default */,
  ) {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO ${this.table} (request_id, operation_hash, result, completed_at, expires_at)
         VALUES ($1,$2,$3,$4, now() + ($5 || ' seconds')::interval)
         ON CONFLICT (request_id) DO UPDATE SET operation_hash = EXCLUDED.operation_hash, result = EXCLUDED.result, completed_at = EXCLUDED.completed_at, expires_at = EXCLUDED.expires_at`,
        [
          requestId,
          operationHash,
          result,
          new Date().toISOString(),
          ttlSeconds,
        ],
      );
    } finally {
      client.release();
    }
  }
}
