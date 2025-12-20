/**
 * API Key Settings Service
 * 
 * Manages API keys for various AI providers in the QuickChat system.
 * Keys are stored securely and validated before use.
 * 
 * @module services/apiKeyService
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createLogger } from "../../../utils/logger.js";

const logger = createLogger("apiKeyService");

const SETTINGS_FILE = path.resolve("config", "api_keys.json");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-me";

// Flag to ensure warning is only shown once
let hasWarnedAboutDefaultKey = false;

function ensureConfigDir() {
  const dir = path.dirname(SETTINGS_FILE);
  return fs.mkdir(dir, { recursive: true }).catch(() => {});
}

function warnIfDefaultKey() {
  if (ENCRYPTION_KEY === "default-key-change-me" && !hasWarnedAboutDefaultKey) {
    logger.warn("Using default ENCRYPTION_KEY – set a secure value in env.");
    hasWarnedAboutDefaultKey = true;
  }
}

export interface APIKeySettings {
  openai?: string;
  anthropic?: string;
  azure?: {
    apiKey: string;
    endpoint: string;
    deployment?: string;
  };
  huggingface?: string;
  custom?: Record<string, string>;
  lastUpdated?: string;
}

/**
 * Encrypt a value
 */
function encrypt(text: string): string {
  if (!text) return "";
  
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    logger.error({ error }, "Failed to encrypt value");
    return text; // Fallback to plain text
  }
}

/**
 * Decrypt a value
 */
function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    if (!ivHex || !encrypted) return encryptedText; // Not encrypted
    
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    logger.error({ error }, "Failed to decrypt value");
    return encryptedText; // Return as is
  }
}

/**
 * Load API key settings from file
 */
export async function loadAPIKeys(): Promise<APIKeySettings> {
  try {
    await ensureConfigDir();
    warnIfDefaultKey();
    const data = await fs.readFile(SETTINGS_FILE, "utf8");
    const encrypted = JSON.parse(data) as APIKeySettings;
    
    // Decrypt all keys
    const decrypted: APIKeySettings = {
      lastUpdated: encrypted.lastUpdated,
    };
    
    if (encrypted.openai) {
      decrypted.openai = decrypt(encrypted.openai);
    }
    if (encrypted.anthropic) {
      decrypted.anthropic = decrypt(encrypted.anthropic);
    }
    if (encrypted.azure) {
      decrypted.azure = {
        apiKey: decrypt(encrypted.azure.apiKey),
        endpoint: encrypted.azure.endpoint,
        deployment: encrypted.azure.deployment,
      };
    }
    if (encrypted.huggingface) {
      decrypted.huggingface = decrypt(encrypted.huggingface);
    }
    if (encrypted.custom) {
      decrypted.custom = {};
      for (const [key, value] of Object.entries(encrypted.custom)) {
        decrypted.custom[key] = decrypt(value);
      }
    }
    
    return decrypted;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      logger.info("No API keys file found, creating empty settings file");
      const empty: APIKeySettings = { lastUpdated: new Date().toISOString() };
      await ensureConfigDir();
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    
    logger.error({ error }, "Failed to load API keys");
    return {};
  }
}

/**
 * Save API key settings to file (encrypted)
 */
export async function saveAPIKeys(settings: APIKeySettings): Promise<void> {
  try {
    // Ensure config directory exists
    await ensureConfigDir();
    warnIfDefaultKey();
    
    // Encrypt all keys
    const encrypted: APIKeySettings = {
      lastUpdated: new Date().toISOString(),
    };
    
    if (settings.openai) {
      encrypted.openai = encrypt(settings.openai);
    }
    if (settings.anthropic) {
      encrypted.anthropic = encrypt(settings.anthropic);
    }
    if (settings.azure) {
      encrypted.azure = {
        apiKey: encrypt(settings.azure.apiKey),
        endpoint: settings.azure.endpoint,
        deployment: settings.azure.deployment,
      };
    }
    if (settings.huggingface) {
      encrypted.huggingface = encrypt(settings.huggingface);
    }
    if (settings.custom) {
      encrypted.custom = {};
      for (const [key, value] of Object.entries(settings.custom)) {
        encrypted.custom[key] = encrypt(value);
      }
    }
    
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(encrypted, null, 2),
      "utf8"
    );
    
    logger.info("API keys saved successfully");
  } catch (error) {
    logger.error({ error }, "Failed to save API keys");
    throw error;
  }
}

/**
 * Update a single API key
 */
export async function updateAPIKey(
  provider: string,
  value: string | { apiKey: string; endpoint: string; deployment?: string }
): Promise<void> {
  const settings = await loadAPIKeys();
  
  switch (provider) {
    case "openai":
      settings.openai = value as string;
      break;
    case "anthropic":
      settings.anthropic = value as string;
      break;
    case "azure":
      settings.azure = value as { apiKey: string; endpoint: string; deployment?: string };
      break;
    case "huggingface":
      settings.huggingface = value as string;
      break;
    default:
      if (!settings.custom) settings.custom = {};
      settings.custom[provider] = value as string;
  }
  
  await saveAPIKeys(settings);
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(provider: string): Promise<void> {
  const settings = await loadAPIKeys();
  
  switch (provider) {
    case "openai":
      delete settings.openai;
      break;
    case "anthropic":
      delete settings.anthropic;
      break;
    case "azure":
      delete settings.azure;
      break;
    case "huggingface":
      delete settings.huggingface;
      break;
    default:
      if (settings.custom) {
        delete settings.custom[provider];
      }
  }
  
  await saveAPIKeys(settings);
}

/**
 * Validate an API key (basic format check)
 */
export function validateAPIKey(provider: string, key: string): boolean {
  if (!key || key.trim().length === 0) return false;
  
  switch (provider) {
    case "openai":
      // OpenAI keys start with "sk-"
      return key.startsWith("sk-") && key.length > 20;
    case "anthropic":
      // Anthropic keys start with "sk-ant-"
      return key.startsWith("sk-ant-") && key.length > 20;
    case "azure":
      // Azure keys are 32 character hex strings
      return /^[a-f0-9]{32}$/i.test(key);
    case "huggingface":
      // HuggingFace keys start with "hf_"
      return key.startsWith("hf_") && key.length > 10;
    default:
      // For custom providers, just check it's not empty
      return key.trim().length > 0;
  }
}

/**
 * Get sanitized API keys for display (only show last 4 characters)
 */
export async function getSanitizedAPIKeys(): Promise<Record<string, string>> {
  const settings = await loadAPIKeys();
  const sanitized: Record<string, string> = {};
  
  if (settings.openai) {
    sanitized.openai = `sk-...${settings.openai.slice(-4)}`;
  }
  if (settings.anthropic) {
    sanitized.anthropic = `sk-ant-...${settings.anthropic.slice(-4)}`;
  }
  if (settings.azure?.apiKey) {
    sanitized.azure = `***...${settings.azure.apiKey.slice(-4)}`;
  }
  if (settings.huggingface) {
    sanitized.huggingface = `hf_...${settings.huggingface.slice(-4)}`;
  }
  if (settings.custom) {
    for (const [key, value] of Object.entries(settings.custom)) {
      sanitized[key] = `***...${value.slice(-4)}`;
    }
  }
  
  return sanitized;
}
