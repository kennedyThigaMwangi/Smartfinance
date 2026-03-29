"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AddTransactionForm } from "../../_components/transaction-form";

const TABS = [
  { id: "INCOME",   label: "Income",   emoji: "💰" },
  { id: "EXPENSE",  label: "Expense",  emoji: "💸" },
  { id: "TRANSFER", label: "Transfer", emoji: "🔄" },
];

export function TransactionTabs({ accounts, categories }) {
  const [activeTab, setActiveTab] = useState("EXPENSE");

  return (
    <div className="w-full">
      {/* ── Tab Strip ── */}
      <div className="flex rounded-xl border border-gray-200 dark:border-gray-700
                      bg-gray-100 dark:bg-gray-800 p-1 gap-1 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg",
              "text-sm font-medium transition-all duration-200 cursor-pointer",
              activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Form — re-mounts with correct type on each tab switch ── */}
      <div key={activeTab}>
        {activeTab === "TRANSFER" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center
                          rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-4xl mb-4">🔄</span>
            <h3 className="text-lg font-semibold mb-2">Transfer Between Accounts</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use the <strong>Account</strong> field below to select the source, 
              and add a matching expense + income transaction to record a transfer.
            </p>
            <div className="mt-8 w-full">
              <AddTransactionForm
                accounts={accounts}
                categories={categories}
                editMode={false}
                initialData={{ type: "EXPENSE" }}
              />
            </div>
          </div>
        ) : (
          <AddTransactionForm
            accounts={accounts}
            categories={categories}
            editMode={false}
            initialData={{ type: activeTab }}
          />
        )}
      </div>
    </div>
  );
}
