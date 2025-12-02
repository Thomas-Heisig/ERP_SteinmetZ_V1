// SPDX-License-Identifier: MIT
// apps/backend/src/services/sipgate/SipgateClient.ts

/**
 * Sipgate API Client
 * Handles authentication and API communication with Sipgate
 */
export interface SipgateConfig {
  tokenId?: string;
  token?: string;
  baseUrl?: string;
}

export interface SipgateUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface SipgateDevice {
  id: string;
  alias: string;
  type: string;
  online: boolean;
}

export interface SipgateCall {
  id: string;
  direction: "incoming" | "outgoing";
  from: string;
  to: string;
  status: string;
  startedAt: string;
  duration?: number;
}

export interface SipgateSMS {
  id: string;
  to: string;
  message: string;
  status: "pending" | "sent" | "delivered" | "failed";
  createdAt: string;
}

export interface SipgateFax {
  id: string;
  to: string;
  status: "pending" | "sending" | "sent" | "failed";
  pages: number;
  createdAt: string;
}

export class SipgateClient {
  private baseUrl: string;
  private tokenId: string;
  private token: string;
  private isConfigured: boolean;

  constructor(config?: SipgateConfig) {
    this.baseUrl =
      config?.baseUrl ||
      process.env.SIPGATE_BASE_URL ||
      "https://api.sipgate.com/v2";
    this.tokenId = config?.tokenId || process.env.SIPGATE_TOKEN_ID || "";
    this.token = config?.token || process.env.SIPGATE_TOKEN || "";
    this.isConfigured = !!(this.tokenId && this.token);

    if (!this.isConfigured) {
      console.warn(
        "⚠️ [Sipgate] No credentials configured - API calls will be mocked",
      );
    }
  }

  /**
   * Creates authorization header
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.tokenId}:${this.token}`).toString(
      "base64",
    );
    return `Basic ${credentials}`;
  }

  /**
   * Makes an API request to Sipgate
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.isConfigured) {
      // Return mock data when not configured
      return this.getMockResponse<T>(endpoint);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: this.getAuthHeader(),
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(
          `Sipgate API error: ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      console.error(`❌ [Sipgate] API request failed:`, error);
      throw error;
    }
  }

  /**
   * Returns mock data for development/testing
   */
  private getMockResponse<T>(endpoint: string): T {
    const mocks: Record<string, unknown> = {
      "/users": {
        items: [
          {
            id: "w0",
            firstname: "Max",
            lastname: "Mustermann",
            email: "max@example.com",
          },
        ],
      },
      "/devices": {
        items: [
          { id: "e0", alias: "Haupttelefon", type: "register", online: true },
        ],
      },
      "/history": {
        items: [],
      },
    };

    for (const [key, value] of Object.entries(mocks)) {
      if (endpoint.includes(key)) {
        return value as T;
      }
    }

    return {} as T;
  }

  /**
   * Get current user info
   */
  async getUsers(): Promise<{ items: SipgateUser[] }> {
    return this.request<{ items: SipgateUser[] }>("GET", "/users");
  }

  /**
   * Get registered devices
   */
  async getDevices(): Promise<{ items: SipgateDevice[] }> {
    return this.request<{ items: SipgateDevice[] }>("GET", "/devices");
  }

  /**
   * Get call history
   */
  async getCallHistory(params?: {
    limit?: number;
    offset?: number;
    direction?: "incoming" | "outgoing";
  }): Promise<{ items: SipgateCall[] }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.offset) queryParams.set("offset", String(params.offset));
    if (params?.direction) queryParams.set("direction", params.direction);

    const query = queryParams.toString();
    return this.request<{ items: SipgateCall[] }>(
      "GET",
      `/history${query ? `?${query}` : ""}`,
    );
  }

  /**
   * Initiate a call
   */
  async initiateCall(params: {
    deviceId: string;
    caller: string;
    callee: string;
  }): Promise<{ sessionId: string }> {
    if (!this.isConfigured) {
      console.log(
        `📞 [Sipgate Mock] Initiating call from ${params.caller} to ${params.callee}`,
      );
      return { sessionId: `mock-${Date.now()}` };
    }

    return this.request<{ sessionId: string }>("POST", "/sessions/calls", {
      deviceId: params.deviceId,
      caller: params.caller,
      callee: params.callee,
    });
  }

  /**
   * Send SMS
   */
  async sendSMS(params: {
    smsId: string;
    recipient: string;
    message: string;
  }): Promise<SipgateSMS> {
    if (!this.isConfigured) {
      console.log(
        `📱 [Sipgate Mock] Sending SMS to ${params.recipient}: ${params.message}`,
      );
      return {
        id: `sms-${Date.now()}`,
        to: params.recipient,
        message: params.message,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
    }

    await this.request("POST", "/sessions/sms", {
      smsId: params.smsId,
      recipient: params.recipient,
      message: params.message,
    });

    return {
      id: `sms-${Date.now()}`,
      to: params.recipient,
      message: params.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Send Fax
   */
  async sendFax(params: {
    faxlineId: string;
    recipient: string;
    filename: string;
    base64Content: string;
  }): Promise<SipgateFax> {
    if (!this.isConfigured) {
      console.log(`📠 [Sipgate Mock] Sending fax to ${params.recipient}`);
      return {
        id: `fax-${Date.now()}`,
        to: params.recipient,
        status: "sent",
        pages: 1,
        createdAt: new Date().toISOString(),
      };
    }

    await this.request("POST", "/sessions/fax", {
      faxlineId: params.faxlineId,
      recipient: params.recipient,
      filename: params.filename,
      base64Content: params.base64Content,
    });

    return {
      id: `fax-${Date.now()}`,
      to: params.recipient,
      status: "pending",
      pages: 0,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Check if client is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

export default new SipgateClient();
