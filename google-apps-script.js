/**
 * ==============================================================================
 * FINTRACK -> GOOGLE SPREADSHEET SYNC WEBHOOK
 * ==============================================================================
 * Skrip ini menerima data transaksi otomatis dari aplikasi FinTrack dan
 * langsung menuliskannya ke baris baru sheet "Daily Expenses" atau "Income".
 *
 * CARA PASANG (HANYA 1 MENIT):
 * 1. Di Google Sheets pacarmu, klik menu: Ekstensi (Extensions) > Apps Script
 * 2. Hapus semua teks yang ada di jendela kode, lalu tempel (paste) seluruh kode ini.
 * 3. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Penerapan baru" (New deployment).
 * 4. Klik ikon roda gigi di kiri, pilih "Aplikasi web" (Web app).
 * 5. Konfigurasi:
 *    - Deskripsi: FinTrack Webhook
 *    - Jalankan sebagai: Saya (email pacarmu)
 *    - Yang memiliki akses: Siapa saja (Anyone)  <-- PENTING!
 * 6. Klik "Terapkan" (Deploy). Beri izin akses akun Google jika diminta.
 * 7. Salin URL Aplikasi Web (dimulai dengan https://script.google.com/macros/s/...)
 * 8. Tempelkan URL tersebut ke aplikasi FinTrack di Profil & Pengaturan > Google Sheets!
 * ==============================================================================
 */

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Tambah Transaksi Tunggal (Real-time saat tambah pengeluaran/pemasukan)
    if (data.action === "add_transaction") {
      var tx = data.transaction || {};
      var isIncome = data.type === "income";

      if (isIncome) {
        var sheetIncome = ss.getSheetByName("Income") || ss.getSheetByName("income");
        if (sheetIncome) {
          var rowIdx = getFirstEmptyRow(sheetIncome);
          sheetIncome.getRange(rowIdx, 1, 1, 5).setValues([[
            tx.date || formatToday(),
            tx.title || "Pemasukan",
            tx.category || "Umum",
            Number(tx.amount) || 0,
            tx.note || ""
          ]]);
        }
      } else {
        var sheetExp = ss.getSheetByName("Daily Expenses") || ss.getSheetByName("daily expenses") || ss.getSheetByName("transaksi");
        if (sheetExp) {
          var rowIdx = getFirstEmptyRow(sheetExp);
          var method = tx.method === "cc" ? (tx.cardName || "CC Blibli") : (tx.method || "Cash");
          sheetExp.getRange(rowIdx, 1, 1, 6).setValues([[
            tx.date || formatToday(),
            tx.title || "Pengeluaran",
            tx.category || "Lain-lain",
            method,
            Number(tx.amount) || 0,
            tx.note || ""
          ]]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Transaksi berhasil dicatat ke Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Sinkronisasi Massal (Bulk Sync semua transaksi FinTrack)
    if (data.action === "bulk_sync_expenses") {
      var sheetExp = ss.getSheetByName("Daily Expenses") || ss.getSheetByName("daily expenses") || ss.getSheetByName("transaksi");
      if (sheetExp && Array.isArray(data.transactions) && data.transactions.length > 0) {
        var startRow = getFirstEmptyRow(sheetExp);
        var rows = data.transactions.map(function(t) {
          var method = t.method === "cc" ? (t.cardName || "CC Blibli") : (t.method || "Cash");
          return [
            t.date || formatToday(),
            t.title || "Pengeluaran",
            t.category || "Lain-lain",
            method,
            Number(t.amount) || 0,
            t.note || ""
          ];
        });
        sheetExp.getRange(startRow, 1, rows.length, 6).setValues(rows);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: data.transactions ? data.transactions.length : 0
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Test Koneksi
    if (data.action === "test_connection") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Koneksi Google Sheets berhasil aktif!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Action tidak dikenal"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    name: "FinTrack Google Sheets Webhook",
    spreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Helper: Mencari baris kosong pertama di kolom A
function getFirstEmptyRow(sheet) {
  var colA = sheet.getRange("A:A").getValues();
  for (var i = 1; i < colA.length; i++) {
    var val = colA[i][0];
    if (val === null || val === undefined || val.toString().trim() === "") {
      return i + 1; // 1-based index baris di Google Sheets
    }
  }
  return sheet.getLastRow() + 1;
}

// Helper: Format tanggal standar DD-MMM-YYYY (contoh: 17-Nov-2026)
function formatToday() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd-MMM-yyyy");
}
