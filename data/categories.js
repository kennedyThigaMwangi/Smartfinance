// ═══════════════════════════════════════════════════════════════════
// §1 · ORIGINAL defaultCategories (untouched)
// ═══════════════════════════════════════════════════════════════════

export const defaultCategories = [
  // ── INCOME ──────────────────────────────────────────────────────
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#22c55e", // green-500
    icon: "Wallet",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#06b6d4", // cyan-500
    icon: "Laptop",
  },
  {
    id: "investments",
    name: "Investments",
    type: "INCOME",
    color: "#6366f1", // indigo-500
    icon: "TrendingUp",
  },
  {
    id: "business",
    name: "Business",
    type: "INCOME",
    color: "#ec4899", // pink-500
    icon: "Building",
  },
  {
    id: "rental",
    name: "Rental",
    type: "INCOME",
    color: "#f59e0b", // amber-500
    icon: "Home",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#64748b", // slate-500
    icon: "Plus",
  },

  // ── EXPENSE ─────────────────────────────────────────────────────
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#ef4444", // red-500
    icon: "Home",
    subcategories: ["Rent", "Mortgage", "Property Tax", "Maintenance"],
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#f97316", // orange-500
    icon: "Car",
    subcategories: ["Fuel", "Public Transport", "Maintenance", "Parking"],
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#84cc16", // lime-500
    icon: "Shopping",
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500
    icon: "Zap",
    subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#8b5cf6", // violet-500
    icon: "Film",
    subcategories: ["Movies", "Games", "Streaming Services"],
  },
  {
    id: "food",
    name: "Food",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500
    icon: "UtensilsCrossed",
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#ec4899", // pink-500
    icon: "ShoppingBag",
    subcategories: ["Clothing", "Electronics", "Home Goods"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500
    icon: "HeartPulse",
    subcategories: ["Medical", "Dental", "Pharmacy", "Insurance"],
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#6366f1", // indigo-500
    icon: "GraduationCap",
    subcategories: ["Tuition", "Books", "Courses"],
  },
  {
    id: "personal",
    name: "Personal Care",
    type: "EXPENSE",
    color: "#d946ef", // fuchsia-500
    icon: "Smile",
    subcategories: ["Haircut", "Gym", "Beauty"],
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#0ea5e9", // sky-500
    icon: "Plane",
  },
  {
    id: "insurance",
    name: "Insurance",
    type: "EXPENSE",
    color: "#64748b", // slate-500
    icon: "Shield",
    subcategories: ["Life", "Home", "Vehicle"],
  },
  {
    id: "gifts",
    name: "Gifts & Donations",
    type: "EXPENSE",
    color: "#f472b6", // pink-400
    icon: "Gift",
  },
  {
    id: "bills",
    name: "Bills & Fees",
    type: "EXPENSE",
    color: "#fb7185", // rose-400
    icon: "Receipt",
    subcategories: ["Bank Fees", "Late Fees", "Service Charges"],
  },
  {
    id: "other-expense",
    name: "Other Expenses",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400
    icon: "MoreHorizontal",
  },
];

// categoryColors is exported below in §3 using allCategories (original + extended)

// ═══════════════════════════════════════════════════════════════════
// §2 · EXTENDED CATEGORIES  (Kenyan-specific + global additions)
// ═══════════════════════════════════════════════════════════════════

