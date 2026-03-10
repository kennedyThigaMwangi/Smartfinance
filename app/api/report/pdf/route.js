export const runtime = "nodejs";

import PDFDocument from "pdfkit";
import { getMonthlyReport } from "@/lib/getMonthlyReport";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    if (!userId || !year || !month) {
      return new Response("Missing parameters", { status: 400 });
    }

    const report = await getMonthlyReport(userId, year, month);

    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Title
    doc.fontSize(20).text("Monthly Financial Report", {
      align: "center",
    });

    doc.moveDown();

    // Summary
    doc.fontSize(14).text(`Income: KES ${report.income}`);
    doc.text(`Expense: KES ${report.expense}`);
    doc.text(`Net Balance: KES ${report.net}`);

    doc.moveDown();
    doc.fontSize(16).text("Transactions:");
    doc.moveDown();

    report.transactions.forEach((t) => {
      doc
        .fontSize(12)
        .text(
          `${new Date(t.date).toDateString()} - ${t.type} - KES ${Number(
            t.amount
          )} - ${t.description || ""}`
        );
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);

        resolve(
          new Response(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition":
                "attachment; filename=monthly-report.pdf",
            },
          })
        );
      });
    });
  } catch (error) {
    console.error(error);
    return new Response("Error generating PDF", { status: 500 });
  }
}