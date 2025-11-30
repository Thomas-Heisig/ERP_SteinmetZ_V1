// SPDX-License-Identifier: MIT
import type { Application } from "express";

export type Tool = {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  run: (args: any) => Promise<any> | any;
};

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool) {
    if (!tool.name) {
      throw new Error("Tool muss einen Namen haben");
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  async call(name: string, params: any = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unbekanntes Tool: ${name}`);
    }
    return await tool.run(params);
  }

  list() {
    return Array.from(this.tools.values());
  }
}

export const toolRegistry = new ToolRegistry();
