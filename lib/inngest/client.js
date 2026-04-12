import { Inngest } from "inngest";

export const inngest = new Inngest({
  id:            "finance-platform",
  name:          "Finance Platform",
  retryAttempts: 2,
});