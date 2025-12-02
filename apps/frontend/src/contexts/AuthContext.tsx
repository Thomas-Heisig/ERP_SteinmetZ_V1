// SPDX-License-Identifier: MIT
// apps/frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: string[];
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    roles: [],
    permissions: [],
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token) {
        try {
          // Validate token with backend
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setState({
              user: data.user,
              roles: data.roles || [],
              permissions: data.permissions || [],
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, try to refresh
            if (refreshToken) {
              await tryRefreshToken(refreshToken);
            } else {
              clearAuthState();
            }
          }
        } catch (error) {
          console.error("Failed to load auth state:", error);
          clearAuthState();
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const tryRefreshToken = async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        localStorage.setItem("token", newToken);

        // Get user info with new token
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState({
            user: userData.user,
            roles: userData.roles || [],
            permissions: userData.permissions || [],
            token: newToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          clearAuthState();
        }
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      clearAuthState();
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setState({
      user: null,
      roles: [],
      permissions: [],
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success && data.token) {
        // Store tokens
        localStorage.setItem("token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        // Get user info
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState({
            user: userData.user,
            roles: userData.roles || [],
            permissions: userData.permissions || [],
            token: data.token,
            refreshToken: data.refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthState();
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // After successful registration, log in automatically
      await login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const refreshAuth = async () => {
    if (state.refreshToken) {
      await tryRefreshToken(state.refreshToken);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.isAuthenticated) return false;

    // Check for wildcard permission
    if (state.permissions.includes("*")) return true;

    // Check for exact permission
    if (state.permissions.includes(permission)) return true;

    // Check for pattern matching (e.g., "dashboard.*" matches "dashboard.read")
    const permissionParts = permission.split(".");
    for (const perm of state.permissions) {
      if (perm.endsWith(".*")) {
        const permBase = perm.slice(0, -2);
        if (permission.startsWith(permBase)) {
          return true;
        }
      }
    }

    return false;
  };

  const hasRole = (roleName: string): boolean => {
    if (!state.isAuthenticated) return false;
    return state.roles.some((role) => role.name === roleName);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshAuth,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
