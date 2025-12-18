// SPDX-License-Identifier: MIT
// apps/backend/src/services/sipgate/CallHandler.ts

import sipgateClient from "./SipgateClient.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("call-handler");

export interface IncomingCall {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  status: "ringing" | "answered" | "missed" | "rejected";
  duration?: number;
  recording?: string;
  aiTranscript?: string;
  contactName?: string;
}

export interface CallLog {
  id: string;
  direction: "incoming" | "outgoing";
  phoneNumber: string;
  contactName?: string;
  timestamp: string;
  duration: number;
  status: string;
  notes?: string;
}

/**
 * CallHandler - Handles incoming and outgoing calls
 */
export class CallHandler {
  private activeCalls: Map<string, IncomingCall> = new Map();
  private callLogs: CallLog[] = [];
  private maxLogSize = 1000;

  constructor() {}

  /**
   * Handle incoming call webhook
   */
  async handleIncomingCall(webhookData: {
    callId: string;
    from: string;
    to: string;
    event: string;
  }): Promise<IncomingCall> {
    const call: IncomingCall = {
      id: webhookData.callId,
      from: webhookData.from,
      to: webhookData.to,
      timestamp: new Date().toISOString(),
      status: "ringing",
    };

    // Try to find contact name from CRM (would be integrated in real implementation)
    call.contactName = await this.lookupContactName(webhookData.from);

    this.activeCalls.set(call.id, call);

    logger.info(
      { callId: call.id, from: call.from, contactName: call.contactName },
      `📞 Incoming call from ${call.from} (${call.contactName || "Unknown"})`,
    );

    return call;
  }

  /**
   * Update call status
   */
  updateCallStatus(
    callId: string,
    status: IncomingCall["status"],
    duration?: number,
  ): IncomingCall | null {
    const call = this.activeCalls.get(callId);
    if (!call) return null;

    call.status = status;
    if (duration !== undefined) {
      call.duration = duration;
    }

    if (
      status === "missed" ||
      status === "rejected" ||
      (status === "answered" && duration)
    ) {
      // Move to call log
      this.addToCallLog(call, "incoming");
      this.activeCalls.delete(callId);
    }

    return call;
  }

  /**
   * Initiate outgoing call
   */
  async initiateCall(
    deviceId: string,
    from: string,
    to: string,
  ): Promise<{ sessionId: string; call: CallLog }> {
    const result = await sipgateClient.initiateCall({
      deviceId,
      caller: from,
      callee: to,
    });

    const callLog: CallLog = {
      id: result.sessionId,
      direction: "outgoing",
      phoneNumber: to,
      contactName: await this.lookupContactName(to),
      timestamp: new Date().toISOString(),
      duration: 0,
      status: "initiated",
    };

    this.callLogs.unshift(callLog);
    this.trimCallLogs();

    logger.info(
      { to, sessionId: result.sessionId },
      `📞 Outgoing call to ${to}`,
    );

    return { sessionId: result.sessionId, call: callLog };
  }

  /**
   * Get active calls
   */
  getActiveCalls(): IncomingCall[] {
    return Array.from(this.activeCalls.values());
  }

  /**
   * Get call logs
   */
  getCallLogs(params?: {
    limit?: number;
    direction?: "incoming" | "outgoing";
  }): CallLog[] {
    let logs = [...this.callLogs];

    if (params?.direction) {
      logs = logs.filter((log) => log.direction === params.direction);
    }

    if (params?.limit) {
      logs = logs.slice(0, params.limit);
    }

    return logs;
  }

  /**
   * Add note to call log
   */
  addNoteToCall(callId: string, note: string): boolean {
    const log = this.callLogs.find((l) => l.id === callId);
    if (log) {
      log.notes = note;
      return true;
    }
    return false;
  }

  /**
   * Sync call history from Sipgate
   */
  async syncCallHistory(): Promise<number> {
    try {
      const history = await sipgateClient.getCallHistory({ limit: 100 });

      for (const call of history.items) {
        const existingIndex = this.callLogs.findIndex((l) => l.id === call.id);

        const log: CallLog = {
          id: call.id,
          direction: call.direction,
          phoneNumber: call.direction === "incoming" ? call.from : call.to,
          timestamp: call.startedAt,
          duration: call.duration || 0,
          status: call.status,
        };

        if (existingIndex >= 0) {
          this.callLogs[existingIndex] = log;
        } else {
          this.callLogs.push(log);
        }
      }

      // Sort by timestamp
      this.callLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      this.trimCallLogs();

      return history.items.length;
    } catch (error) {
      logger.error({ error }, "❌ Failed to sync call history");
      return 0;
    }
  }

  /**
   * Look up contact name from CRM
   */
  private async lookupContactName(
    _phoneNumber: string,
  ): Promise<string | undefined> {
    // This would integrate with the CRM module in a real implementation
    // For now, return undefined
    return undefined;
  }

  /**
   * Add call to log
   */
  private addToCallLog(
    call: IncomingCall,
    direction: "incoming" | "outgoing",
  ): void {
    const log: CallLog = {
      id: call.id,
      direction,
      phoneNumber: direction === "incoming" ? call.from : call.to,
      contactName: call.contactName,
      timestamp: call.timestamp,
      duration: call.duration || 0,
      status: call.status,
    };

    this.callLogs.unshift(log);
    this.trimCallLogs();
  }

  /**
   * Trim call logs to max size
   */
  private trimCallLogs(): void {
    if (this.callLogs.length > this.maxLogSize) {
      this.callLogs = this.callLogs.slice(0, this.maxLogSize);
    }
  }
}

export default new CallHandler();
