/**
 * M-Pesa Auto-Detector & Database Format Converter
 * Automatically detects M-Pesa SMS/CSV and converts to database schema
 * Supports: Single/Multiple SMS, CSV exports, Plain text statements
 */

// ═══════════════════════════════════════════════════════════════════
// DATABASE SCHEMA
// ═══════════════════════════════════════════════════════════════════

/**
 * Expected Database Format:
 * {
 *   type: "INCOME" | "EXPENSE",
 *   amount: number,
 *   date: Date,
 *   description: string,
 *   accountId: string,
 *   categoryId: string | null,
 *   receiptNo: string | null,
 * }
 */

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function parseAmount(str = '') {
  if (!str || str.trim() === '') return 0;
  // Remove "Ksh" prefix, commas, and parse
  return parseFloat(str.replace(/Ksh\s?/i, '').replace(/,/g, '').trim()) || 0;
}

function parseDate(str = '') {
  if (!str) return new Date();
  // Handle formats: 8/4/26, 8-4-26, 2024-04-08
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (ddmmyyyy) {
    let year = ddmmyyyy[3];
    // Convert 2-digit year to 4-digit (26 → 2026, 25 → 2025)
    if (year.length === 2) {
      year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    }
    return new Date(`${year}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
  }
  const parsed = new Date(str);
  return isNaN(parsed) ? new Date() : parsed;
}

function guessCategoryFromDetails(details = '', type = 'EXPENSE', categories = []) {
  const lower = details.toLowerCase();
  const appCats = categories.filter(c => c.type === type);

  const keywordMap = {
    food: ['food', 'restaurant', 'naivas', 'carrefour', 'quickmart', 'supermarket', 'cafe', 'java', 'kfc', 'chicken', 'pizza'],
    transport: ['uber', 'bolt', 'little', 'taxi', 'matatu', 'bus', 'fare', 'transport', 'fuel', 'petrol'],
    utilities: ['kplc', 'electricity', 'water', 'safaricom', 'airtel', 'faiba', 'wifi', 'internet', 'zuku'],
    entertainment: ['netflix', 'dstv', 'showmax', 'youtube', 'spotify', 'gaming', 'cinema'],
    shopping: ['jumia', 'kilimall', 'amazon', 'buy goods', 'shopping', 'mall'],
    salary: ['salary', 'payroll', 'wages', 'commission'],
    transfers: ['send money', 'received money', 'transfer', 'p2p'],
  };

  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const match = appCats.find(c => c.name.toLowerCase().includes(key));
      if (match) return match.id || match.name;
    }
  }
  return appCats[0]?.id || appCats[0]?.name || null;
}

// ═══════════════════════════════════════════════════════════════════
// M-PESA FORMAT DETECTION
// ═══════════════════════════════════════════════════════════════════

export function detectMpesaFormat(content = '') {
  const trimmed = content.trim();
  
  // Check for SMS format (contains "Confirmed." and receipt number)
  const hasSMS = /[A-Z]{2}[A-Z0-9]{6,10}\s+Confirmed/i.test(trimmed);
  if (hasSMS) return 'SMS';

  // Check for CSV format
  const isCSV = trimmed.includes(',') &&
    (trimmed.toLowerCase().includes('receipt') ||
      trimmed.toLowerCase().includes('paid in') ||
      trimmed.toLowerCase().includes('withdrawn') ||
      trimmed.toLowerCase().includes('completion'));
  if (isCSV) return 'CSV';

  // Check for plain text statement
  if (trimmed.toLowerCase().includes('mpesa') ||
      trimmed.toLowerCase().includes('ksh') ||
      trimmed.toLowerCase().includes('transaction')) {
    return 'TEXT';
  }

  return 'UNKNOWN';
}

// ═══════════════════════════════════════════════════════════════════
// M-PESA SMS PARSER (Multiple SMS support)
// ═══════════════════════════════════════════════════════════════════

export function parseMpesaSMS(text, categories = []) {
  const transactions = [];

  // Pattern matches: UD8GI064RA Confirmed. Ksh50.00 paid to ELIZABETH MWENDE. on 8/4/26 at 9:14 PM.
  const smsPattern = /([A-Z]{2}[A-Z0-9]{6,10})\s+Confirmed[.]\s+Ksh([\d,]+\.?\d{0,2})\s+(paid to|received from)\s+([^.]+?)\.\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi;

  let match;
  while ((match = smsPattern.exec(text)) !== null) {
    try {
      const receiptNo = match[1]?.trim();
      const amountStr = match[2]?.trim();
      const direction = match[3]?.toLowerCase();
      const recipient = match[4]?.trim();
      const dateStr = match[5]?.trim();
      const timeStr = match[6]?.trim();

      const amount = parseAmount(amountStr);
      if (amount === 0 || !receiptNo) continue;

      const type = direction.includes('received') ? 'INCOME' : 'EXPENSE';
      const date = parseDate(dateStr);
      
      const description = type === 'INCOME'
        ? `Received from ${recipient}`
        : `Paid to ${recipient}`;

      // Convert to database format
      transactions.push({
        type,
        amount,
        date,
        description,
        receiptNo,
        category: guessCategoryFromDetails(description, type, categories),
        // Source tracking
        _source: 'MPESA_SMS',
        _rawReceipt: receiptNo,
      });
    } catch (err) {
      console.warn('Error parsing M-Pesa SMS:', err);
      continue;
    }
  }

  return transactions;
}

// ═══════════════════════════════════════════════════════════════════
// M-PESA CSV PARSER
// ═══════════════════════════════════════════════════════════════════

function splitCSVRow(row) {
  const result = [];
  let current = '', inQuotes = false;
  for (const ch of row) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export function parseMpesaCSV(csvText, categories = []) {
  const lines = csvText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  
  if (lines.length < 2) return [];

  // Find header row
  let headerIdx = lines.findIndex(
    l => l.toLowerCase().includes('receipt') || l.toLowerCase().includes('completion')
  );
  if (headerIdx === -1) headerIdx = 0;

  const headers = splitCSVRow(lines[headerIdx]).map(h =>
    h.toLowerCase().replace(/[\s.]/g, '')
  );

  const transactions = [];
  for (const row of lines.slice(headerIdx + 1)) {
    if (!row || row.startsWith('#')) continue;
    const cols = splitCSVRow(row);
    if (cols.length < 4) continue;

    const get = key => {
      const idx = headers.findIndex(h => h.includes(key));
      return idx !== -1 ? (cols[idx] || '').trim() : '';
    };

    const receiptNo = get('receipt');
    const rawDate = get('completion') || get('date') || get('time');
    const details = get('details') || get('description') || get('narration');
    const status = get('status') || 'Completed';
    const paidIn = parseAmount(get('paidin') || get('credit') || get('in'));
    const withdrawn = parseAmount(get('withdrawn') || get('debit') || get('out'));

    if (status && !status.toLowerCase().includes('complet')) continue;
    if (paidIn === 0 && withdrawn === 0) continue;

    const type = paidIn > 0 ? 'INCOME' : 'EXPENSE';
    const amount = paidIn > 0 ? paidIn : withdrawn;
    const date = parseDate(rawDate);
    const category = guessCategoryFromDetails(details, type, categories);

    transactions.push({
      type,
      amount,
      date,
      description: details || 'M-Pesa Transaction',
      receiptNo,
      category,
      _source: 'MPESA_CSV',
      _rawReceipt: receiptNo,
    });
  }

  return transactions;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN AUTO-DETECTOR & CONVERTER
// ═══════════════════════════════════════════════════════════════════

/**
 * Auto-detect M-Pesa format and convert to database format
 * @param {string} content - Raw M-Pesa data (SMS, CSV, or text)
 * @param {array} categories - Available categories for auto-assignment
 * @returns {object} { format, transactions, errors, stats }
 */
export function autoDetectAndConvertMpesa(content = '', categories = []) {
  const format = detectMpesaFormat(content);
  let transactions = [];
  const errors = [];
  const stats = {
    total: 0,
    income: 0,
    expense: 0,
    duplicates: 0,
    errors: 0,
  };

  try {
    if (format === 'SMS') {
      transactions = parseMpesaSMS(content, categories);
    } else if (format === 'CSV') {
      transactions = parseMpesaCSV(content, categories);
    } else if (format === 'TEXT') {
      // Try SMS parser first, then CSV
      transactions = parseMpesaSMS(content, categories);
      if (transactions.length === 0) {
        transactions = parseMpesaCSV(content, categories);
      }
    } else {
      errors.push('Unknown format. Please paste M-Pesa SMS, CSV export, or statement text.');
      return { format: 'UNKNOWN', transactions: [], errors, stats };
    }

    // Validate and count
    for (const tx of transactions) {
      stats.total++;
      if (tx.type === 'INCOME') stats.income++;
      if (tx.type === 'EXPENSE') stats.expense++;
    }

    // Remove duplicates by receipt number
    const seenReceipts = new Set();
    const unique = [];
    for (const tx of transactions) {
      if (tx.receiptNo && seenReceipts.has(tx.receiptNo)) {
        stats.duplicates++;
      } else {
        if (tx.receiptNo) seenReceipts.add(tx.receiptNo);
        unique.push(tx);
      }
    }

    if (stats.duplicates > 0) {
      errors.push(`${stats.duplicates} duplicate transaction(s) removed.`);
    }

    return {
      format,
      transactions: unique,
      errors,
      stats: {
        ...stats,
        total: unique.length,
      },
    };
  } catch (err) {
    errors.push(`Parse error: ${err.message}`);
    return { format, transactions: [], errors, stats };
  }
}

// ═══════════════════════════════════════════════════════════════════
// DATABASE FORMAT CONVERTER
// Converts parsed transactions to final database schema
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert parsed transactions to database submission format
 * @param {array} transactions - Parsed transactions
 * @param {string} accountId - Target account ID
 * @param {array} categories - Available categories
 * @returns {array} Database-ready transaction objects
 */
export function convertToDbFormat(transactions, accountId, categories = []) {
  return transactions.map(tx => {
    // Find matching category object
    const catObj = categories.find(
      c => c.id === tx.category || c.name === tx.category
    );

    return {
      type: tx.type,
      amount: tx.amount,
      date: tx.date instanceof Date ? tx.date : new Date(tx.date),
      description: tx.description || 'Transaction',
      accountId,
      categoryId: catObj?.id || null,
      receiptNo: tx.receiptNo || null,
      source: 'MPESA_IMPORT',
      // Optional fields for tracking
      ...(tx._source && { _importSource: tx._source }),
      ...(tx._rawReceipt && { _rawReceiptNo: tx._rawReceipt }),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function validateTransactions(transactions) {
  const errors = [];

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      isValid: false,
      errors: ['No transactions to validate'],
      count: 0,
    };
  }

  transactions.forEach((tx, index) => {
    if (!tx.date) errors.push(`Row ${index + 1}: Missing date`);
    if (!tx.type) errors.push(`Row ${index + 1}: Missing transaction type`);
    if (typeof tx.amount !== 'number' || tx.amount <= 0) {
      errors.push(`Row ${index + 1}: Invalid amount (must be > 0)`);
    }
    if (!tx.description) errors.push(`Row ${index + 1}: Missing description`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    count: transactions.length,
  };
}

// ═══════════════════════════════════════════════════════════════════
// MULTI-SMS BATCH PROCESSOR
// Handles multiple M-Pesa SMS messages pasted at once
// ═══════════════════════════════════════════════════════════════════

/**
 * Process multiple M-Pesa SMS messages and convert all at once
 * @param {string} rawInput - Multiple SMS messages (newline or space separated)
 * @param {string} accountId - Target account
 * @param {array} categories - Available categories
 * @returns {object} { success, count, transactions, errors }
 */
export function processBatchMpesaSMS(rawInput, accountId, categories = []) {
  // Step 1: Auto-detect and convert
  const detected = autoDetectAndConvertMpesa(rawInput, categories);

  if (detected.transactions.length === 0) {
    return {
      success: false,
      count: 0,
      transactions: [],
      errors: detected.errors,
      stats: detected.stats,
    };
  }

  // Step 2: Validate
  const validation = validateTransactions(detected.transactions);

  if (!validation.isValid) {
    return {
      success: false,
      count: 0,
      transactions: [],
      errors: [...detected.errors, ...validation.errors],
      stats: detected.stats,
    };
  }

  // Step 3: Convert to database format
  const dbTransactions = convertToDbFormat(
    detected.transactions,
    accountId,
    categories
  );

  return {
    success: true,
    count: dbTransactions.length,
    transactions: dbTransactions,
    errors: detected.errors,
    stats: detected.stats,
  };
}