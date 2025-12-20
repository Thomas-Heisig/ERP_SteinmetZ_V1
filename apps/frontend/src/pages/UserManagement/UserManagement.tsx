// SPDX-License-Identifier: MIT
// apps/frontend/src/pages/UserManagement/UserManagement.tsx

import React, { useState, useEffect } from "react";
import styles from "./UserManagement.module.css";

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  roles?: Role[];
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/users", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/rbac/roles", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      const response = await fetch("/api/rbac/users/assign-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, roleId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign role");
      }

      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign role");
    }
  };

  const handleRevokeRole = async (userId: string, roleId: string) => {
    if (!confirm("Möchten Sie diese Rolle wirklich entziehen?")) {
      return;
    }

    try {
      const response = await fetch("/api/rbac/users/revoke-role", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, roleId }),
      });

      if (!response.ok) {
        throw new Error("Failed to revoke role");
      }

      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke role");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle user status");
      }

      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Lade Benutzerdaten...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>❌ Fehler</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className={styles.retryBtn}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>👥 Benutzerverwaltung</h1>
        <p>Verwalten Sie Benutzer und deren Berechtigungen</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👤</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{users.length}</div>
            <div className={styles.statLabel}>Gesamt Benutzer</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {users.filter((u) => u.is_active).length}
            </div>
            <div className={styles.statLabel}>Aktive Benutzer</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔒</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {users.filter((u) => !u.is_active).length}
            </div>
            <div className={styles.statLabel}>Deaktivierte</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎭</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{roles.length}</div>
            <div className={styles.statLabel}>Verfügbare Rollen</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Benutzer</th>
              <th>E-Mail</th>
              <th>Status</th>
              <th>Rollen</th>
              <th>Erstellt</th>
              <th>Letzter Login</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={!user.is_active ? styles.inactive : ""}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.full_name}</div>
                      <div className={styles.userUsername}>@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      user.is_active ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {user.is_active ? "✅ Aktiv" : "❌ Deaktiviert"}
                  </span>
                </td>
                <td>
                  <div className={styles.rolesCell}>
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span key={role.id} className={styles.roleBadge}>
                          {role.display_name}
                          <button
                            className={styles.roleRemoveBtn}
                            onClick={() => handleRevokeRole(user.id, role.id)}
                            title="Rolle entziehen"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className={styles.noRoles}>Keine Rollen</span>
                    )}
                  </div>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString("de-DE")}</td>
                <td>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString("de-DE")
                    : "Nie"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleModal(true);
                      }}
                      title="Rolle zuweisen"
                    >
                      🎭
                    </button>
                    <button
                      className={`${styles.actionBtn} ${
                        user.is_active ? styles.deactivateBtn : styles.activateBtn
                      }`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      title={user.is_active ? "Deaktivieren" : "Aktivieren"}
                    >
                      {user.is_active ? "🔒" : "🔓"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRoleModal && selectedUser && (
        <div className={styles.modal} onClick={() => setShowRoleModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Rolle zuweisen: {selectedUser.full_name}</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowRoleModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>
                Wählen Sie eine Rolle für {selectedUser.username}:
              </p>
              <div className={styles.rolesList}>
                {roles.map((role) => {
                  const hasRole = selectedUser.roles?.some((r) => r.id === role.id);
                  return (
                    <div key={role.id} className={styles.roleItem}>
                      <div className={styles.roleItemInfo}>
                        <div className={styles.roleItemName}>
                          {role.display_name}
                        </div>
                        <div className={styles.roleItemDesc}>
                          {role.description}
                        </div>
                      </div>
                      <button
                        className={`${styles.roleItemBtn} ${
                          hasRole ? styles.roleItemBtnAssigned : ""
                        }`}
                        onClick={() =>
                          !hasRole && handleAssignRole(selectedUser.id, role.id)
                        }
                        disabled={hasRole}
                      >
                        {hasRole ? "✓ Zugewiesen" : "+ Zuweisen"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
