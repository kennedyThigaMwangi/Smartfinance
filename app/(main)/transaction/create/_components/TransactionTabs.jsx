'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AddTransactionForm } from '../../_components/transaction-form';
import { BulkUploadTab } from './BulkUploadTab';
import { QuickAddTab } from './QuickAddTab';

const TABS = [
  { id: 'INCOME', label: 'Income', emoji: '💰' },
  { id: 'EXPENSE', label: 'Expense', emoji: '💸' },
  { id: 'TRANSFER', label: 'Transfer', emoji: '🔄' },
  { id: 'QUICK_ADD', label: 'Quick Add', emoji: '⚡' },
  { id: 'BULK', label: 'Bulk Upload', emoji: '📤' },
];

export function TransactionTabs({ accounts, categories }) {
  const [activeTab, setActiveTab] = useState('EXPENSE');

  return (
    <div className="w-full">
      {/* ── Tab Strip ── */}
      <div
        className="flex rounded-xl border border-gray-200 dark:border-gray-700
                      bg-gray-100 dark:bg-gray-800 p-1 gap-1 mb-8 flex-wrap sm:flex-nowrap"
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg',
              'text-sm font-medium transition-all duration-200 cursor-pointer min-w-fit',
              activeTab === tab.id
                ? tab.id === 'BULK' || tab.id === 'QUICK_ADD'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            <span className="text-base">{tab.emoji}</span>
            <span className="whitespace-nowrap">{tab.label}</span>
            {(tab.id === 'BULK' || tab.id === 'QUICK_ADD') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content — re-mounts with correct type on each tab switch ── */}
      <div key={activeTab}>
        {activeTab === 'QUICK_ADD' ? (
          <QuickAddTab accounts={accounts} categories={categories} />
        ) : activeTab === 'BULK' ? (
          <BulkUploadTab accounts={accounts} categories={categories} />
        ) : activeTab === 'TRANSFER' ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center
                          rounded-xl border border-dashed border-gray-200 dark:border-gray-700"
          >
            <span className="text-4xl mb-4">🔄</span>
            <h3 className="text-lg font-semibold mb-2">Transfer Between Accounts</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use the <strong>Account</strong> field below to select the source, and add a matching
              expense + income transaction to record a transfer.
            </p>
            <div className="mt-8 w-full">
              <AddTransactionForm
                accounts={accounts}
                categories={categories}
                editMode={false}
                initialData={{ type: 'EXPENSE' }}
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