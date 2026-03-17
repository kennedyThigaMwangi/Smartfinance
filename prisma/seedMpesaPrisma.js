import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

// Users with accounts
const USERS = [
  { userId: "874f87a6-0dd5-4ef8-8ff2-02ac9a4a3aa6", accountId: "74c1ab76-62de-4a5b-bbcc-83a57e373b3b" },
  { userId: "1ba841ab-a7b4-4686-8a90-ec8aa4d14454", accountId: "74c1ab76-62de-4a5b-bbcc-83a57e373b3b" },
  { userId: "3c5d12ab-cbfa-4c8e-b2b8-4a3c7c6a9e12", accountId: "8d2f0b34-ef2a-4d13-9f77-2c1e3d4a5678" },
  { userId: "5f8a2d56-12b4-4f9c-b1a7-9c2e3d7f8910", accountId: "d1c3a5b6-789e-4f12-a1b2-5c7d8e9f0123" },
  { userId: "7b6c9d23-0f2a-4a9b-b3c7-2e1f4d5a6789", accountId: "f2a1b3c4-5d6e-7f8a-9b0c-1d2e3f4a5678" },
];

// Categories same as Supabase version
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
    { name: "mpesa-salary", range: [5000, 20000] },
    { name: "mpesa-transfer-received", range: [500, 10000] },
    { name: "mpesa-business-payment", range: [2000, 15000] },
    { name: "paybill-refund", range: [100, 5000] },
    { name: "mpesa-bank-transfer-in", range: [1000, 8000] },
    { name: "mpesa-shwari-interest", range: [100, 2000] },
    { name: "mpesa-bonus", range: [500, 5000] },
    { name: "mpesa-investments", range: [500, 3000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
    { name: "mpesa-send-money", range: [100, 10000] },
    { name: "airtime-topup", range: [50, 3000] },
    { name: "paybill-bills", range: [500, 15000] },
    { name: "lipa-na-mpesa-purchase", range: [100, 20000] },
    { name: "cash-withdrawal", range: [50, 250000] },
    { name: "buy-goods-store", range: [200, 10000] },
    { name: "bank-transfer-out", range: [1000, 10000] },
    { name: "utilities-payment", range: [200, 10000] },
    { name: "food-and-drinks", range: [100, 5000] },
    { name: "transport-services", range: [50, 5000] },
  ],
};

// Random helpers
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// Seed function
export async function seedMpesaPrisma() {
  const transactions = [];
  const TOTAL_TRANSACTIONS = 1000;
  const DAYS_RANGE = 180;

  for (let i = 0; i < TOTAL_TRANSACTIONS; i++) {
    const randomDaysAgo = Math.floor(Math.random() * DAYS_RANGE);
    const date = subDays(new Date(), randomDaysAgo);

    const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
    const { category, amount } = getRandomCategory(type);
    const user = USERS[Math.floor(Math.random() * USERS.length)];

    transactions.push({
      id: crypto.randomUUID(),
      type,
      amount,
      description: `${type === "INCOME" ? "Received via M-Pesa" : "Paid via M-Pesa"} - ${category} (KES)`,
      date,
      category,
      status: "COMPLETED",
      userId: user.userId,
      accountId: user.accountId,
      createdAt: date,
      updatedAt: date,
    });
  }

  // Insert transactions into Prisma DB and update account balances
  await db.$transaction(async (tx) => {
    for (const user of USERS) {
      const userTransactions = transactions.filter((t) => t.accountId === user.accountId);

      await tx.transaction.createMany({
        data: userTransactions,
      });

      const userBalance = userTransactions.reduce((acc, t) => acc + (t.type === "INCOME" ? t.amount : -t.amount), 0);

      await tx.account.update({
        where: { id: user.accountId },
        data: { balance: userBalance },
      });
    }
  });

  console.log(`✅ Created ${transactions.length} M-Pesa transactions in Prisma DB`);
}

// Run seed directly if needed
seedMpesaPrisma();
