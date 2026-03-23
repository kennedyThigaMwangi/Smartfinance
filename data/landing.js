import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
  // ── new icons ──
  ShieldCheck,
  BellRing,
  Brain,
  Repeat,
  TrendingUp,
  Wallet,
  ScanLine,
  Lock,
  Smartphone,
  Users,
  Award,
  Star,
  CheckCircle,
  ArrowUpRight,
  Building2,
  Landmark,
  Target,
  Sparkles,
  Clock,
  HeartHandshake,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// §1 · STATS  (original 4 entries untouched + 4 new)
// ═══════════════════════════════════════════════════════════════════

export const statsData = [
  // ── original ──
  {
    value: "5000+",
    label: "Active Users",
  },
  {
    value: "$2000+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
  // ── new ──
  {
    value: "KES 2B+",
    label: "Money Managed",
  },
  {
    value: "150+",
    label: "Countries Supported",
  },
  {
    value: "3M+",
    label: "Receipts Scanned",
  },
  {
    value: "24/7",
    label: "AI Support",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §2 · FEATURES  (original 6 entries untouched + 6 new)
// ═══════════════════════════════════════════════════════════════════

export const featuresData = [
  // ── original ──
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Multi-Currency",
    description: "Support for multiple currencies with real-time conversion",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
  // ── new ──
  {
    icon: <BellRing className="h-8 w-8 text-blue-600" />,
    title: "Smart Alerts",
    description:
      "Receive instant notifications for unusual spending, bill due dates, and budget limits",
  },
  {
    icon: <Repeat className="h-8 w-8 text-blue-600" />,
    title: "Recurring Transactions",
    description:
      "Automatically detect and track subscriptions, loans, and recurring payments",
  },
  {
    icon: <Brain className="h-8 w-8 text-blue-600" />,
    title: "AI Financial Coach",
    description:
      "Get personalised money advice powered by your real spending data and financial goals",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption and two-factor authentication keep your financial data safe",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
    title: "Investment Tracking",
    description:
      "Monitor your NSE stocks, unit trusts, SACCOs, and crypto portfolio in one dashboard",
  },
  {
    icon: <Smartphone className="h-8 w-8 text-blue-600" />,
    title: "M-Pesa Integration",
    description:
      "Seamlessly import and categorise all your M-Pesa transactions automatically",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §3 · HOW IT WORKS  (original 3 steps untouched + 2 new)
// ═══════════════════════════════════════════════════════════════════

export const howItWorksData = [
  // ── original ──
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
  // ── new ──
  {
    icon: <Target className="h-8 w-8 text-blue-600" />,
    title: "4. Set Financial Goals",
    description:
      "Define savings targets, debt payoff plans, and investment milestones to stay on track",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-blue-600" />,
    title: "5. Grow Your Wealth",
    description:
      "Follow AI-generated action plans to reduce expenses, boost savings, and build lasting wealth",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §4 · TESTIMONIALS  (original 3 entries untouched + 5 new)
// ═══════════════════════════════════════════════════════════════════

export const testimonialsData = [
  // ── original ──
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "Smartfinance has transformed how I manage my business finances. The AI insights have helped me identify cost-saving opportunities I never knew existed.",
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The receipt scanning feature saves me hours each month. Now I can focus on my work instead of manual data entry and expense tracking.",
  },
  {
    name: "Emily Rodriguez",
    role: "Financial Advisor",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "I recommend Smartfinance to all my clients. The multi-currency support and detailed analytics make it perfect for international investors.",
  },
  // ── new ──
  {
    name: "David Kamau",
    role: "Software Engineer, Nairobi",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "The M-Pesa integration is a game changer. Every Lipa na M-Pesa transaction is automatically logged and categorised — I finally know where my money goes every month.",
    rating: 5,
  },
  {
    name: "Amina Waweru",
    role: "University Student",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "As a student managing a tight budget, Smartfinance's budget alerts have saved me from overspending countless times. The AI coach gave me a savings plan I actually follow.",
    rating: 5,
  },
  {
    name: "James Omondi",
    role: "Entrepreneur & Investor",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    quote:
      "I track my NSE portfolio, rental income, and business accounts all in one place. The investment tracking feature alone is worth every shilling of the subscription.",
    rating: 5,
  },
  {
    name: "Grace Muthoni",
    role: "HR Manager",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    quote:
      "The recurring transaction detector caught three forgotten subscriptions I was still paying for. Smartfinance paid for itself in the first week!",
    rating: 5,
  },
  {
    name: "Brian Otieno",
    role: "Freelance Designer",
    image: "https://randomuser.me/api/portraits/men/47.jpg",
    quote:
      "Managing client payments in USD, EUR, and KES used to be a nightmare. The multi-currency dashboard makes tax season so much less stressful.",
    rating: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════
// §5 · PRICING PLANS  (new section)
// ═══════════════════════════════════════════════════════════════════

export const pricingData = [
  {
    name: "Free",
    price: "KES 0",
    period: "forever",
    description: "Perfect for getting started with personal finance tracking",
    highlight: false,
    features: [
      "1 account",
      "Up to 100 transactions/month",
      "Basic analytics dashboard",
      "Manual transaction entry",
      "Mobile-friendly interface",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "KES 499",
    period: "per month",
    description: "For individuals serious about growing their financial health",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited accounts",
      "Unlimited transactions",
      "AI-powered analytics",
      "Smart receipt scanner",
      "M-Pesa auto-import",
      "Budget planning & alerts",
      "Recurring transaction detection",
      "Investment portfolio tracker",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Business",
    price: "KES 1,999",
    period: "per month",
    description: "For SMEs and teams managing complex finances",
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Multi-currency support",
      "Business expense reports",
      "API access",
      "Dedicated account manager",
      "Custom categories & tags",
      "KRA-ready tax summaries",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §6 · FAQ  (new section)
// ═══════════════════════════════════════════════════════════════════

export const faqData = [
  {
    question: "Is Smartfinance safe to use with my bank accounts?",
    answer:
      "Absolutely. Smartfinance uses 256-bit bank-grade encryption and never stores your banking passwords. All data is read-only — we can view transactions but cannot move money.",
  },
  {
    question: "Does it work with M-Pesa?",
    answer:
      "Yes! Smartfinance automatically imports and categorises all your M-Pesa transactions including Lipa na M-Pesa, Send Money, Pay Bill, and M-Shwari. Simply link your Safaricom number during setup.",
  },
  {
    question: "Can I track multiple currencies?",
    answer:
      "Yes. Smartfinance supports 150+ currencies with real-time exchange rates. You can set KES as your base currency and view all transactions converted automatically.",
  },
  {
    question: "How does the AI receipt scanner work?",
    answer:
      "Take a photo of any receipt and our AI extracts the amount, date, merchant name, and category automatically. It works with M-Pesa messages, till receipts, and digital invoices.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes — our Free plan supports 1 account and up to 100 transactions per month at no cost, forever. Upgrade to Pro anytime for unlimited features.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. You can export all your transactions as CSV or PDF at any time. Pro and Business users also get formatted reports suitable for accountants and KRA filings.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "Your data is always yours. If you cancel, your account reverts to the Free plan and all your historical data remains accessible. You can export everything before downgrading.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §7 · TRUSTED BRANDS / INTEGRATIONS  (new section)
// ═══════════════════════════════════════════════════════════════════

export const integrationsData = [
  { name: "M-Pesa",         category: "Mobile Money"  },
  { name: "Equity Bank",    category: "Banking"       },
  { name: "KCB",            category: "Banking"       },
  { name: "Co-op Bank",     category: "Banking"       },
  { name: "NCBA",           category: "Banking"       },
  { name: "Absa Kenya",     category: "Banking"       },
  { name: "DTB",            category: "Banking"       },
  { name: "Airtel Money",   category: "Mobile Money"  },
  { name: "T-Kash",         category: "Mobile Money"  },
  { name: "NSE",            category: "Investments"   },
  { name: "CIC",            category: "Investments"   },
  { name: "Britam",         category: "Investments"   },
  { name: "Cytonn",         category: "Investments"   },
  { name: "Jumia",          category: "E-Commerce"    },
  { name: "Pesapal",        category: "Payments"      },
];

// ═══════════════════════════════════════════════════════════════════
// §8 · SECURITY FEATURES  (new section)
// ═══════════════════════════════════════════════════════════════════

export const securityData = [
  {
    icon: <Lock className="h-6 w-6 text-blue-600" />,
    title: "256-Bit Encryption",
    description: "All data is encrypted at rest and in transit using AES-256",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
    title: "Two-Factor Authentication",
    description: "Protect your account with SMS or authenticator app 2FA",
  },
  {
    icon: <Clock className="h-6 w-6 text-blue-600" />,
    title: "Auto Session Timeout",
    description: "Sessions expire automatically after inactivity to prevent unauthorised access",
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-blue-600" />,
    title: "Privacy First",
    description: "We never sell your data. Your financial information stays private — always",
  },
];

// ═══════════════════════════════════════════════════════════════════
// §9 · COMPARISON TABLE  (new section — Smartfinance vs spreadsheets)
// ═══════════════════════════════════════════════════════════════════

export const comparisonData = {
  headers: ["Feature", "Spreadsheet", "Other Apps", "Smartfinance"],
  rows: [
    { feature: "Auto M-Pesa import",         spreadsheet: false, others: false, smartfinance: true  },
    { feature: "AI receipt scanning",         spreadsheet: false, others: true,  smartfinance: true  },
    { feature: "KES / multi-currency",        spreadsheet: true,  others: true,  smartfinance: true  },
    { feature: "AI financial coach",          spreadsheet: false, others: false, smartfinance: true  },
    { feature: "Investment tracking",         spreadsheet: true,  others: false, smartfinance: true  },
    { feature: "Recurring bill detection",    spreadsheet: false, others: true,  smartfinance: true  },
    { feature: "Budget alerts",               spreadsheet: false, others: true,  smartfinance: true  },
    { feature: "KRA tax export",              spreadsheet: true,  others: false, smartfinance: true  },
    { feature: "Mobile app",                  spreadsheet: false, others: true,  smartfinance: true  },
    { feature: "Free plan available",         spreadsheet: true,  others: false, smartfinance: true  },
  ],
};