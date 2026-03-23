// Force Node.js runtime — @react-pdf/renderer does NOT work in Edge runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/prisma";
import { getFinancialReport } from "@/lib/reports";
import { generateInsights } from "@/actions/generate-report";
import { ReportPDF } from "@/components/reports/ReportPDF";
import React from "react";

export async function GET(request) {
  try {
    // ── Authenticate ─────────────────────────────────────────────────────────
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ── Resolve DB user ───────────────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // ── Parse period ──────────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";

    if (!["weekly", "monthly", "yearly"].includes(period)) {
      return new NextResponse("Invalid period", { status: 400 });
    }

    // ── Build report data ─────────────────────────────────────────────────────
    const report   = await getFinancialReport(user.id, period);
    const insights = await generateInsights(report);
    const userName = user.name || user.email.split("@")[0];

    // ── Render PDF ────────────────────────────────────────────────────────────
    // Use JSX directly — React.createElement causes null props error in some
    // versions of @react-pdf/renderer inside Next.js API routes
    const element = (
      <ReportPDF
        report={report}
        insights={insights}
        userName={userName}
      />
    );

    const pdfBuffer = await renderToBuffer(element);

    // ── Return as download ────────────────────────────────────────────────────
    const periodLabel = { weekly: "Weekly", monthly: "Monthly", yearly: "Annual" }[period];
    const safeName    = (report.label || periodLabel).replace(/[^a-zA-Z0-9]/g, "-");
    const filename    = `SmartFinance-${periodLabel}-Report-${safeName}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      pdfBuffer.length.toString(),
      },
    });

  } catch (err) {
    console.error("[PDF Report Error]", err);
    return new NextResponse(
      "Failed to generate PDF report: " + err.message,
      { status: 500 }
    );
  }
}