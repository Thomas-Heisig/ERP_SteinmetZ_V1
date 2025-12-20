// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/assignAdminRole.ts

/**
 * Script to assign super_admin role to existing admin user
 * Usage: tsx src/scripts/assignAdminRole.ts
 */

import "dotenv/config";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UserRecord {
  id: string;
  username: string;
  email: string;
}

interface RoleRecord {
  id: string;
  name: string;
  display_name: string;
}

interface UserRoleRecord {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
}

interface RoleAssignment {
  username: string;
  role_name: string;
  display_name: string;
}

interface RoleDisplay {
  name: string;
  display_name: string;
}

/**
 * Assigns super_admin role to the admin user
 * @returns void - Exits process on completion or error
 */
function assignAdminRole(): void {
  let db: Database.Database | null = null;

  try {
    const dbPath = path.join(__dirname, "../../../../data/dev.sqlite3");
    db = new Database(dbPath);

    console.log("🔍 Checking admin user...");

    // Get admin user
    const admin = db
      .prepare<string, UserRecord>(
        "SELECT id, username, email FROM users WHERE username = ?"
      )
      .get("admin");

    if (!admin) {
      console.error("❌ Admin user not found!");
      console.log("Run: npm run script:create-admin");
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${admin.email}`);

    // Get super_admin role
    const superAdminRole = db
      .prepare<string, RoleRecord>(
        "SELECT id, name, display_name FROM roles WHERE name = ?"
      )
      .get("super_admin");

    if (!superAdminRole) {
      console.error("❌ Super Admin role not found!");
      console.log("Database migrations may not have run correctly.");
      process.exit(1);
    }

    console.log(`✅ Found role: ${superAdminRole.display_name}`);

    // Check if already assigned
    const existing = db
      .prepare<[string, string], UserRoleRecord>(
        "SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?"
      )
      .get(admin.id, superAdminRole.id);

    if (existing) {
      console.log("ℹ️  Super Admin role already assigned to admin user");

      // Show current roles
      const roles = db
        .prepare<string, RoleDisplay>(`
          SELECT r.name, r.display_name 
          FROM user_roles ur 
          JOIN roles r ON ur.role_id = r.id 
          WHERE ur.user_id = ?
        `)
        .all(admin.id);

      console.log("\n📋 Current roles:");
      roles.forEach((role) => {
        console.log(`   - ${role.display_name} (${role.name})`);
      });

      db.close();
      process.exit(0);
    }

    // Assign super_admin role
    console.log("🔧 Assigning Super Admin role...");

    db.prepare<[string, string, string]>(`
      INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(admin.id, superAdminRole.id, admin.id);

    // Verify assignment
    const verification = db
      .prepare<string, RoleAssignment>(`
        SELECT u.username, r.name as role_name, r.display_name 
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = ?
      `)
      .all(admin.id);

    console.log("\n✅ Super Admin role assigned successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`User: ${admin.username} (${admin.email})`);
    console.log("\n📋 Assigned roles:");
    verification.forEach((v) => {
      console.log(`   ✓ ${v.display_name} (${v.role_name})`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🎉 Admin user can now access all system functions!");

    db.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning admin role:", error);
    if (db) {
      db.close();
    }
    process.exit(1);
  }
}

assignAdminRole();
