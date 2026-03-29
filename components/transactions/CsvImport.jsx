"use client";

import { useState, useRef } from "react";
import { importBankCSV } from "@/actions/import-transactions";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANKS = [
  { value: "auto",      label: "Auto-detect",          flag: "🔍" },
  { value: "kcb",       label: "KCB",                  flag: "🏦" },
  { value: "equity",    label: "Equity Bank",          flag: "🏦" },
  { value: "ncba",      label: "NCBA",                 flag: "🏦" },
  { value: "coop",      label: "Co-op Bank",           flag: "🏦" },
  { value: "absa",      label: "Absa Kenya",           flag: "🏦" },
  { value: "stanchart", label: "Standard Chartered",   flag: "🏦" },
];

const INSTRUCTIONS = {
  kcb:       "Log in → Accounts → Statement → Export as CSV. Columns: Date, Description, Debit, Credit, Balance",
  equity:    "Log in → Account Statement → Download CSV. Columns: Date, Description, Amount, Dr/Cr, Balance",
  ncba:      "Log in → Statements → Download → CSV. Columns: Transaction Date, Description, Debit Amount, Credit Amount, Running Balance",
  coop:      "Log in → My Accounts → Statement → Export CSV. Columns: Date, Narration, Debit, Credit, Balance",
  absa:      "Log in → Accounts → Statements → Export CSV. Columns: Date, Details, Debit, Credit, Balance",
  stanchart: "Log in → Accounts → Download Statement → CSV. Columns: Date, Description, Withdrawals, Deposits, Balance",
  auto:      "Select your bank above for specific instructions, or just upload and we'll try to detect the format automatically.",
};

export function CsvImport({ onSuccess }) {
  const [bank,     setBank]     = useState("auto");
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  // ── File selection ────────────────────────────────────────────────────────
  function handleFile(f) {
    if (!f) return;
    if (!f.name.endsWith(".csv") && f.type !== "text/csv") {
      toast.error("Please upload a CSV file (.csv)");
      return;
    }
    setFile(f);
    setResult(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleImport() {
    if (!file) { toast.error("Please select a CSV file first."); return; }

    setLoading(true);
    try {
      const text = await file.text();
      const res  = await importBankCSV(text, bank);

      if (res.success) {
        setResult(res);
        toast.success(`✅ Imported ${res.imported} transactions from ${res.bank.toUpperCase()} to ${res.account}`);
        setFile(null);
        onSuccess?.();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Import Bank Statement CSV
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Download your statement from your bank&apos;s app or website, then upload the CSV here.
        </p>
      </div>

      {/* Bank selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select your bank</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BANKS.map((b) => (
            <button
              key={b.value}
              onClick={() => setBank(b.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                bank === b.value
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <span>{b.flag}</span>
              <span className="truncate">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
        <strong>How to export:</strong> {INSTRUCTIONS[bank]}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? "border-indigo-400 bg-indigo-50"
            : file
            ? "border-green-400 bg-green-50"
            : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-bold text-green-700">{file.name}</p>
              <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="ml-2 p-1 rounded-full hover:bg-green-100 text-green-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-500">
              Drop your CSV file here or <span className="text-indigo-500 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400">Only .csv files are supported</p>
          </div>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <span className="font-bold text-green-700">{result.imported} transactions imported</span>
            <span className="text-green-600"> from {result.bank.toUpperCase()} → {result.account}</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleImport}
        disabled={loading || !file}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import Bank Statement
          </>
        )}
      </Button>
    </div>
  );
}