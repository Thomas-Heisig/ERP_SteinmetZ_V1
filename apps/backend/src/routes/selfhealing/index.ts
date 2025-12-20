// SPDX-License-Identifier: MIT
// apps/backend/src/services/selfhealing/index.ts

import healthMonitor, {
  DatabaseHealthMonitor,
} from "./DatabaseHealthMonitor.js";
import { AutoRepair } from "./AutoRepair.js";
import { SelfHealingScheduler } from "./SelfHealingScheduler.js";
import healingReport, { HealingReport } from "./HealingReport.js";

// Instanzen erstellen
const autoRepair = new AutoRepair(healthMonitor);
const scheduler = new SelfHealingScheduler(
  healthMonitor,
  autoRepair,
  healingReport,
);

// Export
export {
  healthMonitor,
  autoRepair,
  scheduler,
  healingReport,
  DatabaseHealthMonitor,
  AutoRepair,
  SelfHealingScheduler,
  HealingReport,
};

export default {
  healthMonitor,
  autoRepair,
  scheduler,
  healingReport,
};
