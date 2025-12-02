/* TransactionCoordinator - SAGA Orchestrator (simplified)
   Responsibilities:
   - startSaga: execute steps in order, persist progress, support compensation on failure
   - compensate: run compensating steps for completed steps
   - getPendingSagas: list sagas in-flight
*/

import { Pool } from 'pg';
import crypto from 'crypto';

export type SagaStep = {
  name: string;
  execute: (context: SagaContext) => Promise<any>;
  compensate?: (context: SagaContext) => Promise<any>;
};

export type SagaContext = {
  sagaId: string;
  processId: string;
  createdAt: string;
  state: 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATING';
  data: Record<string, any>;
  currentStep?: number;
  metadata?: Record<string, any>;
};

export interface TransactionCoordinator {
  startSaga(processId: string, steps: SagaStep[], initialData?: Record<string, any>): Promise<SagaContext>;
  compensate(context: SagaContext): Promise<void>;
  getPendingSagas(): Promise<SagaContext[]>;
}

export class PostgresTransactionCoordinator implements TransactionCoordinator {
  private pool: Pool;
  private table = 'core.sagas';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private async persistSagaRow(ctx: SagaContext) {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO ${this.table} (saga_id, process_id, state, data, current_step, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (saga_id) DO UPDATE SET state = EXCLUDED.state, data = EXCLUDED.data, current_step = EXCLUDED.current_step, updated_at = EXCLUDED.updated_at`,
        [ctx.sagaId, ctx.processId, ctx.state, ctx.data, ctx.currentStep ?? null, ctx.createdAt, new Date().toISOString()]
      );
    } finally {
      client.release();
    }
  }

  async startSaga(processId: string, steps: SagaStep[], initialData: Record<string, any> = {}): Promise<SagaContext> {
    const sagaId = crypto.randomUUID();
    const ctx: SagaContext = {
      sagaId,
      processId,
      createdAt: new Date().toISOString(),
      state: 'PENDING',
      data: initialData,
      currentStep: 0,
    };

    await this.persistSagaRow(ctx);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      ctx.currentStep = i;
      await this.persistSagaRow(ctx);

      try {
        const result = await step.execute(ctx);
        // Merge result into data (conservative shallow merge)
        ctx.data = { ...ctx.data, [step.name]: result };
        await this.persistSagaRow(ctx);
      } catch (err) {
        ctx.state = 'FAILED';
        await this.persistSagaRow(ctx);
        // Compensate for completed steps
        await this.compensate(ctxWithCompletedSteps(ctx, steps));
        throw err;
      }
    }

    ctx.state = 'COMPLETED';
    await this.persistSagaRow(ctx);
    return ctx;
  }

  async compensate(context: SagaContext): Promise<void> {
    // Fetch saga row to get progress and steps executed would be stored in data
    // In this simplified implementation we expect the caller to provide necessary context to run compensating steps.
    // Real implementation: persist executed steps, payloads and run compensations in reverse order.
    const client = await this.pool.connect();
    try {
      // mark compensating
      await client.query(`UPDATE ${this.table} SET state = $1, updated_at = $2 WHERE saga_id = $3`, ['COMPENSATING', new Date().toISOString(), context.sagaId]);
      // Placeholder: real compensation logic would be step-specific and transactional where possible.
    } finally {
      client.release();
    }
  }

  async getPendingSagas(): Promise<SagaContext[]> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(`SELECT saga_id, process_id, state, data, current_step, created_at FROM ${this.table} WHERE state IN ('PENDING','COMPENSATING','FAILED')`);
      return res.rows.map((r: any) => ({
        sagaId: r.saga_id,
        processId: r.process_id,
        state: r.state,
        data: r.data,
        currentStep: r.current_step,
        createdAt: r.created_at,
      }));
    } finally {
      client.release();
    }
  }
}

function ctxWithCompletedSteps(ctx: SagaContext, steps: SagaStep[]) {
  // Return a context that contains the executed steps so compensate can know which to run
  // Here we simply attach step names and shallow data; real system persists fine-grained step results.
  return {
    ...ctx,
    metadata: {
      executedSteps: steps.slice(0, ctx.currentStep ?? 0).map(s => s.name),
    },
  };
}
