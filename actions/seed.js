"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const USERS = [
  {
    userId: "874f87a6-0dd5-4ef8-8ff2-02ac9a4a3aa6",
    accountId: "74c1ab76-62de-4a5b-bbcc-83a57e373b3b",
  },
  {
    userId: "1ba841ab-a7b4-4686-8a90-ec8aa4d14454",
    accountId: "74c1ab76-62de-4a5b-bbcc-83a57e373b3b",
  },
  {
    userId: "third-user-id",
    accountId: "third-account-id",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §1 · ORIGINAL CATEGORIES (untouched)
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES = {
  INCOME: [
    { name: "salary",                      range: [5000,   8000]  },
    { name: "freelance",                   range: [1000,   3000]  },
    { name: "investments",                 range: [500,    2000]  },
    { name: "other-income",                range: [100,    1000]  },
    { name: "mpesa-salary",                range: [5000,  20000]  },
    { name: "mpesa-transfer-received",     range: [500,   10000]  },
    { name: "mpesa-business-payment",      range: [2000,  15000]  },
    { name: "paybill-refund",              range: [100,    5000]  },
    { name: "mpesa-bank-transfer-in",      range: [1000,   8000]  },
    { name: "mpesa-shwari-interest",       range: [100,    2000]  },
    { name: "mpesa-bonus",                 range: [500,    5000]  },
    { name: "mpesa-investments",           range: [500,    3000]  },
  ],
  EXPENSE: [
    { name: "housing",                     range: [1000,   2000]  },
    { name: "transportation",              range: [100,     500]  },
    { name: "groceries",                   range: [200,     600]  },
    { name: "utilities",                   range: [100,     300]  },
    { name: "entertainment",               range: [50,      200]  },
    { name: "food",                        range: [50,      150]  },
    { name: "shopping",                    range: [100,     500]  },
    { name: "healthcare",                  range: [100,    1000]  },
    { name: "education",                   range: [200,    1000]  },
    { name: "travel",                      range: [500,    2000]  },
    { name: "mpesa-send-money",            range: [100,   10000]  },
    { name: "airtime-topup",               range: [50,     3000]  },
    { name: "paybill-bills",               range: [500,   15000]  },
    { name: "lipa-na-mpesa-purchase",      range: [100,   20000]  },
    { name: "cash-withdrawal",             range: [50,   250000]  },
    { name: "buy-goods-store",             range: [200,   10000]  },
    { name: "bank-transfer-out",           range: [1000,  10000]  },
    { name: "utilities-payment",           range: [200,   10000]  },
    { name: "food-and-drinks",             range: [100,    5000]  },
    { name: "transport-services",          range: [50,     5000]  },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// §2 · ORIGINAL HELPERS (untouched)
// ═══════════════════════════════════════════════════════════════════

function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// ═══════════════════════════════════════════════════════════════════
// §3 · ORIGINAL seedTransactions (untouched)
// ═══════════════════════════════════════════════════════════════════

export async function seedTransactions() {
  try {
    // Generate 90 days of transactions
    const transactions = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${
            type === "INCOME" ? "Received" : "Paid for"
          } ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions in batches and update account balance
    await db.$transaction(async (tx) => {
      // Clear existing transactions
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// §4 · MASSIVE EXTENDED CATEGORY LIBRARY  (300+ entries)
// ═══════════════════════════════════════════════════════════════════

const EXTENDED_CATEGORIES = {
  INCOME: [
    { name: "mpesa-fuliza-repayment-credit",    range: [200,    5000] },
    { name: "mpesa-hustler-fund-disbursement",  range: [1000,  50000] },
    { name: "mpesa-lock-savings-maturity",      range: [1000,  30000] },
    { name: "mpesa-till-collections",           range: [500,   25000] },
    { name: "mpesa-agent-float-received",       range: [1000,  50000] },
    { name: "mpesa-cashback",                   range: [50,     2000] },
    { name: "mpesa-global-receive",             range: [2000, 100000] },
    { name: "mpesa-pochi-la-biashara",          range: [200,   20000] },
    { name: "equity-bank-interest",             range: [50,     5000] },
    { name: "kcb-mpesa-interest",               range: [50,     3000] },
    { name: "cooperative-bank-dividend",        range: [500,   20000] },
    { name: "stanbic-fixed-deposit-interest",   range: [200,   10000] },
    { name: "absa-bank-bonus",                  range: [500,   15000] },
    { name: "ncba-loop-cashback",               range: [100,    5000] },
    { name: "dtb-bank-interest",                range: [100,    8000] },
    { name: "family-bank-interest",             range: [100,    5000] },
    { name: "upwork-payment",                   range: [3000,  80000] },
    { name: "fiverr-payment",                   range: [500,   30000] },
    { name: "toptal-payment",                   range: [10000,200000] },
    { name: "people-per-hour-payment",          range: [1000,  30000] },
    { name: "jumia-seller-payout",              range: [500,   40000] },
    { name: "uber-driver-earnings",             range: [200,    8000] },
    { name: "bolt-driver-earnings",             range: [200,    6000] },
    { name: "little-driver-earnings",           range: [200,    5000] },
    { name: "glovo-courier-earnings",           range: [150,    4000] },
    { name: "sendy-courier-earnings",           range: [200,    5000] },
    { name: "jumia-food-delivery-earnings",     range: [150,    3000] },
    { name: "youtube-adsense-payment",          range: [500,   50000] },
    { name: "tiktok-creator-fund",              range: [100,   10000] },
    { name: "instagram-brand-deal",             range: [2000,  80000] },
    { name: "podcast-sponsorship",              range: [5000, 100000] },
    { name: "substack-subscriptions",           range: [1000,  30000] },
    { name: "online-tutoring-payment",          range: [500,   10000] },
    { name: "business-profit-share",            range: [5000, 200000] },
    { name: "rental-income",                    range: [8000,  80000] },
    { name: "airbnb-payout",                    range: [3000,  50000] },
    { name: "consulting-fee",                   range: [5000,  80000] },
    { name: "contract-payment",                 range: [10000,500000] },
    { name: "government-tender-payment",        range: [50000,2000000]},
    { name: "agency-commission",                range: [1000,  50000] },
    { name: "insurance-claim-payout",           range: [5000, 200000] },
    { name: "nssf-refund",                      range: [500,   30000] },
    { name: "nhif-refund",                      range: [200,   10000] },
    { name: "tax-refund-kra",                   range: [500,   50000] },
    { name: "grant-received",                   range: [10000,500000] },
    { name: "vehicle-sale",                     range: [50000,3000000]},
    { name: "second-hand-goods-sale",           range: [500,   50000] },
    { name: "farm-produce-sale",                range: [500,   50000] },
    { name: "livestock-sale",                   range: [5000, 200000] },
    { name: "nse-dividend-payout",              range: [200,   80000] },
    { name: "unit-trust-withdrawal",            range: [1000, 200000] },
    { name: "sacco-dividend",                   range: [500,   50000] },
    { name: "chama-payout",                     range: [1000, 100000] },
    { name: "treasury-bill-maturity",           range: [50000,1000000]},
    { name: "treasury-bond-coupon",             range: [5000, 100000] },
    { name: "real-estate-sale",                 range: [100000,5000000]},
    { name: "crypto-sale-profit",               range: [500,  200000] },
    { name: "forex-trading-profit",             range: [500,  100000] },
    { name: "mshwari-savings-interest",         range: [50,    5000]  },
    { name: "cic-money-market-interest",        range: [200,   20000] },
    { name: "gift-received",                    range: [500,   50000] },
    { name: "allowance-received",               range: [1000,  20000] },
    { name: "loan-repayment-received",          range: [500,  100000] },
    { name: "harambee-contribution-received",   range: [500,   50000] },
    { name: "diaspora-remittance-received",     range: [5000, 200000] },
    { name: "western-union-received",           range: [2000, 100000] },
  ],
  EXPENSE: [
    { name: "fuliza-loan-repayment",            range: [100,   10000] },
    { name: "mpesa-hustler-fund-repayment",     range: [500,   50000] },
    { name: "mpesa-lock-savings-deposit",       range: [500,   20000] },
    { name: "mpesa-global-send",                range: [1000,  80000] },
    { name: "mpesa-merchant-payment",           range: [50,    15000] },
    { name: "mpesa-service-charge",             range: [10,      500] },
    { name: "equity-bank-loan-repayment",       range: [2000,  30000] },
    { name: "kcb-loan-repayment",               range: [2000,  50000] },
    { name: "cooperative-bank-loan",            range: [1000,  40000] },
    { name: "bank-charges",                     range: [20,      500] },
    { name: "atm-withdrawal-fee",               range: [30,      100] },
    { name: "standing-order-bank",              range: [500,   20000] },
    { name: "rent-payment",                     range: [8000, 150000] },
    { name: "water-bill-nairobi-water",         range: [300,    5000] },
    { name: "electricity-kenya-power",          range: [500,   20000] },
    { name: "gas-cylinder-cooking",             range: [1500,   5000] },
    { name: "garbage-collection-fee",           range: [200,    1000] },
    { name: "house-repair-maintenance",         range: [500,   30000] },
    { name: "plumber-services",                 range: [500,   10000] },
    { name: "electrician-services",             range: [500,    8000] },
    { name: "security-guard-fee",               range: [3000,  15000] },
    { name: "estate-service-charge",            range: [500,    5000] },
    { name: "mortgage-payment",                 range: [20000,200000] },
    { name: "internet-safaricom-home",          range: [2500,   9000] },
    { name: "internet-faiba",                   range: [2000,   5000] },
    { name: "internet-zuku",                    range: [2500,   7000] },
    { name: "dstv-subscription",                range: [1000,   7000] },
    { name: "netflix-subscription",             range: [799,    1299] },
    { name: "spotify-subscription",             range: [399,     399] },
    { name: "showmax-subscription",             range: [349,    1599] },
    { name: "youtube-premium",                  range: [399,     399] },
    { name: "canva-pro-subscription",           range: [1200,   1200] },
    { name: "adobe-creative-cloud",             range: [3000,  12000] },
    { name: "microsoft-365",                    range: [600,    6000] },
    { name: "zoom-subscription",                range: [1500,   8000] },
    { name: "aws-cloud-services",               range: [500,   50000] },
    { name: "domain-hosting",                   range: [500,    5000] },
    { name: "naivas-supermarket",               range: [500,   15000] },
    { name: "quickmart-shopping",               range: [300,   10000] },
    { name: "carrefour-shopping",               range: [500,   20000] },
    { name: "cleanshelf-groceries",             range: [200,    5000] },
    { name: "mama-mboga-vegetables",            range: [100,    1000] },
    { name: "market-shopping-marikiti",         range: [200,    5000] },
    { name: "butchery-meat",                    range: [200,    3000] },
    { name: "fishmonger-purchase",              range: [200,    2000] },
    { name: "milk-dairy-products",              range: [50,      300] },
    { name: "bread-bakery",                     range: [50,      200] },
    { name: "eggs-purchase",                    range: [100,     300] },
    { name: "unga-flour-purchase",              range: [200,    2000] },
    { name: "rice-purchase",                    range: [200,    3000] },
    { name: "cooking-oil-purchase",             range: [200,    2000] },
    { name: "java-coffee-restaurant",           range: [300,    3000] },
    { name: "kfc-meal",                         range: [400,    2000] },
    { name: "artcaffe-dining",                  range: [500,    4000] },
    { name: "chicken-inn-takeaway",             range: [300,    1500] },
    { name: "dormans-coffee",                   range: [200,    1200] },
    { name: "galitos-chicken",                  range: [400,    2000] },
    { name: "nyama-choma-restaurant",           range: [500,    5000] },
    { name: "pizza-inn-order",                  range: [500,    3000] },
    { name: "big-square-burger",                range: [500,    2500] },
    { name: "food-delivery-jumia",              range: [300,    2500] },
    { name: "food-delivery-glovo",              range: [300,    3000] },
    { name: "food-delivery-uber-eats",          range: [300,    2500] },
    { name: "coffee-break-snack",               range: [50,      500] },
    { name: "street-food-mutura",               range: [50,      300] },
    { name: "tea-kiosk",                        range: [20,       80] },
    { name: "uber-ride",                        range: [150,    3000] },
    { name: "bolt-ride",                        range: [100,    2500] },
    { name: "little-cab-ride",                  range: [150,    2000] },
    { name: "boda-boda-fare",                   range: [50,      500] },
    { name: "matatu-fare",                      range: [30,      200] },
    { name: "sgr-ticket-madaraka",              range: [500,    3000] },
    { name: "bus-ticket-longdistance",          range: [500,    3000] },
    { name: "fuel-petrol-station",              range: [1000,  10000] },
    { name: "vehicle-service-garage",           range: [2000,  30000] },
    { name: "parking-fee",                      range: [50,      500] },
    { name: "tyre-change-puncture",             range: [200,    2000] },
    { name: "car-wash",                         range: [200,    1000] },
    { name: "nhif-contribution",                range: [500,    1700] },
    { name: "pharmacy-medicine",                range: [100,    5000] },
    { name: "doctor-consultation",              range: [500,    5000] },
    { name: "hospital-bill",                    range: [1000,  50000] },
    { name: "dental-care",                      range: [1000,  20000] },
    { name: "optical-glasses",                  range: [2000,  15000] },
    { name: "gym-membership",                   range: [1500,   8000] },
    { name: "lab-test-fee",                     range: [500,   10000] },
    { name: "health-supplements-vitamins",      range: [500,    5000] },
    { name: "school-fees",                      range: [5000, 200000] },
    { name: "university-fees",                  range: [10000,200000] },
    { name: "online-course-udemy",              range: [500,    5000] },
    { name: "online-course-coursera",           range: [500,   15000] },
    { name: "school-bus-fee",                   range: [1000,  10000] },
    { name: "stationery-books",                 range: [200,    5000] },
    { name: "school-uniform-purchase",          range: [1000,  10000] },
    { name: "professional-course-fee",          range: [5000, 100000] },
    { name: "jumia-online-order",               range: [300,   20000] },
    { name: "kilimall-purchase",                range: [200,   15000] },
    { name: "clothes-shopping",                 range: [500,   15000] },
    { name: "shoes-purchase",                   range: [1000,  15000] },
    { name: "electronics-purchase",             range: [2000, 100000] },
    { name: "furniture-purchase",               range: [5000, 200000] },
    { name: "kitchenware-purchase",             range: [500,   20000] },
    { name: "hardware-store-items",             range: [200,   20000] },
    { name: "cleaning-supplies",                range: [200,    3000] },
    { name: "toiletries-personal-care",         range: [200,    3000] },
    { name: "baby-products",                    range: [500,   10000] },
    { name: "second-hand-clothes-mitumba",      range: [200,    5000] },
    { name: "nssf-contribution",                range: [200,    2000] },
    { name: "income-tax-paye",                  range: [500,  100000] },
    { name: "county-business-permit",           range: [3000,  30000] },
    { name: "ntsa-vehicle-inspection",          range: [500,    3000] },
    { name: "insurance-premium",                range: [1000,  50000] },
    { name: "motor-insurance",                  range: [5000,  80000] },
    { name: "life-insurance-premium",           range: [1000,  20000] },
    { name: "google-ads",                       range: [500,   50000] },
    { name: "facebook-ads",                     range: [500,   30000] },
    { name: "tiktok-ads",                       range: [500,   20000] },
    { name: "concert-ticket",                   range: [500,    8000] },
    { name: "movie-westgate",                   range: [400,    2000] },
    { name: "safari-park-nairobi",              range: [400,    3500] },
    { name: "hotel-accommodation",              range: [3000,  50000] },
    { name: "flight-ticket",                    range: [5000, 200000] },
    { name: "airbnb-accommodation",             range: [2000,  50000] },
    { name: "spa-massage",                      range: [1500,  10000] },
    { name: "salon-haircut",                    range: [200,    3000] },
    { name: "barbershop",                       range: [150,     600] },
    { name: "nail-spa",                         range: [500,    3000] },
    { name: "beach-holiday",                    range: [5000, 100000] },
    { name: "mara-safari-trip",                 range: [10000,300000] },
    { name: "club-night-out",                   range: [1000,  10000] },
    { name: "alcohol-drinks",                   range: [200,    5000] },
    { name: "gifts-and-donations",              range: [200,   20000] },
    { name: "church-offering-tithe",            range: [100,   20000] },
    { name: "harambee-contribution",            range: [500,   30000] },
    { name: "charity-donation",                 range: [200,   10000] },
    { name: "wedding-contribution",             range: [1000,  20000] },
    { name: "funeral-contribution",             range: [500,   10000] },
    { name: "seeds-purchase",                   range: [500,   10000] },
    { name: "fertilizer-purchase",              range: [2000,  20000] },
    { name: "farm-labour-wages",                range: [500,   10000] },
    { name: "animal-feed",                      range: [500,   10000] },
    { name: "airtime-purchase",                 range: [50,     3000] },
    { name: "data-bundle-purchase",             range: [50,     3000] },
    { name: "printing-photocopying",            range: [50,     1000] },
    { name: "postage-courier",                  range: [200,    5000] },
    { name: "legal-fees",                       range: [5000, 100000] },
    { name: "accountant-fee",                   range: [2000,  20000] },
    { name: "miscellaneous-expense",            range: [50,     5000] },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// §5 · FREQUENCY-SPECIFIC CATEGORY POOLS
// ═══════════════════════════════════════════════════════════════════

/** DAILY — small, high-frequency (food, transport, airtime) */
const DAILY_POOL = {
  EXPENSE: [
    { name: "matatu-fare",              range: [50,    200] },
    { name: "boda-boda-fare",           range: [50,    300] },
    { name: "coffee-break-snack",       range: [50,    400] },
    { name: "tea-kiosk",                range: [20,     80] },
    { name: "street-food-mutura",       range: [50,    200] },
    { name: "mama-mboga-vegetables",    range: [100,   500] },
    { name: "bread-bakery",             range: [50,    200] },
    { name: "eggs-purchase",            range: [100,   300] },
    { name: "milk-dairy-products",      range: [50,    300] },
    { name: "food",                     range: [50,    500] },
    { name: "airtime-purchase",         range: [50,    500] },
    { name: "data-bundle-purchase",     range: [50,    300] },
    { name: "mpesa-service-charge",     range: [10,    100] },
    { name: "parking-fee",              range: [50,    300] },
    { name: "food-and-drinks",          range: [100,   500] },
    { name: "transport-services",       range: [50,    300] },
  ],
  INCOME: [
    { name: "mpesa-till-collections",   range: [500,  5000] },
    { name: "mpesa-transfer-received",  range: [100,  2000] },
    { name: "mpesa-pochi-la-biashara",  range: [100,  5000] },
    { name: "mpesa-business-payment",   range: [200,  3000] },
    { name: "other-income",             range: [100,  1000] },
  ],
};

/** WEEKLY — groceries, fuel, dining, entertainment */
const WEEKLY_POOL = {
  EXPENSE: [
    { name: "naivas-supermarket",       range: [1000, 8000] },
    { name: "quickmart-shopping",       range: [800,  6000] },
    { name: "carrefour-shopping",       range: [1000, 10000]},
    { name: "fuel-petrol-station",      range: [2000, 8000] },
    { name: "uber-ride",                range: [500,  2000] },
    { name: "bolt-ride",                range: [300,  1500] },
    { name: "java-coffee-restaurant",   range: [500,  2000] },
    { name: "kfc-meal",                 range: [400,  1500] },
    { name: "food-delivery-glovo",      range: [400,  2000] },
    { name: "food-delivery-jumia",      range: [400,  2000] },
    { name: "butchery-meat",            range: [500,  2000] },
    { name: "cleaning-supplies",        range: [200,  1500] },
    { name: "toiletries-personal-care", range: [200,  1500] },
    { name: "car-wash",                 range: [200,   800] },
    { name: "entertainment",            range: [200,  1500] },
    { name: "groceries",                range: [500,  4000] },
    { name: "shopping",                 range: [500,  3000] },
    { name: "nyama-choma-restaurant",   range: [500,  3000] },
    { name: "chicken-inn-takeaway",     range: [300,  1200] },
    { name: "barbershop",               range: [150,   600] },
    { name: "salon-haircut",            range: [200,  2000] },
  ],
  INCOME: [
    { name: "freelance",                range: [2000, 15000]},
    { name: "mpesa-business-payment",   range: [1000, 10000]},
    { name: "jumia-seller-payout",      range: [500,  10000]},
    { name: "glovo-courier-earnings",   range: [500,   5000]},
    { name: "online-tutoring-payment",  range: [500,   5000]},
    { name: "uber-driver-earnings",     range: [1000,  8000]},
    { name: "bolt-driver-earnings",     range: [800,   6000]},
  ],
};

/** MONTHLY — bills, subscriptions, salaries, loan repayments */
const MONTHLY_POOL = {
  EXPENSE: [
    { name: "rent-payment",             range: [8000,150000]},
    { name: "electricity-kenya-power",  range: [500, 20000] },
    { name: "water-bill-nairobi-water", range: [300,  5000] },
    { name: "internet-safaricom-home",  range: [2500, 9000] },
    { name: "dstv-subscription",        range: [1000, 7000] },
    { name: "netflix-subscription",     range: [799,  1299] },
    { name: "spotify-subscription",     range: [399,   399] },
    { name: "nhif-contribution",        range: [500,  1700] },
    { name: "nssf-contribution",        range: [200,   500] },
    { name: "gym-membership",           range: [1500, 8000] },
    { name: "income-tax-paye",          range: [500,100000] },
    { name: "bank-charges",             range: [50,    500] },
    { name: "insurance-premium",        range: [1000,20000] },
    { name: "school-bus-fee",           range: [1000,10000] },
    { name: "standing-order-bank",      range: [500, 20000] },
    { name: "kcb-loan-repayment",       range: [2000,30000] },
    { name: "equity-bank-loan-repayment",range:[2000,20000] },
    { name: "paybill-bills",            range: [500, 10000] },
  ],
  INCOME: [
    { name: "salary",                   range: [30000,200000]},
    { name: "mpesa-salary",             range: [20000,150000]},
    { name: "rental-income",            range: [8000, 80000] },
    { name: "sacco-dividend",           range: [500,  10000] },
    { name: "mshwari-savings-interest", range: [50,    3000] },
    { name: "mpesa-shwari-interest",    range: [100,   2000] },
    { name: "investments",              range: [500,   5000] },
  ],
};

/** YEARLY — annual insurance, school fees, big purchases, bonuses */
const YEARLY_POOL = {
  EXPENSE: [
    { name: "motor-insurance",          range: [5000, 80000] },
    { name: "ntsa-vehicle-inspection",  range: [500,   3000] },
    { name: "county-business-permit",   range: [3000, 30000] },
    { name: "passport-application",     range: [4500,  7000] },
    { name: "school-fees",              range: [5000,200000] },
    { name: "university-fees",          range: [10000,200000]},
    { name: "life-insurance-premium",   range: [5000, 50000] },
    { name: "beach-holiday",            range: [10000,100000]},
    { name: "flight-ticket",            range: [10000,200000]},
    { name: "mara-safari-trip",         range: [20000,300000]},
    { name: "electronics-purchase",     range: [5000,100000] },
    { name: "furniture-purchase",       range: [10000,200000]},
    { name: "vehicle-service-garage",   range: [5000, 50000] },
    { name: "professional-course-fee",  range: [5000,100000] },
  ],
  INCOME: [
    { name: "tax-refund-kra",           range: [1000, 50000] },
    { name: "nssf-refund",              range: [500,  30000] },
    { name: "nse-dividend-payout",      range: [2000, 80000] },
    { name: "treasury-bill-maturity",   range: [50000,500000]},
    { name: "chama-payout",             range: [5000,100000] },
    { name: "mpesa-bonus",              range: [2000, 20000] },
    { name: "business-profit-share",    range: [10000,200000]},
    { name: "unit-trust-withdrawal",    range: [5000,200000] },
  ],
};

/**
 * RECURRING BILLS — fixed amounts injected on their exact calendar
 * day every month for maximum realism.
 */
const RECURRING_BILLS = [
  { day: 1,  type: "EXPENSE", category: "rent-payment",             range: [12000, 12000]  },
  { day: 2,  type: "EXPENSE", category: "electricity-kenya-power",  range: [1800,   1800]  },
  { day: 2,  type: "EXPENSE", category: "water-bill-nairobi-water", range: [700,     700]  },
  { day: 3,  type: "EXPENSE", category: "internet-safaricom-home",  range: [3500,   3500]  },
  { day: 3,  type: "EXPENSE", category: "dstv-subscription",        range: [2500,   2500]  },
  { day: 4,  type: "EXPENSE", category: "nhif-contribution",        range: [1700,   1700]  },
  { day: 4,  type: "EXPENSE", category: "nssf-contribution",        range: [200,     200]  },
  { day: 5,  type: "INCOME",  category: "mpesa-salary",             range: [85000,  85000] },
  { day: 5,  type: "EXPENSE", category: "income-tax-paye",          range: [15000,  15000] },
  { day: 5,  type: "EXPENSE", category: "school-bus-fee",           range: [2500,   2500]  },
  { day: 7,  type: "EXPENSE", category: "gym-membership",           range: [3000,   3000]  },
  { day: 10, type: "EXPENSE", category: "standing-order-bank",      range: [5000,   5000]  },
  { day: 15, type: "EXPENSE", category: "insurance-premium",        range: [3500,   3500]  },
  { day: 20, type: "INCOME",  category: "rental-income",            range: [15000,  15000] },
  { day: 25, type: "EXPENSE", category: "netflix-subscription",     range: [1099,   1099]  },
  { day: 25, type: "EXPENSE", category: "spotify-subscription",     range: [399,     399]  },
  { day: 25, type: "EXPENSE", category: "showmax-subscription",     range: [599,     599]  },
  { day: 28, type: "EXPENSE", category: "bank-charges",             range: [100,     100]  },
  { day: 28, type: "EXPENSE", category: "kcb-loan-repayment",       range: [8000,   8000]  },
];

// ═══════════════════════════════════════════════════════════════════
// §6 · NEW HELPERS
// ═══════════════════════════════════════════════════════════════════

function pickFrom(pool, type) {
  const list = pool[type];
  const item = list[Math.floor(Math.random() * list.length)];
  return { category: item.name, amount: getRandomAmount(item.range[0], item.range[1]) };
}

function getAnyCategory(type) {
  const all = [...CATEGORIES[type], ...EXTENDED_CATEGORIES[type]];
  const item = all[Math.floor(Math.random() * all.length)];
  return { category: item.name, amount: getRandomAmount(item.range[0], item.range[1]) };
}

function buildDescription(type, category) {
  const IV = ["Received", "Credited", "Payment from", "Deposit -", "Transfer in -", "Inflow -"];
  const EV = ["Paid for", "Payment to", "Purchase -", "Debit -", "Charge -", "Spent on"];
  const verbs = type === "INCOME" ? IV : EV;
  return `${verbs[Math.floor(Math.random() * verbs.length)]} ${category.replace(/-/g, " ")}`;
}

function pushTx(arr, totals, { type, category, amount, date, userId, accountId }) {
  arr.push({
    id: crypto.randomUUID(),
    type,
    amount,
    description: buildDescription(type, category),
    date,
    category,
    status: "COMPLETED",
    userId,
    accountId,
    createdAt: date,
    updatedAt: date,
  });
  totals.balance += type === "INCOME" ? amount : -amount;
  totals.income  += type === "INCOME"  ? amount : 0;
  totals.expense += type === "EXPENSE" ? amount : 0;
}

async function batchInsert(txClient, rows, size = 250) {
  for (let i = 0; i < rows.length; i += size) {
    await txClient.transaction.createMany({ data: rows.slice(i, i + size) });
  }
}

// ═══════════════════════════════════════════════════════════════════
// §7 · ADVANCED SEED  — daily / weekly / monthly / yearly patterns
//     Target: 1 000 – 3 000 + transactions per account
// ═══════════════════════════════════════════════════════════════════

/**
 * seedTransactionsAdvanced
 *
 * Generates transactions across four distinct frequencies:
 *
 *   DAILY   — 5-9 small everyday purchases (food, matatu, airtime)
 *   WEEKLY  — 4-7 entries on Mon & Fri (groceries, fuel, dining)
 *   MONTHLY — fixed recurring bills on their exact calendar day
 *   YEARLY  — large annual events spread evenly across the period
 *   RANDOM  — 3-6 extra entries/day from the full 300 + category pool
 *
 * With defaults (365 days) this produces ≈ 2 500 – 3 500 transactions.
 */
export async function seedTransactionsAdvanced({
  userId      = USERS[0].userId,
  accountId   = USERS[0].accountId,
  days        = 365,
  incomeRatio = 0.35,
} = {}) {
  try {
    const transactions = [];
    const totals = { balance: 0, income: 0, expense: 0 };

    // Yearly events — spread one per interval across the full range
    const yearlyExpList = YEARLY_POOL.EXPENSE;
    const yearlyIncList = YEARLY_POOL.INCOME;
    const yInterval     = Math.max(14, Math.floor(days / yearlyExpList.length));

    for (let i = days; i >= 0; i--) {
      const date      = subDays(new Date(), i);
      const dayNum    = date.getDate();
      const dow       = date.getDay(); // 0=Sun 6=Sat
      const isWeekend = dow === 0 || dow === 6;

      // ── MONTHLY: inject recurring bills on their calendar day ──
      for (const bill of RECURRING_BILLS) {
        if (bill.day === dayNum) {
          pushTx(transactions, totals, {
            type: bill.type, category: bill.category,
            amount: getRandomAmount(bill.range[0], bill.range[1]),
            date, userId, accountId,
          });
        }
      }

      // ── MONTHLY: extra monthly-pool picks on the 5th (salary day) ──
      if (dayNum === 5) {
        const monthlyCount = Math.floor(Math.random() * 3) + 2; // 2-4
        for (let m = 0; m < monthlyCount; m++) {
          const type = Math.random() < 0.5 ? "INCOME" : "EXPENSE";
          const pick = pickFrom(MONTHLY_POOL, type);
          pushTx(transactions, totals, { ...pick, type, date, userId, accountId });
        }
      }

      // ── WEEKLY: fire on Monday (1) and Friday (5) ──
      if (dow === 1 || dow === 5) {
        const weeklyCount = Math.floor(Math.random() * 4) + 4; // 4-7
        for (let w = 0; w < weeklyCount; w++) {
          const type = Math.random() < 0.22 ? "INCOME" : "EXPENSE";
          const pick = pickFrom(WEEKLY_POOL, type);
          pushTx(transactions, totals, { ...pick, type, date, userId, accountId });
        }
      }

      // ── YEARLY: spread large events evenly ──
      if (i > 0 && i % yInterval === 0) {
        const idx = Math.floor((days - i) / yInterval);
        // Expense
        const ye = yearlyExpList[idx % yearlyExpList.length];
        pushTx(transactions, totals, {
          type: "EXPENSE", category: ye.name,
          amount: getRandomAmount(ye.range[0], ye.range[1]),
          date, userId, accountId,
        });
        // Income every other interval
        if (idx % 2 === 0) {
          const yi = yearlyIncList[idx % yearlyIncList.length];
          pushTx(transactions, totals, {
            type: "INCOME", category: yi.name,
            amount: getRandomAmount(yi.range[0], yi.range[1]),
            date, userId, accountId,
          });
        }
      }

      // ── DAILY: 5-9 everyday small transactions ──
      const dailyCount = (isWeekend ? 7 : 5) + Math.floor(Math.random() * 3);
      for (let d = 0; d < dailyCount; d++) {
        const type = Math.random() < (isWeekend ? 0.08 : 0.18) ? "INCOME" : "EXPENSE";
        const pick = pickFrom(DAILY_POOL, type);
        pushTx(transactions, totals, { ...pick, type, date, userId, accountId });
      }

      // ── RANDOM: 3-6 extra from the full 300 + pool ──
      const randomCount = Math.floor(Math.random() * 4) + 3;
      for (let r = 0; r < randomCount; r++) {
        const type = Math.random() < incomeRatio ? "INCOME" : "EXPENSE";
        const pick = getAnyCategory(type);
        pushTx(transactions, totals, { ...pick, type, date, userId, accountId });
      }
    }

    // ── Persist with batched inserts ──
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { accountId } });
      await batchInsert(tx, transactions);
      await tx.account.update({
        where: { id: accountId },
        data:  { balance: totals.balance },
      });
    });

    return {
      success:          true,
      message:          `Created ${transactions.length} transactions over ${days} days`,
      transactionCount: transactions.length,
      incomeTotal:      Number(totals.income.toFixed(2)),
      expenseTotal:     Number(totals.expense.toFixed(2)),
      netBalance:       Number(totals.balance.toFixed(2)),
      daysSeeded:       days,
    };
  } catch (error) {
    console.error("Error in seedTransactionsAdvanced:", error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// §8 · SEED ALL USERS
// ═══════════════════════════════════════════════════════════════════

export async function seedAllUsers() {
  const results = [];
  for (const u of USERS) {
    const result = await seedTransactionsAdvanced({
      userId:    u.userId,
      accountId: u.accountId,
    });
    results.push({ ...u, ...result });
  }
  const allOk = results.every(r => r.success);
  return {
    success: allOk,
    results,
    message: allOk
      ? `All ${USERS.length} users seeded successfully`
      : "Some users failed — see results array",
  };
}