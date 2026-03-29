"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Smartphone, FileText } from "lucide-react";
import { AddTransactionForm } from "../_components/transaction-form";
import { MpesaImport } from "@/components/transactions/MpesaImport";
import { CsvImport } from "@/components/transactions/CsvImport";

const TABS = [
  { id: "manual",  label: "Manual Entry",  icon: PenLine,    color: "indigo" },
  { id: "mpesa",   label: "M-Pesa SMS",    icon: Smartphone, color: "green"  },
  { id: "csv",     label: "Bank CSV",      icon: FileText,   color: "blue"   },
];

const TAB_COLORS = {
  indigo: "border-indigo-600 text-indigo-600",
  green:  "border-green-600  text-green-600",
  blue:   "border-blue-600   text-blue-600",
};

export function TransactionTabs({ accounts, categories }) {
  const [activeTab, setActiveTab] = useState("manual");
  const router = useRouter();

  function handleSuccess() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon    = tab.icon;
          const active  = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                active
                  ? TAB_COLORS[tab.color]
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {activeTab === "manual" && (
          <AddTransactionForm
            accounts={accounts}
            categories={categories}
            editMode={false}
            initialData={null}
          />
        )}

        {activeTab === "mpesa" && (
          <MpesaImport onSuccess={handleSuccess} />
        )}

        {activeTab === "csv" && (
          <CsvImport onSuccess={handleSuccess} />
        )}
      </div>

    </div>
  );
}