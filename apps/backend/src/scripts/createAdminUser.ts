// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/createAdminUser.ts

/**
 * Script to create a default admin user for testing
 * Usage: tsx src/scripts/createAdminUser.ts
 */

import "dotenv/config";
import { AuthService } from "../services/authService.js";
import db from "../services/dbService.js";

async function createAdminUser() {
  try {
    console.log("Initializing database...");
    await db.init();

    console.log("Initializing authentication tables...");
    await AuthService.init();

    // Check if admin user already exists
    const existingAdmin = await db.get(
      "SELECT * FROM users WHERE username = ?",
      ["admin"],
    );

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Username: admin");
      console.log("If you forgot the password, delete the user from the database and run this script again.");
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

    // Get Admin role
    const adminRole = await db.get("SELECT * FROM roles WHERE name = ?", [
      "Admin",
    ]);

    if (adminRole) {
      await AuthService.assignRole(admin.id, adminRole.id, admin.id);
      console.log("Admin role assigned successfully");
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
