"use client";

import { useState } from "react";
import { importMpesaSms, parseMpesaSms } from "@/actions/import-transactions";
import { toast } from "sonner";
import { Loader2, Smartphone, CheckCircle2, XCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Sample M-Pesa SMS messages to help users know what to paste
// ─────────────────────────────────────────────────────────────────────────────
const EXAMPLES = [
  "QHJ4K2L3M5 Confirmed. Ksh1,500 sent to JANE MWANGI 0712345678 on 23/3/26 at 10:30 AM. New M-PESA balance is Ksh8,500. Transaction cost, Ksh0.",
  "PLM9K2J3H1 Confirmed. You have received Ksh5,000 from JOHN KAMAU 0723456789 on 23/3/26 at 2:15 PM. New M-PESA balance is Ksh13,500.",
  "ABC1D2E3F4 Confirmed. Ksh2,500 paid to KPLC PREPAID Account 12345678901 on 22/3/26 at 8:00 AM. New M-PESA balance is Ksh6,000.",
];

const fmt = (n) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(n);

export function MpesaImport({ onSuccess }) {
  const [messages,    setMessages]    = useState([""]);
  const [previews,    setPreviews]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [result,      setResult]      = useState(null);

  // ── Add / remove message fields ──────────────────────────────────────────
  function addMessage()       { setMessages((m) => [...m, ""]); }
  function removeMessage(i)   { setMessages((m) => m.filter((_, idx) => idx !== i)); }
  function updateMessage(i, v) {
    setMessages((m) => { const n = [...m]; n[i] = v; return n; });
  }

  // ── Live preview as user types ────────────────────────────────────────────
  function handleChange(i, v) {
    updateMessage(i, v);
    const parsed = parseMpesaSms(v);
    setPreviews((p) => { const n = [...p]; n[i] = parsed; return n; });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleImport() {
    const filled = messages.filter((m) => m.trim());
    if (filled.length === 0) {
      toast.error("Please paste at least one M-Pesa SMS message.");
      return;
    }

    setLoading(true);
    try {
      const res = await importMpesaSms(filled);
      if (res.success) {
        setResult(res);
        toast.success(`✅ Imported ${res.imported} transactions to ${res.account}`);
        setMessages([""]);
        setPreviews([]);
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-green-600" />
            Import M-Pesa SMS
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Paste M-Pesa confirmation SMS messages — one per box.
            Transactions go to your default account automatically.
          </p>
        </div>
        <button
          onClick={() => setShowExample((s) => !s)}
          className="text-xs text-indigo-500 underline shrink-0"
        >
          {showExample ? "Hide" : "See"} examples
        </button>
      </div>

      {/* Examples */}
      {showExample && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Example SMS messages</p>
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-3 text-xs text-gray-600 leading-relaxed">
              {ex}
            </div>
          ))}
        </div>
      )}

      {/* Message fields */}
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-start gap-2">
              <textarea
                value={msg}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={`Paste M-Pesa SMS #${i + 1} here…\ne.g. "QHJ4K2L3 Confirmed. Ksh1,500 sent to JANE MWANGI..."`}
                rows={3}
                className="flex-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
              {messages.length > 1 && (
                <button
                  onClick={() => removeMessage(i)}
                  className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Live preview */}
            {msg.trim() && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                previews[i]
                  ? "bg-green-50 border border-green-100 text-green-700"
                  : "bg-red-50 border border-red-100 text-red-600"
              }`}>
                {previews[i] ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      <strong>{previews[i].type === "INCOME" ? "+" : "-"}{fmt(previews[i].amount)}</strong>
                      {" · "}{previews[i].description}
                      {" · "}{previews[i].date?.toLocaleDateString("en-KE")}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Could not parse — make sure it&apos;s a full M-Pesa confirmation SMS</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add more */}
      <button
        onClick={addMessage}
        className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add another SMS
      </button>

      {/* Result banner */}
      {result && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <span className="font-bold text-green-700">{result.imported} transactions imported</span>
            {result.skipped > 0 && (
              <span className="text-green-600"> · {result.skipped} messages skipped</span>
            )}
            <span className="text-green-600"> → {result.account}</span>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleImport}
        disabled={loading || messages.every((m) => !m.trim())}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <Smartphone className="mr-2 h-4 w-4" />
            Import M-Pesa Transactions
          </>
        )}
      </Button>
    </div>
  );
}