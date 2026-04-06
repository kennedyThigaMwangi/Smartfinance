"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


async function getDBUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  return user;
}

async function getDefaultAccount(userId) {
  let account = await db.account.findFirst({ where: { userId, isDefault: true } });
  if (!account) account = await db.account.findFirst({ where: { userId } });
  if (!account) throw new Error("No account found. Please create an account first.");
  return account;
}

// ─────────────────────────────────────────────────────────────────────────────
// M-Pesa SMS patterns
// Each pattern captures: amount, type, description, date
// ─────────────────────────────────────────────────────────────────────────────
const MPESA_PATTERNS = [
  // Send money: "ABC123 Confirmed. Ksh1,000 sent to JOHN DOE 0712345678 on 23/3/26..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+sent to\s+(.+?)\s+(?:0\d{9}|2547\d{8}|07\d{8})\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "transfers",
    descFn: (m) => `M-Pesa sent to ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Receive money: "ABC123 Confirmed. You have received Ksh1,000 from JOHN DOE..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+You have received\s+Ksh([\d,]+(?:\.\d{2})?)\s+from\s+(.+?)\s+(?:0\d{9}|2547\d{8}|07\d{8})?\s*on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "INCOME",
    category: "mpesa",
    descFn: (m) => `M-Pesa received from ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Pay bill: "ABC123 Confirmed. Ksh500 paid to KPLC PREPAID Account 12345678..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+paid to\s+(.+?)\s+(?:Account|account)\s+[\w\d]+\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "bills",
    descFn: (m) => `Pay Bill: ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Buy goods: "ABC123 Confirmed. Ksh200 paid to NAIVAS on 23/3/26..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+paid to\s+(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "shopping",
    descFn: (m) => `Buy Goods: ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Withdraw: "ABC123 Confirmed. Ksh2,000 withdrawn from agent..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+withdrawn from\s+(?:agent\s+)?(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "mpesa",
    descFn: (m) => `M-Pesa Withdrawal - ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Airtime: "ABC123 Confirmed. Ksh100 sent to 0712345678 for airtime..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+sent to\s+(0\d{9}|07\d{8}|2547\d{8})\s+for airtime\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "utilities",
    descFn: (m) => `Airtime - ${m[3].trim()}`,
    dateFn: (m) => parseKenyanDate(m[4]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Deposit/top-up: "ABC123 Confirmed. Ksh5,000 deposited to your M-PESA..."
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Ksh([\d,]+(?:\.\d{2})?)\s+deposited to your M-PESA.*on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "INCOME",
    category: "mpesa",
    descFn: () => "M-Pesa Deposit",
    dateFn: (m) => parseKenyanDate(m[3]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
  // Fuliza/overdraft repayment
  {
    regex: /([A-Z0-9]+)\s+Confirmed\.\s+Your Fuliza M-PESA loan of\s+Ksh([\d,]+(?:\.\d{2})?)\s+.*on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    type: "EXPENSE",
    category: "loans",
    descFn: () => "Fuliza M-Pesa Repayment",
    dateFn: (m) => parseKenyanDate(m[3]),
    amountFn: (m) => parseFloat(m[2].replace(/,/g, "")),
  },
];

// Parse Kenyan date format "23/3/26" or "23/03/2026"
function parseKenyanDate(str) {
  if (!str) return new Date();
  const parts = str.split("/");
  if (parts.length !== 3) return new Date();
  const day   = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year    = parseInt(parts[2], 10);
  if (year < 100) year += 2000;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Parse a single M-Pesa SMS string → transaction object or null
export function parseMpesaSms(smsText) {
  if (!smsText?.trim()) return null;

  for (const pattern of MPESA_PATTERNS) {
    const match = smsText.match(pattern.regex);
    if (match) {
      return {
        type:        pattern.type,
        amount:      pattern.amountFn(match),
        description: pattern.descFn(match),
        category:    pattern.category,
        date:        pattern.dateFn(match),
        isRecurring: false,
        status:      "COMPLETED",
        mpesaRef:    match[1],  // transaction reference code
      };
    }
  }
  return null;
}

//
// ACTION: Import M-Pesa SMS messages
// Accepts an array of SMS strings, parses each and bulk-inserts to DB
export async function importMpesaSms(smsMessages) {
  try {
    const user    = await getDBUser();
    const account = await getDefaultAccount(user.id);

    const parsed = smsMessages
      .map((sms) => parseMpesaSms(sms))
      .filter(Boolean); // drop unparseable messages

    if (parsed.length === 0) {
      return { success: false, error: "No valid M-Pesa messages found. Make sure you paste the full SMS text." };
    }

    // Bulk create transactions + update account balance
    let balanceDelta = 0;

    await db.$transaction(async (tx) => {
      for (const t of parsed) {
        await tx.transaction.create({
          data: {
            type:        t.type,
            amount:      t.amount,
            description: t.description,
            category:    t.category,
            date:        t.date,
            isRecurring: false,
            status:      "COMPLETED",
            userId:      user.id,
            accountId:   account.id,
          },
        });

        balanceDelta += t.type === "INCOME" ? t.amount : -t.amount;
      }

      // Update account balance
      await tx.account.update({
        where: { id: account.id },
        data:  { balance: { increment: balanceDelta } },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${account.id}`);
    revalidatePath("/transactions");

    return {
      success:  true,
      imported: parsed.length,
      skipped:  smsMessages.length - parsed.length,
      account:  account.name,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV bank parsers — each bank exports a different format
// ─────────────────────────────────────────────────────────────────────────────

// Parse a CSV string into rows (handles quoted fields)
function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line) => {
    const cols = [];
    let cur = "", inQuote = false;
    for (const ch of line) {
      if (ch === '"')       { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; }
      else                  { cur += ch; }
    }
    cols.push(cur.trim());
    return cols;
  });
}

