import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  processRecurringTransaction,
  triggerRecurringTransactions,
  generateWeeklyReports,
  generateMonthlyReports,
  generateYearlyReports,
  checkBudgetAlerts,
} from "@/lib/inngest/functions";

// ─────────────────────────────────────────────────────────────────────────────
// This route is REQUIRED for Inngest to work.
// It exposes GET / POST / PUT so the Inngest cloud (or local dev server) can:
//   • discover which functions your app has registered
//   • invoke cron jobs on schedule
//   • deliver events to the correct handler
//
// Place this file at:  app/api/inngest/route.ts
// ─────────────────────────────────────────────────────────────────────────────

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,   // event: "transaction.recurring.process"
    triggerRecurringTransactions,  // cron:  daily   — sends recurring events
    generateWeeklyReports,         // cron:  Monday 08:00
    generateMonthlyReports,        // cron:  1st of month 00:00
    generateYearlyReports,         // cron:  Jan 1st  08:00
    checkBudgetAlerts,             // cron:  every 6 hours
  ],
});