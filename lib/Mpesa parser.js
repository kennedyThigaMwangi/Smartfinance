/**
 * M-Pesa Statement Parser
 * Parses M-Pesa CSV files and extracts transaction data
 */

export function parseMpesaStatement(fileContent) {
  try {
    // Handle both string content and file objects
    let content = fileContent;
    
    if (fileContent instanceof File) {
      throw new Error('Please pass file content as text, not File object. Use FileReader.');
    }

    if (typeof content !== 'string') {
      throw new Error('File content must be a string');
    }

    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const transactions = [];

    // Skip header rows and parse data rows
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and common header patterns
      if (!line || 
          line.toLowerCase().includes('date') || 
          line.toLowerCase().includes('transaction') ||
          line.startsWith('=')) {
        continue;
      }

      try {
        const transaction = parseMpesaLine(line);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (err) {
        console.warn(`Could not parse line ${i + 1}: ${line}`, err.message);
      }
    }

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in file');
    }

    return transactions;
  } catch (error) {
    throw new Error(`Failed to parse M-Pesa statement: ${error.message}`);
  }
}

/**
 * Parse individual M-Pesa transaction line
 * Handles multiple M-Pesa statement formats
 */
function parseMpesaLine(line) {
  // Format 1: Date,Time,Type,Amount,Recipient/Sender,Status
  // Example: 15/01/2024,14:30:45,Sent,1000.00,0712345678,Success
  
  const csvPattern = /^([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]*)$/;
  const csvMatch = line.match(csvPattern);
  
  if (csvMatch) {
    const [, date, time, type, amount, recipient, status] = csvMatch;
    return {
      date: date.trim(),
      time: time.trim(),
      type: type.trim(),
      amount: parseFloat(amount.trim()),
      recipient: recipient.trim(),
      status: status.trim() || 'Success',
      reference: `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  // Format 2: Space or tab separated
  // Example: 15/01/2024 14:30:45 Sent 1000.00 0712345678
  const spacePattern = /^(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2}:\d{2})\s+(\w+)\s+([\d,.]+)\s+(.+)$/;
  const spaceMatch = line.match(spacePattern);
  
  if (spaceMatch) {
    const [, date, time, type, amount, recipient] = spaceMatch;
    return {
      date,
      time,
      type: type.trim(),
      amount: parseFloat(amount.replace(/,/g, '')),
      recipient: recipient.trim(),
      status: 'Success',
      reference: `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  // Format 3: M-Pesa SMS format (single line with key-value pairs)
  // Example: Confirmed.You have received KES 1,000.00 from 0712345678 John on 15/1/24 at 14:30
  if (line.toLowerCase().includes('you have received') || 
      line.toLowerCase().includes('you sent') ||
      line.toLowerCase().includes('withdrawal')) {
    
    return parseMpesaSmsFormat(line);
  }

  return null;
}

/**
 * Parse M-Pesa SMS format statements
 */
function parseMpesaSmsFormat(line) {
  const amountMatch = line.match(/KES[\s]?([\d,]+(?:\.\d{2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  let type = 'Unknown';
  if (line.toLowerCase().includes('received')) type = 'Received';
  if (line.toLowerCase().includes('sent')) type = 'Sent';
  if (line.toLowerCase().includes('withdrawal')) type = 'Withdrawal';
  if (line.toLowerCase().includes('deposit')) type = 'Deposit';

  const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  const timeMatch = line.match(/(\d{1,2}):(\d{2})/);

  let date = new Date().toLocaleDateString('en-GB'); // Default to today
  let time = '00:00:00';

  if (dateMatch && timeMatch) {
    const [, day, month, year, hour, minute] = [...dateMatch, ...timeMatch];
    const fullYear = year.length === 2 ? `20${year}` : year;
    date = `${day}/${month}/${fullYear}`;
    time = `${hour.padStart(2, '0')}:${minute}:00`;
  }

  // Extract recipient/sender phone number
  const phoneMatch = line.match(/\b(254|0)(\d{9})\b/);
  const recipient = phoneMatch ? phoneMatch[0] : 'Unknown';

  return {
    date,
    time,
    type,
    amount,
    recipient,
    status: 'Success',
    reference: `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rawLine: line,
  };
}

/**
 * Validate parsed transactions
 */
export function validateTransactions(transactions) {
  const errors = [];

  transactions.forEach((tx, index) => {
    if (!tx.date) errors.push(`Transaction ${index + 1}: Missing date`);
    if (!tx.type) errors.push(`Transaction ${index + 1}: Missing type`);
    if (!tx.amount || tx.amount <= 0) errors.push(`Transaction ${index + 1}: Invalid amount`);
    if (!tx.recipient) errors.push(`Transaction ${index + 1}: Missing recipient`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    count: transactions.length,
  };
}

/**
 * Format transactions for API submission
 */
export function formatTransactionsForApi(transactions) {
  return transactions.map(tx => ({
    date: tx.date,
    time: tx.time || '00:00:00',
    type: tx.type,
    amount: tx.amount,
    recipient: tx.recipient,
    reference: tx.reference || `MPESA-${Date.now()}`,
    status: tx.status || 'Success',
    notes: `Imported from M-Pesa statement - ${tx.rawLine || ''}`,
  }));
}