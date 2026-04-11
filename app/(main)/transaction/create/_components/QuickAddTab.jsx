'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { bulkCreateTransactions } from '@/actions/bulk-transactions';
import {
  CheckCircle2, Loader2, AlertCircle, CheckSquare, Square,
  ChevronDown, Trash2, Info, Zap,
} from 'lucide-react';
import {
  detectMpesaFormat,
  autoDetectAndConvertMpesa,
  convertToDbFormat,
  validateTransactions,
} from '@/lib/mpesa-auto-converter';

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const fmt = n =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = d =>
  new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION ROW
// ═══════════════════════════════════════════════════════════════════

function TransactionRow({ transaction: t, categories, onToggle, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const typeCats = categories.filter(c => c.type === t.type);

  return (
    <div className={cn('transition-colors', !t.selected && 'opacity-40')}>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center px-4 py-3">
        <button onClick={onToggle}>
          {t.selected ? (
            <CheckSquare className="w-4 h-4 text-blue-500" />
          ) : (
            <Square className="w-4 h-4 text-gray-300" />
          )}
        </button>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
        >
          <span className="truncate">{t.description || '—'}</span>
          <ChevronDown
            className={cn('w-3 h-3 shrink-0 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        <span
          className={cn(
            'text-sm font-semibold tabular-nums text-right',
            t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
          )}
        >
          {t.type === 'INCOME' ? '+' : '-'}
          {fmt(t.amount)}
        </span>

        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            t.type === 'INCOME'
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
          )}
        >
          {t.type === 'INCOME' ? 'IN' : 'OUT'}
        </span>

        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(t.date)}</span>

        <div className="flex items-center gap-1">
          <select
            value={t.category || ''}
            onChange={e => onUpdate({ category: e.target.value })}
            className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-1.5 py-1 max-w-[100px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">No category</option>
            {typeCats.map(c => (
              <option key={c.id || c.name} value={c.id || c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-10 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Description</span>
            <input
              value={t.description}
              onChange={e => onUpdate({ description: e.target.value })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Amount (KES)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={t.amount}
              onChange={e => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Date</span>
            <input
              type="date"
              value={new Date(t.date).toISOString().slice(0, 10)}
              onChange={e => onUpdate({ date: new Date(e.target.value) })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Type</span>
            <select
              value={t.type}
              onChange={e => onUpdate({ type: e.target.value })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </label>
          {t.receiptNo && (
            <label className="flex flex-col gap-1 col-span-2">
              <span className="text-xs text-gray-400">M-Pesa Receipt No.</span>
              <input
                readOnly
                value={t.receiptNo}
                className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-gray-400 cursor-not-allowed"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY CHIP
// ═══════════════════════════════════════════════════════════════════

function SummaryChip({ label, value, unit, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    emerald:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  };
  return (
    <div className={cn('p-3 rounded-xl border text-center', colors[color])}>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{unit || label}</p>
      {unit && <p className="text-xs font-medium">{label}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function QuickAddTab({ accounts = [], categories = [] }) {
  const [text, setText] = useState('');
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [errors, setErrors] = useState([]);
  const [detectedFormat, setDetectedFormat] = useState('');
  const [stats, setStats] = useState(null);

  // Parse on text change with auto-converter
  const handleTextChange = useCallback(
    newText => {
      setText(newText);

      if (!newText.trim()) {
        setRows([]);
        setErrors([]);
        setDetectedFormat('');
        setStats(null);
        return;
      }

      try {
        // Use the auto-converter
        const result = autoDetectAndConvertMpesa(newText, categories);

        setDetectedFormat(result.format);
        setStats(result.stats);

        if (result.transactions.length === 0) {
          setErrors(result.errors.length > 0 ? result.errors : ['No transactions found']);
          setRows([]);
          return;
        }

        // Add selection flag for UI
        const withSelection = result.transactions.map(tx => ({
          ...tx,
          id: tx.receiptNo || `tx-${Math.random().toString(36).slice(2)}`,
          selected: true,
        }));

        setRows(withSelection);
        setErrors(result.errors);
      } catch (err) {
        setErrors([err.message]);
        setRows([]);
        setDetectedFormat('ERROR');
      }
    },
    [categories]
  );

  // Memoize calculations
  const selectedCount = useMemo(
    () => rows.filter(t => t.selected).length,
    [rows]
  );

  const incomeTotal = useMemo(
    () => rows
      .filter(t => t.selected && t.type === 'INCOME')
      .reduce((s, t) => s + t.amount, 0),
    [rows]
  );

  const expenseTotal = useMemo(
    () => rows
      .filter(t => t.selected && t.type === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0),
    [rows]
  );

  // Handlers
  const toggleRow = id => setRows(r => r.map(t => (t.id === id ? { ...t, selected: !t.selected } : t)));
  const toggleAll = () => {
    const all = rows.every(t => t.selected);
    setRows(r => r.map(t => ({ ...t, selected: !all })));
  };
  const updateRow = (id, patch) => setRows(r => r.map(t => (t.id === id ? { ...t, ...patch } : t)));
  const removeRow = id => setRows(r => r.filter(t => t.id !== id));

  const handleSubmit = async () => {
    if (!selectedAccount) {
      toast.error('Please select a target account');
      return;
    }

    const selected = rows.filter(t => t.selected);
    if (selected.length === 0) {
      toast.error('Select at least one transaction');
      return;
    }

    setSubmitting(true);

    try {
      // Convert to database format
      const dbTransactions = convertToDbFormat(selected, selectedAccount, categories);

      const res = await bulkCreateTransactions(dbTransactions);

      if (res.count > 0) {
        toast.success(`✓ ${res.count} transaction${res.count !== 1 ? 's' : ''} saved!`);
      }
      if (res.skipped > 0) {
        toast.info(`⊘ ${res.skipped} skipped (already imported).`);
      }
      if (res.errors?.length > 0) {
        toast.error(`✕ ${res.errors.length} error${res.errors.length !== 1 ? 's' : ''}`);
        setErrors(res.errors);
      }

      // Reset on success
      if (res.count > 0) {
        setText('');
        setRows([]);
        setSelectedAccount('');
        setErrors([]);
        setDetectedFormat('');
        setStats(null);
      }
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Info box */}
      <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">⚡ Auto-Import M-Pesa Transactions</p>
          <p className="text-blue-600 dark:text-blue-400 text-xs">
            Paste one or multiple M-Pesa SMS messages, CSV exports, or statements. 
            We'll auto-detect the format, extract details, and save them to your database.
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Paste M-Pesa SMS or statement
        </label>
        <textarea
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder="Paste M-Pesa SMS, CSV, or statement here…

Example SMS:
UD8GI064RA Confirmed. Ksh50.00 paid to ELIZABETH MWENDE. on 8/4/26 at 9:14 PM.
UD8GI064RB Confirmed. Ksh200.00 received from JOHN. on 8/4/26 at 10:30 PM."
          rows={8}
          className="w-full text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
        />
      </div>

      {/* Format detection badge */}
      {detectedFormat && detectedFormat !== 'UNKNOWN' && (
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Format detected: <span className="font-semibold">{detectedFormat}</span>
          </span>
          {stats && (
            <span className="text-gray-500 dark:text-gray-500">
              • {stats.total} transaction{stats.total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="flex gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-sm text-rose-700 dark:text-rose-300">
            <p className="font-semibold mb-2">Issues detected</p>
            <ul className="list-disc ml-4 space-y-1 text-xs">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Preview ({rows.length} transaction{rows.length !== 1 ? 's' : ''})
            </h3>
          </div>

          {/* Account selection */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300 shrink-0">
              <AlertCircle className="w-4 h-4" /> Target Account:
            </div>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="flex-1 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Select account --</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({fmt(a.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryChip label="Selected" value={selectedCount} unit="transactions" color="blue" />
            <SummaryChip label="Income" value={fmt(incomeTotal)} color="emerald" />
            <SummaryChip label="Expenses" value={fmt(expenseTotal)} color="rose" />
          </div>

          {/* Transaction table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <button onClick={toggleAll} className="flex items-center">
                {rows.every(t => t.selected) ? (
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span>Type</span>
              <span>Date</span>
              <span>Category</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[420px] overflow-y-auto">
              {rows.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  categories={categories}
                  onToggle={() => toggleRow(t.id)}
                  onUpdate={patch => updateRow(t.id, patch)}
                  onRemove={() => removeRow(t.id)}
                />
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedCount === 0 || !selectedAccount}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
                submitting || selectedCount === 0 || !selectedAccount
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/40'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Convert {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