function cleanAmount(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[,\s]/g, "")) || 0;
}

function parseDate(str) {
  if (!str) return new Date();
  // Try DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const cleaned = str.trim();
  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,  // DD/MM/YYYY
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,  // YYYY/MM/DD
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,  // DD/MM/YY
  ];

  for (const fmt of formats) {
    const m = cleaned.match(fmt);
    if (m) {
      if (fmt === formats[1]) {
        return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
      }
      let year = parseInt(m[3]);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(m[2]) - 1, parseInt(m[1]));
    }
  }

  // Fallback to native Date parsing
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? new Date() : d;
}

function guessCategory(description) {
  const d = (description || "").toLowerCase();
  if (d.includes("mpesa") || d.includes("m-pesa"))              return "mpesa";
  if (d.includes("salary") || d.includes("payroll"))            return "salary";
  if (d.includes("kplc") || d.includes("electricity"))         return "utilities";
  if (d.includes("nairobi water") || d.includes("water"))       return "utilities";
  if (d.includes("safaricom") || d.includes("airtime"))         return "utilities";
  if (d.includes("supermarket") || d.includes("naivas") ||
      d.includes("carrefour") || d.includes("quickmart"))       return "groceries";
  if (d.includes("uber") || d.includes("bolt") ||
      d.includes("fuel") || d.includes("petrol"))               return "transportation";
  if (d.includes("rent") || d.includes("landlord"))             return "housing";
  if (d.includes("hospital") || d.includes("pharmacy") ||
      d.includes("clinic") || d.includes("nhif"))               return "healthcare";
  if (d.includes("school") || d.includes("university") ||
      d.includes("college") || d.includes("fees"))              return "education";
  if (d.includes("restaurant") || d.includes("cafe") ||
      d.includes("hotel") || d.includes("food"))                return "dining";
  if (d.includes("insurance") || d.includes("jubilee") ||
      d.includes("britam") || d.includes("aar"))                return "insurance";
  if (d.includes("loan") || d.includes("credit") ||
      d.includes("fuliza"))                                      return "loans";
  if (d.includes("atm") || d.includes("withdrawal"))            return "mpesa";
  if (d.includes("transfer") || d.includes("rtgs") ||
      d.includes("eft"))                                        return "transfers";
  return "other-expense";
}

// ── KCB ─────────────────────────────────────────────────────────
// Format: Date, Description, Debit, Credit, Balance
function parseKCB(rows) {
  const results = [];
  // skip header row
  for (let i = 1; i < rows.length; i++) {
    const [date, description, debit, credit] = rows[i];
    if (!date || !description) continue;

    const debitAmt  = cleanAmount(debit);
    const creditAmt = cleanAmount(credit);

    if (debitAmt > 0) {
      results.push({ date: parseDate(date), description, amount: debitAmt, type: "EXPENSE", category: guessCategory(description) });
    }
    if (creditAmt > 0) {
      results.push({ date: parseDate(date), description, amount: creditAmt, type: "INCOME", category: guessCategory(description) });
    }
  }
  return results;
}

