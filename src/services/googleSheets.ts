import type { Transaction } from '../types';

export interface SheetsSyncResult {
  success: boolean;
  message: string;
  count?: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const formatSheetsDate = (dateStr?: string): string => {
  const now = new Date();
  if (!dateStr || dateStr.toLowerCase() === 'today' || dateStr.toLowerCase() === 'hari ini') {
    const d = String(now.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[now.getMonth()];
    const y = now.getFullYear();
    return `${d}-${m}-${y}`;
  }

  // Format DD-MMM-YYYY e.g. 17-Nov-2026
  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[parsed.getMonth()];
    const y = parsed.getFullYear();
    return `${d}-${m}-${y}`;
  }

  const d = String(now.getDate()).padStart(2, '0');
  const m = MONTH_NAMES[now.getMonth()];
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};

export const sendTransactionToSheets = async (
  webhookUrl: string,
  tx: Transaction,
  type: 'expense' | 'income' = 'expense'
): Promise<boolean> => {
  const trimmedUrl = webhookUrl.trim();
  if (!trimmedUrl || !trimmedUrl.startsWith('http')) return false;

  try {
    const payload = {
      action: 'add_transaction',
      type,
      transaction: {
        id: tx.id,
        date: formatSheetsDate(tx.date),
        title: tx.title,
        category: tx.category,
        amount: Math.round(tx.amount),
        method: tx.method === 'cc' ? 'CC Blibli' : 'Cash',
        note: tx.method === 'cc' && tx.ccMode === 'installment'
          ? `Cicilan ${tx.tenor} bulan`
          : '',
      },
    };

    // Google Apps Script endpoint: text/plain avoids CORS preflight error
    await fetch(trimmedUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return true;
  } catch (err) {
    console.warn('Gagal mengirim ke Google Sheets:', err);
    return false;
  }
};

export const sendBulkTransactionsToSheets = async (
  webhookUrl: string,
  transactions: Transaction[]
): Promise<SheetsSyncResult> => {
  const trimmedUrl = webhookUrl.trim();
  if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
    return { success: false, message: 'URL Webhook Google Sheets belum diisi.' };
  }

  if (transactions.length === 0) {
    return { success: true, count: 0, message: 'Tidak ada transaksi untuk dikirim.' };
  }

  try {
    const formattedList = transactions.map((tx) => ({
      id: tx.id,
      date: formatSheetsDate(tx.date),
      title: tx.title,
      category: tx.category,
      amount: Math.round(tx.amount),
      method: tx.method === 'cc' ? 'CC Blibli' : 'Cash',
      note: tx.method === 'cc' && tx.ccMode === 'installment'
        ? `Cicilan ${tx.tenor} bulan`
        : '',
    }));

    const payload = {
      action: 'bulk_sync_expenses',
      transactions: formattedList,
    };

    await fetch(trimmedUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      count: transactions.length,
      message: `${transactions.length} transaksi berhasil dikirim ke Google Sheets!`,
    };
  } catch (err) {
    console.error('Gagal mengirim massal ke Google Sheets:', err);
    return {
      success: false,
      message: 'Gagal mengirim ke Google Sheets. Periksa URL script atau koneksi internet.',
    };
  }
};

export const testSheetsConnection = async (webhookUrl: string): Promise<SheetsSyncResult> => {
  const trimmedUrl = webhookUrl.trim();
  if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
    return { success: false, message: 'URL Webhook Google Sheets tidak valid.' };
  }

  try {
    const payload = {
      action: 'test_connection',
      timestamp: new Date().toISOString(),
    };

    await fetch(trimmedUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Koneksi ke Google Sheets berhasil! Transaksi siap dicatat.',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menghubungi Google Sheets. Periksa URL deployment script.',
    };
  }
};
