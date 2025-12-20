// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/createAdminUser.ts

/**
 * Script to create a default admin user for testing
 * Usage: tsx src/scripts/createAdminUser.ts
 */

import "dotenv/config";
import { AuthService } from "../routes/auth/authService.js";
import db from "../routes/database/dbService.js";

interface RoleRecord {
  id: string;
  name: string;
  display_name: string;
}

interface UserRecord {
  id: string;
  username: string;
  email: string;
}

/**
 * Creates a default admin user with super_admin role
 * @returns Promise<void> - Exits process on completion or error
 */
async function createAdminUser(): Promise<void> {
  try {
    console.log("Initializing database...");
    await db.init();

    console.log("Initializing authentication tables...");
    await AuthService.init();

    const existingAdmin = await db.get<UserRecord>(
      "SELECT * FROM users WHERE username = ?",
      ["admin"],
    );

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Username: admin");
      console.log(
        "If you forgot the password, delete the user from the database and run this script again.",
      );
      process.exit(0);
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
    console.log("Creating admin user...");

    const admin = await AuthService.register({
      username: "admin",
      email: "admin@erp-steinmetz.local",
      password: adminPassword,
      full_name: "System Administrator",
    });

    // Get super_admin role (not just "Admin")
    const superAdminRole = await db.get<RoleRecord>(
      "SELECT * FROM roles WHERE name = ?",
      ["super_admin"],
    );

    if (superAdminRole) {
      await AuthService.assignRole(admin.id, superAdminRole.id, admin.id);
      console.log(`${superAdminRole.display_name} role assigned successfully`);
    } else {
      console.warn("⚠️  Warning: super_admin role not found!");
      console.log("Run migrations to create system roles.");
    }

    // Mark as verified
    await db.run("UPDATE users SET is_verified = 1 WHERE id = ?", [admin.id]);

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Username: admin");
    console.log(`Password: ${adminPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nPlease change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
