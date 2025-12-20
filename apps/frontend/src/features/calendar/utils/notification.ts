// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/utils/notification.ts

/**
 * Simple Notification Utility
 * 
 * Provides basic notification functionality for calendar feature
 * until proper notification system is integrated.
 */

interface NotificationOptions {
  title: string;
  message: string;
}

export const Notification = {
  success({ title, message }: NotificationOptions): void {
    console.log(`✅ ${title}: ${message}`);
    // TODO: Integrate with proper notification system
  },

  error({ title, message }: NotificationOptions): void {
    console.error(`❌ ${title}: ${message}`);
    // TODO: Integrate with proper notification system
  },

  info({ title, message }: NotificationOptions): void {
    console.info(`ℹ️ ${title}: ${message}`);
    // TODO: Integrate with proper notification system
  },

  warning({ title, message }: NotificationOptions): void {
    console.warn(`⚠️ ${title}: ${message}`);
    // TODO: Integrate with proper notification system
  },
};
