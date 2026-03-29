"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function getDBUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get or create the user's profile with webhook token
// ─────────────────────────────────────────────────────────────────────────────
export async function getMpesaSettings() {
  const user = await getDBUser();

  let profile = await db.userProfile.findUnique({
    where: { userId: user.id },
  });

  // Create profile if it doesn't exist yet
  if (!profile) {
    profile = await db.userProfile.create({
      data: {
        userId:       user.id,
        webhookToken: crypto.randomBytes(32).toString("hex"),
      },
    });
  }

  // Generate token if missing
  if (!profile.webhookToken) {
    profile = await db.userProfile.update({
      where: { userId: user.id },
      data:  { webhookToken: crypto.randomBytes(32).toString("hex") },
    });
  }

  return {
    mpesaNumber:  profile.mpesaNumber  || "",
    webhookToken: profile.webhookToken || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Save M-Pesa number
// ─────────────────────────────────────────────────────────────────────────────
export async function saveMpesaNumber(mpesaNumber) {
  const user = await getDBUser();

  // Validate Kenyan phone number format
  const cleaned = mpesaNumber.replace(/\s/g, "");
  const isValid =
    /^07\d{8}$/.test(cleaned) ||
    /^01\d{8}$/.test(cleaned) ||
    /^\+2547\d{8}$/.test(cleaned) ||
    /^2547\d{8}$/.test(cleaned);

  if (!isValid) {
    return { success: false, error: "Invalid phone number. Use format: 0712345678" };
  }

  await db.userProfile.upsert({
    where:  { userId: user.id },
    update: { mpesaNumber: cleaned },
    create: {
      userId:       user.id,
      mpesaNumber:  cleaned,
      webhookToken: crypto.randomBytes(32).toString("hex"),
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Regenerate webhook token (in case it gets leaked)
// ─────────────────────────────────────────────────────────────────────────────
export async function regenerateWebhookToken() {
  const user  = await getDBUser();
  const token = crypto.randomBytes(32).toString("hex");

  await db.userProfile.upsert({
    where:  { userId: user.id },
    update: { webhookToken: token },
    create: { userId: user.id, webhookToken: token },
  });

  revalidatePath("/settings");
  return { success: true, token };
}