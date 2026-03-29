import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";
import { TransactionTabs } from "./_components/TransactionTabs";

export default async function AddTransactionPage({ searchParams }) {
  const params  = await searchParams;
  const accounts = await getUserAccounts();
  const editId   = params?.edit;

  let initialData = null;
  if (editId) {
    initialData = await getTransaction(editId);
  }

  // ── Edit mode: show form directly, no tabs needed ──
  if (editId) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title">Edit Transaction</h1>
        </div>
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={true}
          initialData={initialData}
        />
      </div>
    );
  }

  // ── Create mode: show tabs with form inside ──
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">Add Transaction</h1>
      </div>

      <TransactionTabs
        accounts={accounts}
        categories={defaultCategories}
      />
    </div>
  );
}
