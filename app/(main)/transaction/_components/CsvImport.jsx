"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { importBankCSV } from "@/actions/import-transactions";

const SUPPORTED_BANKS = ["KCB", "Equity", "NCBA", "Co-op", "Absa", "Standard Chartered"];

export default function CsvImport({ accounts }) {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [accountId, setAccountId] = useState(accounts?.[0]?.id || "");
  const [bank, setBank]         = useState("KCB");
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
    else toast.error("Please drop a .csv file");
  };

  const handleImport = async () => {
    if (!file) { toast.error("Please select a CSV file"); return; }
    if (!accountId) { toast.error("Please select an account"); return; }

    setLoading(true);
    try {
      const text = await file.text();
      const result = await importBankCSV(text, accountId, bank);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Imported ${result.count} transactions successfully!`);
        setFile(null);
      }
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <div style={{
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "12px", padding: "1rem 1.25rem",
        fontSize: "0.83rem", color: "rgba(200,200,240,0.7)", lineHeight: 1.6,
      }}>
        <strong style={{ color: "#c4b5fd" }}>Supported banks:</strong>{" "}
        {SUPPORTED_BANKS.join(", ")}
        <br />Download your statement as CSV from your bank's internet banking portal, then upload it here.
      </div>

      {/* Account + Bank selectors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              background: "rgba(6,6,20,0.6)", color: "#e8e8ff", fontSize: "0.88rem",
            }}
          >
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — Ksh {Number(acc.balance).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "rgba(200,200,240,0.8)" }}>
            Bank / Format
          </label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            style={{
              width: "100%", padding: "0.6rem 0.9rem",
              borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)",
              background: "rgba(6,6,20,0.6)", color: "#e8e8ff", fontSize: "0.88rem",
            }}
          >
            {SUPPORTED_BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#8b5cf6" : "rgba(139,92,246,0.3)"}`,
          borderRadius: "12px",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(139,92,246,0.08)" : "transparent",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📄</div>
        {file ? (
          <p style={{ color: "#a5b4fc", fontWeight: 600 }}>{file.name}</p>
        ) : (
          <>
            <p style={{ color: "rgba(200,200,240,0.7)", fontWeight: 600 }}>
              Drop your CSV file here
            </p>
            <p style={{ color: "rgba(200,200,240,0.4)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              or click to browse
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !file}
        style={{
          padding: "0.75rem 1.5rem", borderRadius: "10px", border: "none",
          cursor: loading || !file ? "not-allowed" : "pointer",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "white", fontWeight: 700, fontSize: "0.9rem",
          opacity: loading || !file ? 0.6 : 1, transition: "all 0.2s",
        }}
      >
        {loading ? "Importing..." : "📄 Import CSV"}
      </button>
    </div>
  );
}