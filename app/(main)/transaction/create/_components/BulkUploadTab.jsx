"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { bulkCreateTransactions } from "@/actions/bulk-transactions";
import {
  Upload, FileText, CheckCircle2, Loader2, ChevronDown,
  Trash2, RefreshCcw, AlertCircle, Info, CheckSquare, Square,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// PARSER  (inlined — no external import needed)
// ═══════════════════════════════════════════════════════════════════

function parseAmount(str = "") {
  if (!str || str.trim() === "") return 0;
  return parseFloat(str.replace(/,/g, "").trim()) || 0;
}

function parseDate(str = "") {
  if (!str) return new Date();
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyy) return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2,"0")}-${ddmmyyyy[1].padStart(2,"0")}`);
  const parsed = new Date(str);
  return isNaN(parsed) ? new Date() : parsed;
}

function splitCSVRow(row) {
  const result = [];
  let current = "", inQuotes = false;
  for (const ch of row) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, "")); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

function guessCategoryFromDetails(details = "", type = "EXPENSE", categories = []) {
  const lower = details.toLowerCase();
  const appCats = categories.filter((c) => c.type === type);
  const keywordMap = {
    food:          ["food","restaurant","naivas","carrefour","quickmart","supermarket","cafe","java","kfc","chicken","pizza"],
    transport:     ["uber","bolt","little","taxi","matatu","bus","fare","transport","fuel","petrol"],
    utilities:     ["kplc","electricity","water","safaricom","airtel","faiba","wifi","internet","zuku"],
    entertainment: ["netflix","dstv","showmax","youtube","spotify","gaming","cinema"],
    shopping:      ["jumia","kilimall","amazon","buy goods","shopping"],
    salary:        ["salary","payroll","wages"],
    transfers:     ["send money","received money","transfer"],
  };
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const match = appCats.find((c) => c.name.toLowerCase().includes(key));
      if (match) return match.id || match.name;
    }
  }
  return appCats[0]?.id || appCats[0]?.name || null;
}

function parseMpesaCSV(csvText, categories = []) {
  const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  let headerIdx = lines.findIndex((l) =>
    l.toLowerCase().includes("receipt") || l.toLowerCase().includes("completion")
  );
  if (headerIdx === -1) headerIdx = 0;

  const headers = splitCSVRow(lines[headerIdx]).map((h) =>
    h.toLowerCase().replace(/[\s.]/g, "")
  );

  const transactions = [];
  for (const row of lines.slice(headerIdx + 1)) {
    if (!row || row.startsWith("#")) continue;
    const cols = splitCSVRow(row);
    if (cols.length < 4) continue;

    const get = (key) => {
      const idx = headers.findIndex((h) => h.includes(key));
      return idx !== -1 ? (cols[idx] || "").trim() : "";
    };

    const receiptNo = get("receipt");
    const rawDate   = get("completion") || get("date") || get("time");
    const details   = get("details") || get("description") || get("narration");
    const status    = get("status") || "Completed";
    const paidIn    = parseAmount(get("paidin") || get("credit") || get("in"));
    const withdrawn = parseAmount(get("withdrawn") || get("debit") || get("out"));

    if (status && !status.toLowerCase().includes("complet")) continue;
    if (paidIn === 0 && withdrawn === 0) continue;

    const type     = paidIn > 0 ? "INCOME" : "EXPENSE";
    const amount   = paidIn > 0 ? paidIn : withdrawn;
    const date     = parseDate(rawDate);
    const category = guessCategoryFromDetails(details, type, categories);

    transactions.push({
      id: receiptNo || `mpesa-${Math.random().toString(36).slice(2)}`,
      type, amount, date, description: details,
      receiptNo, category, selected: true, source: "mpesa",
    });
  }
  return transactions;
}

function parseMpesaText(text, categories = []) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const transactions = [];
  const receiptPattern = /^([A-Z]{2,4}\d{7,10})\s+/;
  const datePattern    = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/;

  for (const line of lines) {
    if (!receiptPattern.test(line)) continue;
    const receiptMatch = line.match(receiptPattern);
    const receiptNo    = receiptMatch?.[1] || "";
    const rest         = line.replace(receiptPattern, "");
    const dateMatch    = rest.match(datePattern);
    const date         = parseDate(dateMatch?.[1] || "");
    const amounts      = [...rest.matchAll(/[\d,]+\.\d{2}/g)].map((m) => parseAmount(m[0]));
    if (amounts.length === 0) continue;

    let paidIn = 0, withdrawn = 0;
    if (amounts.length >= 3) { paidIn = amounts[0]; withdrawn = amounts[1]; }
    else { paidIn = amounts[0]; }

    const description = rest
      .replace(datePattern, "").replace(/[\d,]+\.\d{2}/g, "")
      .replace(/\s+/g, " ").trim();

    const type   = paidIn > 0 && withdrawn === 0 ? "INCOME" : "EXPENSE";
    const amount = type === "INCOME" ? paidIn : withdrawn;
    if (amount === 0) continue;

    transactions.push({
      id: receiptNo || `mpesa-txt-${Math.random().toString(36).slice(2)}`,
      type, amount, date, description, receiptNo,
      category: guessCategoryFromDetails(description, type, categories),
      selected: true, source: "mpesa",
    });
  }
  return transactions;
}

function parseMpesaStatement(content, categories = []) {
  const trimmed = content.trim();
  const isCSV   = trimmed.includes(",") &&
    (trimmed.toLowerCase().includes("receipt") ||
     trimmed.toLowerCase().includes("paid in") ||
     trimmed.toLowerCase().includes("withdrawn"));
  return isCSV ? parseMpesaCSV(trimmed, categories) : parseMpesaText(trimmed, categories);
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const fmt = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 2 }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file, "utf-8");
  });
}

// ═══════════════════════════════════════════════════════════════════
// STEP BAR
// ═══════════════════════════════════════════════════════════════════

const STEPS = ["Upload", "Review", "Done"];

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
              i < step  ? "bg-emerald-500 border-emerald-500 text-white"
              : i === step ? "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-200 text-gray-400 dark:border-gray-700"
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium", i === step ? "text-blue-500" : "text-gray-400")}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300",
              i < step ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY CHIP
// ═══════════════════════════════════════════════════════════════════

function SummaryChip({ label, value, unit, color }) {
  const colors = {
    blue:    "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    rose:    "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
  };
  return (
    <div className={cn("p-3 rounded-xl border text-center", colors[color])}>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{unit || label}</p>
      {unit && <p className="text-xs font-medium">{label}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRANSACTION ROW
// ═══════════════════════════════════════════════════════════════════

function TransactionRow({ transaction: t, categories, onToggle, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const typeCats = categories.filter((c) => c.type === t.type);

  return (
    <div className={cn("transition-colors", !t.selected && "opacity-40")}>
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center px-4 py-3">
        <button onClick={onToggle}>
          {t.selected
            ? <CheckSquare className="w-4 h-4 text-blue-500" />
            : <Square className="w-4 h-4 text-gray-300" />}
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
        >
          <span className="truncate">{t.description || "—"}</span>
          <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform", expanded && "rotate-180")} />
        </button>

        <span className={cn(
          "text-sm font-semibold tabular-nums text-right",
          t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
        )}>
          {t.type === "INCOME" ? "+" : "-"}{fmt(t.amount)}
        </span>

        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          t.type === "INCOME"
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
        )}>
          {t.type === "INCOME" ? "IN" : "OUT"}
        </span>

        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(t.date)}</span>

        <div className="flex items-center gap-1">
          <select
            value={t.category || ""}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-1.5 py-1 max-w-[100px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">No category</option>
            {typeCats.map((c) => (
              <option key={c.id || c.name} value={c.id || c.name}>{c.name}</option>
            ))}
          </select>
          <button onClick={onRemove} className="text-gray-300 hover:text-rose-500 transition-colors">
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
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Amount (KES)</span>
            <input
              type="number" min="0" step="0.01" value={t.amount}
              onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Date</span>
            <input
              type="date"
              value={new Date(t.date).toISOString().slice(0, 10)}
              onChange={(e) => onUpdate({ date: new Date(e.target.value) })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Type</span>
            <select
              value={t.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </label>
          {t.receiptNo && (
            <label className="flex flex-col gap-1 col-span-2">
              <span className="text-xs text-gray-400">M-Pesa Receipt No.</span>
              <input readOnly value={t.receiptNo}
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
// PASTE TEXT FALLBACK
// ═══════════════════════════════════════════════════════════════════

function PasteTextFallback({ onParsed, categories }) {
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const txns = parseMpesaStatement(text, categories);
      if (txns.length === 0) { toast.warning("No transactions found in pasted text."); return; }
      onParsed(txns);
      toast.success(`Parsed ${txns.length} transactions!`);
    } catch (e) {
      toast.error("Parse error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Or paste M-Pesa statement text directly
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="p-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
          <textarea
            rows={6}
            placeholder="Paste your M-Pesa statement CSV or plain text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />
          <button
            onClick={handle}
            disabled={loading || !text.trim()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              loading || !text.trim()
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Parse Text
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function BulkUploadTab({ accounts = [], categories = [] }) {
  const [step, setStep]             = useState(0);
  const [dragging, setDragging]     = useState(false);
  const [parsing, setParsing]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName]     = useState("");
  const [rows, setRows]             = useState([]);
  const [result, setResult]         = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || "");
  const fileRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(csv|txt)$/i) && !file.type.includes("text")) {
      toast.error("Please upload a CSV or TXT M-Pesa statement export.");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const text   = await readFileAsText(file);
      const parsed = parseMpesaStatement(text, categories);
      if (parsed.length === 0) {
        toast.warning("No transactions found. Make sure this is an M-Pesa CSV export.");
        return;
      }
      setRows(parsed);
      setStep(1);
      toast.success(`Parsed ${parsed.length} transactions!`);
    } catch (err) {
      toast.error("Failed to parse: " + err.message);
    } finally {
      setParsing(false);
    }
  }, [categories]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const toggleRow  = (id)        => setRows((r) => r.map((t) => t.id === id ? { ...t, selected: !t.selected } : t));
  const toggleAll  = ()          => { const all = rows.every((t) => t.selected); setRows((r) => r.map((t) => ({ ...t, selected: !all }))); };
  const updateRow  = (id, patch) => setRows((r) => r.map((t) => t.id === id ? { ...t, ...patch } : t));
  const removeRow  = (id)        => setRows((r) => r.filter((t) => t.id !== id));

  const handleSubmit = async () => {
    if (!selectedAccount)      { toast.error("Please choose a target account."); return; }
    const selected = rows.filter((t) => t.selected);
    if (selected.length === 0) { toast.error("Select at least one transaction."); return; }

    setSubmitting(true);
    try {
      const payload = selected.map((t) => {
        const catObj = categories.find((c) => c.id === t.category || c.name === t.category);
        return {
          type: t.type, amount: t.amount, date: t.date,
          description: t.description, receiptNo: t.receiptNo,
          accountId: selectedAccount, categoryId: catObj?.id || null,
        };
      });
      const res = await bulkCreateTransactions(payload);
      setResult(res);
      setStep(2);
      if (res.count  > 0) toast.success(`${res.count} transactions saved!`);
      if (res.skipped > 0) toast.info(`${res.skipped} skipped (already imported).`);
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(0); setRows([]); setFileName(""); setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const selectedCount = rows.filter((t) => t.selected).length;
  const incomeTotal   = rows.filter((t) => t.selected && t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenseTotal  = rows.filter((t) => t.selected && t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <StepBar step={step} />

      {/* ── STEP 0: Upload ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">How to get your M-Pesa statement</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-blue-600 dark:text-blue-400">
                <li>Open <strong>MySafaricom app</strong> → M-Pesa → Statement</li>
                <li>Select date range → Request statement</li>
                <li>Download the <strong>CSV</strong> from your email</li>
                <li>Upload it here — or paste the text below</li>
              </ol>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-4 py-14 px-6",
              "rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
              dragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden"
              onChange={(e) => processFile(e.target.files[0])} />
            {parsing ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Parsing statement…</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Drop your M-Pesa statement here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CSV or TXT export · or click to browse</p>
                </div>
                <div className="flex gap-2 text-xs">
                  {[".csv", ".txt"].map((ext) => (
                    <span key={ext} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">{ext}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <PasteTextFallback
            onParsed={(txns) => { setRows(txns); setStep(1); setFileName("pasted text"); }}
            categories={categories}
          />
        </div>
      )}

      {/* ── STEP 1: Review ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">Review Transactions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                From: <span className="font-medium">{fileName}</span> · {rows.length} found · {selectedCount} selected
              </p>
            </div>
            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <RefreshCcw className="w-3.5 h-3.5" /> Upload another file
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300 shrink-0">
              <AlertCircle className="w-4 h-4" /> Target Account:
            </div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex-1 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Select account --</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryChip label="Selected" value={selectedCount} unit="transactions" color="blue" />
            <SummaryChip label="Income"   value={fmt(incomeTotal)}  color="emerald" />
            <SummaryChip label="Expenses" value={fmt(expenseTotal)} color="rose" />
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <button onClick={toggleAll} className="flex items-center">
                {rows.every((t) => t.selected) ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
              </button>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span>Type</span>
              <span>Date</span>
              <span>Category</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[420px] overflow-y-auto">
              {rows.map((t) => (
                <TransactionRow
                  key={t.id} transaction={t} categories={categories}
                  onToggle={() => toggleRow(t.id)}
                  onUpdate={(patch) => updateRow(t.id, patch)}
                  onRemove={() => removeRow(t.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedCount === 0 || !selectedAccount}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                submitting || selectedCount === 0 || !selectedAccount
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/40"
              )}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><CheckCircle2 className="w-4 h-4" />Import {selectedCount} Transaction{selectedCount !== 1 ? "s" : ""}</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Done ── */}
      {step === 2 && result && (
        <div className="flex flex-col items-center py-12 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Import Complete!</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {result.count} transaction{result.count !== 1 ? "s" : ""} saved
              {result.skipped > 0 ? `, ${result.skipped} skipped` : ""}
            </p>
          </div>
          {result.errors?.length > 0 && (
            <div className="w-full max-w-sm text-left p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2">Warnings</p>
              <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1 list-disc ml-4">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <div className="flex gap-3">
            <a href="/dashboard" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">
              Go to Dashboard
            </a>
            <button onClick={reset} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm transition-colors">
              Import Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}