export const extendedCategories = [
  // ── INCOME ──────────────────────────────────────────────────────

  // M-Pesa & Mobile Money
  {
    id: "mpesa-income",
    name: "M-Pesa Received",
    type: "INCOME",
    color: "#16a34a", // green-600
    icon: "Smartphone",
    subcategories: [
      "Send Money Received",
      "Till Collection",
      "Paybill Collection",
      "Pochi la Biashara",
      "Fuliza Credit",
      "Agent Float",
    ],
  },
  {
    id: "mpesa-salary",
    name: "M-Pesa Salary",
    type: "INCOME",
    color: "#15803d", // green-700
    icon: "Banknote",
    subcategories: ["Monthly Salary", "Casual Wages", "Commission"],
  },
  {
    id: "gig-income",
    name: "Gig & Digital",
    type: "INCOME",
    color: "#0891b2", // cyan-600
    icon: "Globe",
    subcategories: [
      "Upwork",
      "Fiverr",
      "YouTube AdSense",
      "TikTok Creator Fund",
      "Instagram Brand Deal",
      "Podcast Sponsorship",
    ],
  },
  {
    id: "sacco-income",
    name: "SACCO & Chama",
    type: "INCOME",
    color: "#7c3aed", // violet-600
    icon: "Users",
    subcategories: ["SACCO Dividend", "Chama Payout", "Welfare Payout"],
  },
  {
    id: "nse-income",
    name: "NSE & Stocks",
    type: "INCOME",
    color: "#2563eb", // blue-600
    icon: "TrendingUp",
    subcategories: ["Dividend Payout", "Share Sale", "Bond Coupon", "Unit Trust Withdrawal"],
  },
  {
    id: "govt-income",
    name: "Government",
    type: "INCOME",
    color: "#0f766e", // teal-700
    icon: "Building2",
    subcategories: ["KRA Tax Refund", "NSSF Refund", "NHIF Refund", "Tender Payment", "Bursary"],
  },
  {
    id: "remittance",
    name: "Remittance",
    type: "INCOME",
    color: "#0284c7", // sky-600
    icon: "ArrowDownLeft",
    subcategories: ["M-Pesa Global", "Western Union", "WorldRemit", "Bank Wire"],
  },
  {
    id: "farm-income",
    name: "Farming",
    type: "INCOME",
    color: "#65a30d", // lime-600
    icon: "Sprout",
    subcategories: ["Crop Sale", "Livestock Sale", "Dairy", "Poultry"],
  },
  {
    id: "social-income",
    name: "Gifts & Social",
    type: "INCOME",
    color: "#db2777", // pink-600
    icon: "HeartHandshake",
    subcategories: ["Gift Cash", "Harambee Received", "Wedding Gift", "Birthday Gift"],
  },

  // ── EXPENSE ─────────────────────────────────────────────────────

  // M-Pesa & Mobile Money
  {
    id: "mpesa-expense",
    name: "M-Pesa Payments",
    type: "EXPENSE",
    color: "#dc2626", // red-600
    icon: "Smartphone",
    subcategories: [
      "Send Money",
      "Pay Bill",
      "Buy Goods",
      "Fuliza Repayment",
      "Hustler Fund Repayment",
      "M-Shwari Lock Savings",
      "Global Send",
      "Agent Withdrawal",
    ],
  },
  {
    id: "airtime-data",
    name: "Airtime & Data",
    type: "EXPENSE",
    color: "#9333ea", // purple-600
    icon: "Signal",
    subcategories: ["Airtime", "Data Bundle", "Fibre", "Home Internet"],
  },

  // Housing & Property
  {
    id: "rent",
    name: "Rent & Housing",
    type: "EXPENSE",
    color: "#b91c1c", // red-700
    icon: "Building",
    subcategories: [
      "Monthly Rent",
      "Deposit",
      "Estate Service Charge",
      "Caretaker Fee",
      "Garbage Collection",
    ],
  },
  {
    id: "home-repairs",
    name: "Home Repairs",
    type: "EXPENSE",
    color: "#c2410c", // orange-700
    icon: "Wrench",
    subcategories: ["Plumbing", "Electrical", "Painting", "Roofing", "General Maintenance"],
  },
  {
    id: "home-utilities",
    name: "Utilities (KE)",
    type: "EXPENSE",
    color: "#0369a1", // sky-700
    icon: "Zap",
    subcategories: [
      "Kenya Power",
      "Nairobi Water",
      "Cooking Gas",
      "Safaricom Home",
      "Faiba Internet",
      "Zuku Internet",
    ],
  },

  // Food & Dining
  {
    id: "supermarket",
    name: "Supermarket",
    type: "EXPENSE",
    color: "#4d7c0f", // lime-700
    icon: "ShoppingCart",
    subcategories: [
      "Naivas",
      "Quickmart",
      "Carrefour",
      "Cleanshelf",
      "Uchumi",
      "General Groceries",
    ],
  },
  {
    id: "market-fresh",
    name: "Market & Fresh",
    type: "EXPENSE",
    color: "#15803d", // green-700
    icon: "Leaf",
    subcategories: ["Vegetables", "Fruits", "Meat", "Fish", "Eggs & Dairy"],
  },
  {
    id: "restaurants",
    name: "Restaurants",
    type: "EXPENSE",
    color: "#be185d", // pink-700
    icon: "UtensilsCrossed",
    subcategories: [
      "Java",
      "KFC",
      "Artcaffe",
      "Chicken Inn",
      "Nyama Choma",
      "Pizza Inn",
      "Takeaway",
    ],
  },
  {
    id: "food-delivery",
    name: "Food Delivery",
    type: "EXPENSE",
    color: "#e11d48", // rose-600
    icon: "Bike",
    subcategories: ["Glovo", "Jumia Food", "Uber Eats", "Other Delivery"],
  },

  // Transport
  {
    id: "ride-hailing",
    name: "Ride Hailing",
    type: "EXPENSE",
    color: "#ea580c", // orange-600
    icon: "Car",
    subcategories: ["Uber", "Bolt", "Little Cab", "inDriver"],
  },
  {
    id: "public-transport",
    name: "Public Transport",
    type: "EXPENSE",
    color: "#d97706", // amber-600
    icon: "Bus",
    subcategories: ["Matatu", "Boda Boda", "Bus", "SGR Madaraka Express"],
  },
  {
    id: "vehicle",
    name: "Vehicle",
    type: "EXPENSE",
    color: "#b45309", // amber-700
    icon: "Wrench",
    subcategories: ["Fuel", "Service", "Tyres", "Insurance", "NTSA", "Car Wash"],
  },

  // Healthcare
  {
    id: "nhif",
    name: "NHIF & Insurance",
    type: "EXPENSE",
    color: "#0f766e", // teal-700
    icon: "ShieldCheck",
    subcategories: ["NHIF Contribution", "Private Health Insurance", "Life Insurance"],
  },
  {
    id: "medical",
    name: "Medical",
    type: "EXPENSE",
    color: "#0d9488", // teal-600
    icon: "Stethoscope",
    subcategories: [
      "Doctor Consultation",
      "Hospital Bill",
      "Pharmacy",
      "Dental",
      "Optical",
      "Lab Tests",
    ],
  },
  {
    id: "wellness",
    name: "Wellness & Fitness",
    type: "EXPENSE",
    color: "#16a34a", // green-600
    icon: "Dumbbell",
    subcategories: ["Gym Membership", "Vitamins & Supplements", "Spa & Massage", "Sports"],
  },

  // Education
  {
    id: "school-fees",
    name: "School Fees",
    type: "EXPENSE",
    color: "#4f46e5", // indigo-600
    icon: "GraduationCap",
    subcategories: [
      "Primary School",
      "Secondary School",
      "University / College",
      "School Bus",
      "Uniform & Books",
    ],
  },
  {
    id: "online-learning",
    name: "Online Learning",
    type: "EXPENSE",
    color: "#7c3aed", // violet-600
    icon: "Monitor",
    subcategories: ["Udemy", "Coursera", "LinkedIn Learning", "Professional Certification"],
  },

  // Subscriptions & Streaming
  {
    id: "streaming",
    name: "Streaming Services",
    type: "EXPENSE",
    color: "#7c3aed", // violet-600
    icon: "Play",
    subcategories: ["Netflix", "Showmax", "YouTube Premium", "DStv", "Apple TV"],
  },
  {
    id: "music-subs",
    name: "Music & Audio",
    type: "EXPENSE",
    color: "#a21caf", // fuchsia-700
    icon: "Music",
    subcategories: ["Spotify", "Apple Music", "Audiomack"],
  },
  {
    id: "software-subs",
    name: "Software & Tools",
    type: "EXPENSE",
    color: "#1d4ed8", // blue-700
    icon: "Code",
    subcategories: [
      "Microsoft 365",
      "Adobe Creative Cloud",
      "Canva Pro",
      "Zoom",
      "AWS",
      "Domain & Hosting",
      "GitHub",
      "Figma",
    ],
  },

  // Banking & Finance
  {
    id: "loan-repayment",
    name: "Loan Repayments",
    type: "EXPENSE",
    color: "#dc2626", // red-600
    icon: "Landmark",
    subcategories: [
      "Equity Bank Loan",
      "KCB Loan",
      "Co-op Bank Loan",
      "SACCO Loan",
      "Fuliza",
      "Hustler Fund",
    ],
  },
  {
    id: "savings-contributions",
    name: "Savings & Investments",
    type: "EXPENSE",
    color: "#059669", // emerald-600
    icon: "PiggyBank",
    subcategories: [
      "SACCO Contribution",
      "Chama Contribution",
      "M-Shwari Savings",
      "Unit Trust Deposit",
      "Fixed Deposit",
    ],
  },
  {
    id: "bank-charges",
    name: "Bank Charges",
    type: "EXPENSE",
    color: "#475569", // slate-600
    icon: "CreditCard",
    subcategories: ["Transaction Fees", "Maintenance Fees", "ATM Fees", "Card Fees"],
  },

  // Government & Compliance
  {
    id: "taxes",
    name: "Taxes & Levies",
    type: "EXPENSE",
    color: "#374151", // gray-700
    icon: "FileText",
    subcategories: ["PAYE", "VAT", "Withholding Tax", "Land Rates", "County Levies"],
  },
  {
    id: "govt-fees",
    name: "Government Fees",
    type: "EXPENSE",
    color: "#4b5563", // gray-600
    icon: "Stamp",
    subcategories: [
      "NSSF Contribution",
      "Passport",
      "ID Replacement",
      "NTSA Inspection",
      "Business Permit",
    ],
  },

  // Social & Community
  {
    id: "harambee",
    name: "Harambee & Social",
    type: "EXPENSE",
    color: "#c026d3", // fuchsia-600
    icon: "HeartHandshake",
    subcategories: [
      "Harambee Contribution",
      "Wedding Gift",
      "Funeral Contribution",
      "Church Offering / Tithe",
      "Birthday Gift",
      "Baby Shower",
    ],
  },

  // Shopping
  {
    id: "online-shopping",
    name: "Online Shopping",
    type: "EXPENSE",
    color: "#f472b6", // pink-400
    icon: "Package",
    subcategories: ["Jumia", "Kilimall", "Jiji", "Amazon", "AliExpress"],
  },
  {
    id: "clothing-fashion",
    name: "Clothing & Fashion",
    type: "EXPENSE",
    color: "#e879f9", // fuchsia-400
    icon: "Shirt",
    subcategories: ["Clothes", "Shoes", "Accessories", "Mitumba (Second Hand)"],
  },
  {
    id: "electronics",
    name: "Electronics",
    type: "EXPENSE",
    color: "#60a5fa", // blue-400
    icon: "Cpu",
    subcategories: ["Phone", "Laptop", "TV", "Accessories", "Appliances"],
  },
  {
    id: "home-goods",
    name: "Home & Furniture",
    type: "EXPENSE",
    color: "#a78bfa", // violet-400
    icon: "Armchair",
    subcategories: ["Furniture", "Bedding", "Kitchenware", "Décor"],
  },

  // Personal Care
  {
    id: "salon-barber",
    name: "Salon & Barber",
    type: "EXPENSE",
    color: "#f9a8d4", // pink-300
    icon: "Scissors",
    subcategories: ["Haircut", "Hair Treatment", "Nails", "Braids", "Barber"],
  },

  // Travel & Leisure
  {
    id: "domestic-travel",
    name: "Domestic Travel",
    type: "EXPENSE",
    color: "#38bdf8", // sky-400
    icon: "MapPin",
    subcategories: ["Bus Ticket", "SGR", "Domestic Flight", "Hotel", "Airbnb"],
  },
  {
    id: "international-travel",
    name: "International Travel",
    type: "EXPENSE",
    color: "#0284c7", // sky-600
    icon: "Plane",
    subcategories: ["Flight", "Visa Fees", "Hotel Abroad", "Travel Insurance", "Forex"],
  },
  {
    id: "leisure",
    name: "Leisure & Events",
    type: "EXPENSE",
    color: "#818cf8", // indigo-400
    icon: "PartyPopper",
    subcategories: [
      "Safari / Game Park",
      "Concert / Festival",
      "Cinema",
      "Restaurant Night Out",
      "Sports Event",
    ],
  },

  // Farming & Agriculture
  {
    id: "farm-expense",
    name: "Farming Expenses",
    type: "EXPENSE",
    color: "#86efac", // green-300
    icon: "Tractor",
    subcategories: [
      "Seeds",
      "Fertilizer",
      "Pesticides",
      "Labour",
      "Irrigation",
      "Veterinary",
      "Animal Feed",
    ],
  },

  // Digital Advertising
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    type: "EXPENSE",
    color: "#fb923c", // orange-400
    icon: "Megaphone",
    subcategories: ["Google Ads", "Facebook Ads", "TikTok Ads", "SMS Bulk", "Influencer"],
  },
];

