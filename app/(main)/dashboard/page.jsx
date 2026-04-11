import { Suspense } from "react";
import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  // ── Safe fetch: Supabase free tier sleeps and can throw ──────────────────
  let accounts = [];
  let transactions = [];

  try {
    [accounts, transactions] = await Promise.all([
      getUserAccounts(),
      getDashboardData(),
    ]);

    // Guarantee arrays even if actions return null/undefined
    accounts     = accounts     ?? [];
    transactions = transactions ?? [];
  } catch (err) {
    console.error("[DashboardPage] Failed to fetch data:", err?.message);
    // Render empty state rather than crash — DB may still be waking up
  }

  const defaultAccount = accounts.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    try {
      budgetData = await getCurrentBudget(defaultAccount.id);
    } catch (err) {
      console.error("[DashboardPage] Failed to fetch budget:", err?.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses ?? 0}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions}
      />

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>

      {/* DB wake-up notice — only shown when accounts failed to load */}
      {accounts.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          Database is waking up — please refresh in a few seconds.
        </p>
      )}
    </div>
  );
}