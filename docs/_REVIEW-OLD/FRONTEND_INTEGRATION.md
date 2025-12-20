# Frontend-Integration - API & TypeScript Typen

**Letzte Aktualisierung:** 20. Dezember 2025  
**Version:** 1.0.0  
**Status:** ✅ Produktionsreif

---

## 📋 Inhaltsverzeichnis

1. [Setup & Installation](#setup--installation)
2. [API-Client](#api-client)
3. [Type Definitions](#type-definitions)
4. [Error Handling](#error-handling)
5. [Authentication](#authentication)
6. [React Hooks](#react-hooks)
7. [API Endpoints](#api-endpoints)
8. [Beispiele](#beispiele)

---

## Setup & Installation

### Schritt 1: Backend-Server starten

```bash
cd apps/backend
npm run dev
```

Der Server läuft unter `http://localhost:3000`.

### Schritt 2: Frontend-Dependencies installieren

```bash
cd apps/frontend
npm install
```

### Schritt 3: API-Client konfigurieren

**Datei:** `apps/frontend/src/api/client.ts`

```typescript
import axios, { AxiosInstance } from "axios";

/**
 * API Client für Backend-Kommunikation
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Axios Interceptor für Token-Handling
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Error Interceptor
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

### Schritt 4: Environment-Variablen

**Datei:** `apps/frontend/.env`

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:3000/api

# Features
REACT_APP_ENABLE_AI=true
REACT_APP_ENABLE_DMS=true

# Debugging
REACT_APP_DEBUG=false
```

---

## API-Client

### Struktur

```
src/api/
├── client.ts           # Axios Instanz
├── auth.ts            # Auth Endpoints
├── documents.ts       # DMS Endpoints
├── users.ts           # User Endpoints
├── hr.ts              # HR Endpoints
└── finance.ts         # Finance Endpoints
```

### Beispiel: Auth API

**Datei:** `apps/frontend/src/api/auth.ts`

```typescript
import apiClient from "./client";
import { LoginRequest, LoginResponse, User } from "../types/auth";

/**
 * Benutzer anmelden
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};

/**
 * Benutzer abmelden
 */
export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

/**
 * Aktiven Benutzer abrufen
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};

/**
 * Passwort ändern
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await apiClient.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

/**
 * Token refresh
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/refresh");
  return response.data;
};
```

### Beispiel: Documents API

**Datei:** `apps/frontend/src/api/documents.ts`

```typescript
import apiClient from "./client";
import {
  Document,
  CreateDocumentInput,
  DocumentFilters,
} from "../types/documents";

/**
 * Alle Dokumente abrufen
 */
export const getDocuments = async (filters?: DocumentFilters) => {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const response = await apiClient.get<{ data: Document[] }>(
    `/documents?${params.toString()}`,
  );
  return response.data.data;
};

/**
 * Einzelnes Dokument abrufen
 */
export const getDocument = async (id: string): Promise<Document> => {
  const response = await apiClient.get<{ data: Document }>(`/documents/${id}`);
  return response.data.data;
};

/**
 * Dokument hochladen
 */
export const uploadDocument = async (
  file: File,
  metadata: CreateDocumentInput,
): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", metadata.title);
  formData.append("category", metadata.category);
  formData.append("tags", JSON.stringify(metadata.tags || []));

  const response = await apiClient.post<{ data: Document }>(
    "/documents/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.data;
};

/**
 * Dokument löschen
 */
export const deleteDocument = async (id: string): Promise<void> => {
  await apiClient.delete(`/documents/${id}`);
};

/**
 * OCR-Verarbeitung starten
 */
export const processOCR = async (id: string): Promise<string> => {
  const response = await apiClient.post<{ data: { text: string } }>(
    `/documents/${id}/ocr`,
  );
  return response.data.data.text;
};
```

---

## Type Definitions

### Zentrale Typen

**Datei:** `apps/frontend/src/types/index.ts`

```typescript
// Re-export aller Typen
export * from "./auth";
export * from "./documents";
export * from "./users";
export * from "./common";
```

### Auth Types

**Datei:** `apps/frontend/src/types/auth.ts`

```typescript
/**
 * Benutzer-Objekt
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "viewer";
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
}

/**
 * Login-Request
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login-Response
 */
export interface LoginResponse {
  success: true;
  user: User;
  token: string;
  expiresIn: number; // in Sekunden
}

/**
 * Auth-State im Store
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

### Document Types

**Datei:** `apps/frontend/src/types/documents.ts`

```typescript
/**
 * Dokument-Objekt
 */
export interface Document {
  id: string;
  title: string;
  category: "invoice" | "contract" | "report" | "other";
  status: "active" | "archived" | "deleted";
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
  metadata?: {
    [key: string]: any;
  };
  previewUrl?: string;
  downloadUrl: string;
}

/**
 * Dokument-Filter
 */
export interface DocumentFilters {
  category?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Dokument-Erstellungs-Input
 */
export interface CreateDocumentInput {
  title: string;
  category: Document["category"];
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Dokument-Update-Input
 */
export interface UpdateDocumentInput {
  title?: string;
  category?: Document["category"];
  status?: Document["status"];
  tags?: string[];
}
```

### Common Types

**Datei:** `apps/frontend/src/types/common.ts`

```typescript
/**
 * API Response Envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  hasMore: boolean;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}
```

---

## Error Handling

### Error Interceptor

```typescript
import { ApiError } from "../types/common";

/**
 * Fehlerbehandlung für API-Calls
 */
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data?.error) {
    return {
      code: error.response.data.error.code,
      message: error.response.data.error.message,
      details: error.response.data.error.details,
      statusCode: error.response.status,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: error.message || "Ein unerwarteter Fehler ist aufgetreten",
    statusCode: error.response?.status || 500,
  };
};

/**
 * Error User Feedback
 */
export const getUserFriendlyMessage = (error: ApiError): string => {
  const messages: Record<string, string> = {
    BAD_REQUEST: "Die eingegebenen Daten sind ungültig",
    UNAUTHORIZED: "Bitte melden Sie sich an",
    FORBIDDEN: "Sie haben keine Berechtigung für diese Aktion",
    NOT_FOUND: "Die Ressource wurde nicht gefunden",
    CONFLICT: "Die Ressource existiert bereits",
    DATABASE_ERROR: "Datenbankfehler - bitte versuchen Sie es später",
    VALIDATION_ERROR: "Validierungsfehler - bitte überprüfen Sie die Eingaben",
    RATE_LIMIT_ERROR: "Zu viele Anfragen - bitte warten Sie",
  };

  return messages[error.code] || error.message || "Ein Fehler ist aufgetreten";
};
```

---

## Authentication

### Login Hook

```typescript
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, logout, getCurrentUser } from "../api/auth";
import { User } from "../types/auth";

/**
 * Custom Hook für Authentication
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await login({ email, password });
        localStorage.setItem("authToken", response.token);
        setUser(response.user);
        navigate("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      localStorage.removeItem("authToken");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (err) {
      setUser(null);
      localStorage.removeItem("authToken");
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
    isAuthenticated: !!user,
  };
}
```

---

## React Hooks

### useApi Hook

```typescript
import { useState, useEffect, useCallback } from "react";
import { ApiError } from "../types/common";
import { handleApiError } from "../api/error";

/**
 * Hook für API-Calls
 */
export function useApi<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}
```

**Verwendung:**

```typescript
const { data: documents, loading, error } = useApi(() =>
  getDocuments({ category: 'invoice' })
);

if (loading) return <Spinner />;
if (error) return <Alert type="error">{error.message}</Alert>;

return <DocumentList documents={documents} />;
```

---

## API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ...",
    "expiresIn": 3600
  }
}
```

```bash
# Logout
POST /api/auth/logout
Authorization: Bearer <token>
```

```bash
# Current User
GET /api/auth/me
Authorization: Bearer <token>
```

### Documents (DMS)

```bash
# List Documents
GET /api/documents?category=invoice&status=active
Authorization: Bearer <token>

# Get Single Document
GET /api/documents/:id
Authorization: Bearer <token>

# Upload Document
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <File>
- title: string
- category: string
- tags: JSON array

# Delete Document
DELETE /api/documents/:id
Authorization: Bearer <token>

# Process OCR
POST /api/documents/:id/ocr
Authorization: Bearer <token>
```

### Users

```bash
# List Users
GET /api/users
Authorization: Bearer <token>

# Get User
GET /api/users/:id
Authorization: Bearer <token>

# Create User
POST /api/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}

# Update User
PUT /api/users/:id
Authorization: Bearer <token>

# Delete User
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## Beispiele

### Login-Komponente

```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Passwort"
        required
      />
      {error && <Alert type="error">{error}</Alert>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
      </button>
    </form>
  );
}
```

### Document List-Komponente

```typescript
import { useApi } from '../hooks/useApi';
import { getDocuments } from '../api/documents';
import { Document } from '../types/documents';

export function DocumentList() {
  const { data: documents, loading, error, refetch } = useApi(() =>
    getDocuments({ category: 'invoice' })
  );

  if (loading) return <div>Wird geladen...</div>;
  if (error) return <div className="error">{error.message}</div>;

  return (
    <div>
      <h2>Dokumente</h2>
      <button onClick={() => refetch()}>Aktualisieren</button>
      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Kategorie</th>
            <th>Erstellt</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {documents?.map((doc: Document) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.category}</td>
              <td>{new Date(doc.createdAt).toLocaleDateString('de-DE')}</td>
              <td>
                <a href={doc.downloadUrl}>Herunterladen</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Document Upload-Komponente

```typescript
import { useState } from 'react';
import { uploadDocument } from '../api/documents';
import { CreateDocumentInput } from '../types/documents';

export function DocumentUpload({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<CreateDocumentInput>({
    title: '',
    category: 'other',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Bitte wählen Sie eine Datei');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await uploadDocument(file, metadata);
      setFile(null);
      setMetadata({ title: '', category: 'other' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={metadata.title}
        onChange={(e) =>
          setMetadata({ ...metadata, title: e.target.value })
        }
        placeholder="Dokumenttitel"
        required
      />
      <select
        value={metadata.category}
        onChange={(e) =>
          setMetadata({
            ...metadata,
            category: e.target.value as any,
          })
        }
      >
        <option value="invoice">Rechnung</option>
        <option value="contract">Vertrag</option>
        <option value="report">Bericht</option>
        <option value="other">Sonstige</option>
      </select>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      {error && <Alert type="error">{error}</Alert>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Wird hochgeladen...' : 'Hochladen'}
      </button>
    </form>
  );
}
```

---

**Letzte Aktualisierung:** 20. Dezember 2025 ✍️
