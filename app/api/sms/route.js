// This endpoint receives M-Pesa SMS messages forwarded from the user's phone
// via SMS Forwarder app (Android) and saves them as transactions automatically.
//
// SMS Forwarder setup:
//   URL:    https://yoursite.com/api/mpesa/sms
//   Method: POST
//   Body:   JSON
//   Fields: { "from": "MPESA", "message": "<full sms text>", "token": "<user token>" }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { parseMpesaSms } from "@/actions/import-transactions";

export async function POST(request) {
  try {
    const body = await request.json();

    // ── Step 1: Extract SMS fields ──────────────────────────────────────────
    // SMS Forwarder sends different field names depending on the app version
    const smsText = body.message || body.sms || body.text || body.body || "";
    const token   = body.token   || body.secret || body.key || "";
    const sender  = (body.from   || body.sender || "").toUpperCase();

    if (!smsText) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // ── Step 2: Only process M-Pesa messages ────────────────────────────────
    const isMpesa =
      sender.includes("MPESA") ||
      sender.includes("M-PESA") ||
      smsText.toUpperCase().includes("M-PESA") ||
      smsText.includes("Confirmed.") && smsText.includes("Ksh");

    if (!isMpesa) {
      // Not an M-Pesa SMS — silently ignore, return 200 so the app doesn't retry
      return NextResponse.json({ status: "ignored", reason: "not_mpesa" });
    }

    // ── Step 3: Validate user token ─────────────────────────────────────────
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Find user by their webhook token
    const profile = await db.userProfile.findFirst({
      where: { webhookToken: token },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = profile.user.id;

    // ── Step 4: Parse the SMS ────────────────────────────────────────────────
    const parsed = parseMpesaSms(smsText);

    if (!parsed) {
      // Could not parse — log it and return OK so the app doesn't retry
      console.log(`[M-Pesa SMS] Could not parse message for user ${userId}:`, smsText);
      return NextResponse.json({ status: "ignored", reason: "unparseable" });
    }

    // ── Step 5: Get default account ─────────────────────────────────────────
    let account = await db.account.findFirst({
      where: { userId, isDefault: true },
    });
    if (!account) {
      account = await db.account.findFirst({ where: { userId } });
    }
    if (!account) {
      return NextResponse.json({ error: "No account found for user" }, { status: 422 });
    }

    // ── Step 6: Avoid duplicate transactions ────────────────────────────────
    // Check if we already have a transaction with the same M-Pesa reference
    // (in case the phone sends the SMS twice)
    if (parsed.mpesaRef) {
      const exists = await db.transaction.findFirst({
        where: {
          userId,
          description: { contains: parsed.mpesaRef },
        },
      });
      if (exists) {
        return NextResponse.json({ status: "duplicate", message: "Already imported" });
      }
    }

    // ── Step 7: Save transaction + update balance ────────────────────────────
    const balanceDelta = parsed.type === "INCOME" ? parsed.amount : -parsed.amount;

    await db.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          type:        parsed.type,
          amount:      parsed.amount,
          description: `${parsed.description} [Ref: ${parsed.mpesaRef || "N/A"}]`,
          category:    parsed.category,
          date:        parsed.date,
          isRecurring: false,
          status:      "COMPLETED",
          userId,
          accountId:   account.id,
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data:  { balance: { increment: balanceDelta } },
      });

      // Update last active timestamp on profile
      await tx.userProfile.update({
        where: { id: profile.id },
        data:  { lastActiveAt: new Date() },
      });
    });

    console.log(`[M-Pesa SMS] ✅ Saved ${parsed.type} of KES ${parsed.amount} for user ${userId}`);

    return NextResponse.json({
      status:      "saved",
      type:        parsed.type,
      amount:      parsed.amount,
      description: parsed.description,
      account:     account.name,
    });

  } catch (err) {
    console.error("[M-Pesa SMS Webhook Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — health check so the user can verify the endpoint is live
export async function GET() {
  return NextResponse.json({
    status:  "ok",
    message: "SmartFinance M-Pesa SMS webhook is running",
    time:    new Date().toISOString(),
  });
}