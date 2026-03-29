"use client";

import { useState } from "react";
import { toast } from "sonner";
import { importMpesaSms } from "@/actions/import-transactions";

export default function MpesaImport({ accounts, categories }) {
  const [smsText, setSmsText]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [accountId, setAccountId] = useState(accounts?.[0]?.id || "");

  const handleImport = async () => {
    if (!smsText.trim()) {
      toast.error("Please paste an M-Pesa SMS message");
      return;
    }
    if (!accountId) {
      toast.error("Please select an account");
      return;
    }

    setLoading(true);
    try {
      const result = await importMpesaSms(smsText, accountId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Transaction imported: Ksh ${result.amount} (${result.type})`);
        setSmsText("");
      }
    } catch (err) {
      toast.error("Failed to import: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        fontSize: "0.83rem",
        color: "rgba(200,200,240,0.7)",
        lineHeight: 1.6,
      }}>
        <strong style={{ color: "#c4b5fd" }}>How it works:</strong> Copy an M-Pesa confirmation SMS from your messages app and paste it below. SmartFinance will automatically extract the amount, recipient, and transaction type.
        <br /><br />
        <strong style={{ color: "#c4b5fd" }}>Example SMS:</strong><br />
        <code style={{ fontSize: "0.78rem", color: "#a5b4fc" }}>
          QHJ4K2L3M5 Confirmed. Ksh1,500 sent to JANE MWANGI 0712345678 on 23/3/26 at 10:30 AM. New M-PESA balance is Ksh8,500.
        </code>
      </div>

      {/* Account selector */}
      <div>
        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "rgba(200,200,240,0.8)" }}>
          Import to Account
        </label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          style={{
            width: "100%", padding: "0.6rem 0.9rem",
            borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)",
            background: "rgba(6,6,20,0.6)", color: "#e8e8ff",
            fontSize: "0.88rem",
          }}
        >
          {accounts?.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} — Ksh {Number(acc.balance).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* SMS textarea */}
      <div>
        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "rgba(200,200,240,0.8)" }}>
          Paste M-Pesa SMS
        </label>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="Paste your M-Pesa confirmation SMS here..."
          rows={5}
          style={{
            width: "100%", padding: "0.75rem 1rem",
            borderRadius: "10px", border: "1px solid rgba(139,92,246,0.3)",
            background: "rgba(6,6,20,0.6)", color: "#e8e8ff",
            fontSize: "0.88rem", resize: "vertical", lineHeight: 1.6,
          }}
        />
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !smsText.trim()}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "10px",
          border: "none",
          cursor: loading || !smsText.trim() ? "not-allowed" : "pointer",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "white",
          fontWeight: 700,
          fontSize: "0.9rem",
          opacity: loading || !smsText.trim() ? 0.6 : 1,
          transition: "all 0.2s",
        }}
      >
        {loading ? "Importing..." : "📱 Import Transaction"}
      </button>
    </div>
  );
}