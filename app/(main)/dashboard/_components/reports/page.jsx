"use client";

import { useState } from "react";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const userId = "874f87a6-0dd5-4ef8-8ff2-02ac9a4a3aa6"; // Replace with real logged-in user ID
      const year = 2026;
      const month = 3;

      const response = await fetch(
        `/api/report/pdf?userId=${userId}&year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "monthly-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>
    </div>
  );
}