// ═══════════════════════════════════════════════════════════════════
// §3 · COMBINED & DERIVED EXPORTS
// ═══════════════════════════════════════════════════════════════════

/** All categories — original + extended, deduped by id */
export const allCategories = [
  ...defaultCategories,
  ...extendedCategories.filter(
    (ext) => !defaultCategories.some((def) => def.id === ext.id)
  ),
];

/** Colour map for every category id */
export const categoryColors = allCategories.reduce((acc, cat) => {
  acc[cat.id] = cat.color;
  return acc;
}, {});

/** Icon map for every category id */
export const categoryIcons = allCategories.reduce((acc, cat) => {
  acc[cat.id] = cat.icon;
  return acc;
}, {});

/** All INCOME categories */
export const incomeCategories = allCategories.filter((c) => c.type === "INCOME");

/** All EXPENSE categories */
export const expenseCategories = allCategories.filter((c) => c.type === "EXPENSE");

/** All subcategory strings (flat) */
export const allSubcategories = allCategories
  .flatMap((c) => c.subcategories ?? [])
  .filter(Boolean);

/**
 * Get a single category by id — searches the full combined list.
 * Returns undefined if not found.
 */
export function getCategoryById(id) {
  return allCategories.find((c) => c.id === id);
}

/**
 * Get the hex colour for a category id.
 * Falls back to slate-400 (#94a3b8) if id is unknown.
 */
export function getCategoryColor(id) {
  return categoryColors[id] ?? "#94a3b8";
}

/**
 * Get all subcategories for a given parent category id.
 * Returns an empty array if none exist.
 */
export function getSubcategories(id) {
  return getCategoryById(id)?.subcategories ?? [];
}

/**
 * Search categories by name (case-insensitive).
 * Optionally filter by type: "INCOME" | "EXPENSE"
 */
export function searchCategories(query, type) {
  const q = query.toLowerCase();
  return allCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) &&
      (type ? c.type === type : true)
  );
}