// ── Equity ───────────────────────────────────────────────────────
// Format: Date, Description, Amount, Dr/Cr, Balance
function parseEquity(rows) {
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const [date, description, amount, drCr] = rows[i];
    if (!date || !description) continue;

    const amt    = cleanAmount(amount);
    const isDebt = (drCr || "").trim().toUpperCase() === "DR" || (drCr || "").trim().toUpperCase() === "D";
    if (amt > 0) {
      results.push({
        date:        parseDate(date),
        description,
        amount:      amt,
        type:        isDebt ? "EXPENSE" : "INCOME",
        category:    guessCategory(description),
      });
    }
  }
  return results;
}

// ── NCBA ─────────────────────────────────────────────────────────
// Format: Transaction Date, Description, Debit Amount, Credit Amount, Running Balance
function parseNCBA(rows) {
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const [date, description, debit, credit] = rows[i];
    if (!date || !description) continue;

    const debitAmt  = cleanAmount(debit);
    const creditAmt = cleanAmount(credit);

    if (debitAmt > 0) {
      results.push({ date: parseDate(date), description, amount: debitAmt, type: "EXPENSE", category: guessCategory(description) });
    }
    if (creditAmt > 0) {
      results.push({ date: parseDate(date), description, amount: creditAmt, type: "INCOME", category: guessCategory(description) });
    }
  }
  return results;
}

// ── Co-op Bank ───────────────────────────────────────────────────
// Format: Date, Narration, Debit, Credit, Balance
function parseCoop(rows) {
  return parseKCB(rows); // same format as KCB
}

// ── Absa ─────────────────────────────────────────────────────────
// Format: Date, Details, Debit, Credit, Balance
function parseAbsa(rows) {
  return parseKCB(rows); // same format
}

// ── Standard Chartered ───────────────────────────────────────────
// Format: Date, Description, Withdrawals, Deposits, Balance
function parseStanChart(rows) {
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const [date, description, withdrawal, deposit] = rows[i];
    if (!date || !description) continue;

    const withdrawAmt = cleanAmount(withdrawal);
    const depositAmt  = cleanAmount(deposit);

    if (withdrawAmt > 0) {
      results.push({ date: parseDate(date), description, amount: withdrawAmt, type: "EXPENSE", category: guessCategory(description) });
    }
    if (depositAmt > 0) {
      results.push({ date: parseDate(date), description, amount: depositAmt, type: "INCOME", category: guessCategory(description) });
    }
  }
  return results;
}

// Detect bank from CSV header row
function detectBank(headerRow) {
  const h = (headerRow || []).join(" ").toLowerCase();
  if (h.includes("narration"))          return "coop";
  if (h.includes("withdrawal"))         return "stanchart";
  if (h.includes("dr/cr") || h.includes("dr cr")) return "equity";
  if (h.includes("debit amount") || h.includes("credit amount")) return "ncba";
  if (h.includes("details"))            return "absa";
  return "kcb"; // default
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION: Import CSV bank statement
// ─────────────────────────────────────────────────────────────────────────────
export async function importBankCSV(csvText, bankHint = "auto") {
  try {
    const user    = await getDBUser();
    const account = await getDefaultAccount(user.id);

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return { success: false, error: "CSV file is empty or has only a header row." };
    }

    // Auto-detect bank if not specified
    const bank = bankHint === "auto" ? detectBank(rows[0]) : bankHint;

    let parsed = [];
    switch (bank) {
      case "equity":   parsed = parseEquity(rows);   break;
      case "ncba":     parsed = parseNCBA(rows);     break;
      case "coop":     parsed = parseCoop(rows);     break;
      case "absa":     parsed = parseAbsa(rows);     break;
      case "stanchart": parsed = parseStanChart(rows); break;
      default:         parsed = parseKCB(rows);      break; // KCB + fallback
    }

    if (parsed.length === 0) {
      return { success: false, error: "No transactions could be read from this CSV. Check the format matches your bank." };
    }

    // Bulk insert
    let balanceDelta = 0;

    await db.$transaction(async (tx) => {
      for (const t of parsed) {
        await tx.transaction.create({
          data: {
            type:        t.type,
            amount:      t.amount,
            description: t.description || "Bank transaction",
            category:    t.category,
            date:        t.date,
            isRecurring: false,
            status:      "COMPLETED",
            userId:      user.id,
            accountId:   account.id,
          },
        });
        balanceDelta += t.type === "INCOME" ? t.amount : -t.amount;
      }

      await tx.account.update({
        where: { id: account.id },
        data:  { balance: { increment: balanceDelta } },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${account.id}`);
    revalidatePath("/transactions");

    return {
      success:  true,
      imported: parsed.length,
      bank,
      account:  account.name,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}