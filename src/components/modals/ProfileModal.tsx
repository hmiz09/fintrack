import React, { useState, useRef } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';
import {
  X,
  User,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  Key,
  Radio,
  FileSpreadsheet,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
} from '../../services/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Tambah Transaksi Real-time
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

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "OK" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Sinkronisasi Massal Semua Transaksi
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
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: data.transactions.length })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Tes Koneksi Webhook
    if (data.action === "test_connection") {
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Connected!" })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "active", app: "FinTrack" })).setMimeType(ContentService.MimeType.JSON);
}

function getFirstEmptyRow(sheet) {
  var colA = sheet.getRange("A:A").getValues();
  for (var i = 1; i < colA.length; i++) {
    var val = colA[i][0];
    if (val === null || val === undefined || val.toString().trim() === "") {
      return i + 1;
    }
  }
  return sheet.getLastRow() + 1;
}

function formatToday() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd-MMM-yyyy");
}`;

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    userName,
    setUserName,
    resetToZero,
    resetAllData,
    exportData,
    importData,
    syncPin,
    syncStatus,
    connectSync,
    disconnectSync,
    triggerCloudSync,
    isSupabaseReady,
    sheetsWebhookUrl,
    setSheetsWebhookUrl,
    autoSyncSheets,
    setAutoSyncSheets,
    syncAllToSheets,
    testSheetsWebhook,
  } = useFinTrack();

  const [inputName, setInputName] = useState(userName);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Cloud Sync form state
  const [inputPin, setInputPin] = useState(syncPin || '');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);

  // Google Sheets state
  const [inputSheetsUrl, setInputSheetsUrl] = useState(sheetsWebhookUrl || '');
  const [sheetsFeedback, setSheetsFeedback] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  React.useEffect(() => {
    if (sheetsWebhookUrl) {
      setInputSheetsUrl(sheetsWebhookUrl);
    }
  }, [sheetsWebhookUrl]);

  const initialCfg = getSupabaseConfig();
  const [cfgUrl, setCfgUrl] = useState(initialCfg.url);
  const [cfgKey, setCfgKey] = useState(initialCfg.anonKey);
  const [cfgSavedMsg, setCfgSavedMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(inputName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleConnectPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;
    const res = await connectSync(inputPin);
    setPinFeedback(res.message);
    setTimeout(() => setPinFeedback(null), 3000);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(cfgUrl, cfgKey);
    setCfgSavedMsg(true);
    setTimeout(() => setCfgSavedMsg(false), 2500);
    window.location.reload();
  };

  const handleTriggerManualSync = async () => {
    setPinFeedback('Menyinkronkan data...');
    await triggerCloudSync();
    setPinFeedback('Sinkronisasi selesai!');
    setTimeout(() => setPinFeedback(null), 2000);
  };

  const handleSaveSheetsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setSheetsWebhookUrl(inputSheetsUrl);
    setSheetsFeedback('URL Webhook Google Sheets berhasil disimpan!');
    setTimeout(() => setSheetsFeedback(null), 3000);
  };

  const handleTestSheets = async () => {
    if (!inputSheetsUrl.trim()) {
      setSheetsFeedback('Harap masukkan URL Webhook terlebih dahulu.');
      setTimeout(() => setSheetsFeedback(null), 3000);
      return;
    }
    setSheetsWebhookUrl(inputSheetsUrl);
    setIsTesting(true);
    setSheetsFeedback('Menguji koneksi ke Google Sheets...');
    const res = await testSheetsWebhook();
    setSheetsFeedback(res.message);
    setIsTesting(false);
    setTimeout(() => setSheetsFeedback(null), 4000);
  };

  const handleBulkSyncSheets = async () => {
    if (!inputSheetsUrl.trim()) {
      setSheetsFeedback('Harap masukkan dan simpan URL Webhook terlebih dahulu.');
      setTimeout(() => setSheetsFeedback(null), 3000);
      return;
    }
    setSheetsWebhookUrl(inputSheetsUrl);
    setIsBulkSyncing(true);
    setSheetsFeedback('Mengirim seluruh data transaksi ke Google Sheets...');
    const res = await syncAllToSheets();
    setSheetsFeedback(res.message);
    setIsBulkSyncing(false);
    setTimeout(() => setSheetsFeedback(null), 4000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleConfirmResetZero = () => {
    resetToZero();
    setShowConfirmResetZero(false);
    onClose();
  };

  const handleConfirmResetDemo = () => {
    resetAllData();
    setShowConfirmDemo(false);
    setInputName('Rose');
    onClose();
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `fintrack-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const success = importData(content);
        if (success) {
          setImportStatus('Data backup berhasil dipulihkan!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Format file backup tidak valid.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const avatarInitial = inputName.trim() ? inputName.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        className="w-full max-w-md bg-[#fffafb] rounded-t-3xl sm:rounded-3xl border-t sm:border border-rose-200/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Profil & Pengaturan</h2>
              <p className="text-[11px] text-slate-500">Kelola akun, data, dan cadangan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Section 1: Edit Name */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              1. Nama Pengguna
            </h3>
            <form onSubmit={handleSaveName} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-300 p-0.5 shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-rose-600 font-bold text-lg">
                    {avatarInitial}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="user-name-input" className="block text-[11px] text-slate-500 font-medium mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    id="user-name-input"
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Contoh: Rose, Alya, Ayang..."
                    maxLength={24}
                    className="w-full px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  {saveSuccess && (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Nama berhasil disimpan!</span>
                    </>
                  )}
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all min-h-[40px]"
                >
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Reset Data */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              2. Mulai dari Nol (Reset)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Kosongkan semua transaksi dummy, riwayat belanja, dan saham/emas untuk mencatat keuangan aslimu dari awal.
            </p>

            {showConfirmResetZero ? (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-900 font-semibold leading-snug">
                    Yakin ingin mengosongkan semua data transaksi, saldo kas, dan aset menjadi Rp 0?
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmResetZero}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all min-h-[40px] flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Kosongkan Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmResetZero(false)}
                    className="px-3 py-2 bg-white border border-rose-200 text-slate-700 text-xs font-medium rounded-xl hover:bg-rose-50/50 transition-colors min-h-[40px]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmResetZero(true)}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[42px]"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Reset Semua ke Rp 0 (Mulai Bersih)</span>
              </button>
            )}

            {/* Restore Demo Data Option */}
            <div className="mt-3 pt-3 border-t border-rose-100">
              {showConfirmDemo ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-xs text-amber-900 font-semibold">
                    Muat ulang data contoh (demo Rose)? Transaksi yang ada akan ditimpa.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmResetDemo}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl"
                    >
                      Muat Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDemo(false)}
                      className="px-3 py-1.5 bg-white border border-amber-200 text-slate-700 text-xs rounded-xl"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDemo(true)}
                  className="w-full text-[11px] text-slate-500 hover:text-slate-700 py-1 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Muat Ulang Data Contoh Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Cloud Sync */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Sinkronisasi Antar Perangkat (Cloud Sync)
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  syncPin && syncStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : syncPin && syncStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {syncPin && syncStatus === 'connected' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Terhubung</span>
                  </>
                ) : syncPin && syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Menyinkronkan</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-2.5 h-2.5" />
                    <span>Belum Aktif</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hubungkan iPhone pacarmu dan laptopmu secara otomatis menggunakan satu PIN rahasia berdua. Cukup masukkan sekali, seterusnya langsung sinkron real-time.
            </p>

            {/* If Supabase is not yet configured, show quick config setup */}
            {!isSupabaseReady ? (
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-900">
                      Koneksikan Database Supabase (Gratis)
                    </p>
                    <p className="text-[11px] text-rose-800/80 mt-0.5 leading-snug">
                      Hanya butuh 1 akun Supabase gratis untuk menyimpan data bersama. Masukkan URL & Anon Key di bawah ini:
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={cfgUrl}
                      onChange={(e) => setCfgUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      Supabase Anon Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={cfgKey}
                      onChange={(e) => setCfgKey(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {cfgSavedMsg && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersimpan! Memuat ulang...</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition-all"
                    >
                      Simpan Kredensial
                    </button>
                  </div>
                </form>
              </div>
            ) : syncPin ? (
              /* Already Connected */
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        PIN Aktif: <span className="uppercase text-rose-600 font-mono text-sm">{syncPin}</span>
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Sinkronisasi otomatis aktif secara real-time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTriggerManualSync}
                    className="flex-1 py-2 px-3 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[38px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sync Manual</span>
                  </button>
                  <button
                    type="button"
                    onClick={disconnectSync}
                    className="py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all active:scale-95 min-h-[38px]"
                  >
                    Putuskan
                  </button>
                </div>
              </div>
            ) : (
              /* Ready to Connect with PIN */
              <form onSubmit={handleConnectPin} className="space-y-3">
                <div>
                  <label htmlFor="sync-pin-input" className="block text-[11px] text-slate-500 font-medium mb-1">
                    Buat atau Masukkan PIN Rahasia Berdua
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="sync-pin-input"
                      type="text"
                      value={inputPin}
                      onChange={(e) => setInputPin(e.target.value.toUpperCase())}
                      placeholder="Contoh: ROSE-HARIS atau 123456"
                      maxLength={20}
                      className="w-full pl-9 pr-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfigForm(!showConfigForm)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                  >
                    {showConfigForm ? 'Tutup Pengaturan API' : 'Ubah URL Supabase'}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all min-h-[40px] flex items-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Hubungkan</span>
                  </button>
                </div>

                {/* Optional edit Supabase config */}
                {showConfigForm && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                    <input
                      type="url"
                      placeholder="Supabase URL"
                      value={cfgUrl}
                      onChange={(e) => setCfgUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Supabase Anon Key"
                      value={cfgKey}
                      onChange={(e) => setCfgKey(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSupabaseConfig}
                      className="w-full py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg"
                    >
                      Perbarui Kredensial
                    </button>
                  </div>
                )}
              </form>
            )}

            {pinFeedback && (
              <p className="text-center text-xs font-semibold text-rose-600 mt-1 animate-in fade-in">
                {pinFeedback}
              </p>
            )}
          </div>

          {/* Section 4: Google Sheets Integration */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Terhubung ke Google Spreadsheet
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  sheetsWebhookUrl
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {sheetsWebhookUrl ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Terhubung</span>
                  </>
                ) : (
                  <>
                    <span>Belum Diatur</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Catatan transaksi di FinTrack bisa otomatis masuk ke baris baru Google Sheets pacarmu (tab <strong>Daily Expenses</strong> atau <strong>Income</strong>) secara real-time.
            </p>

            <form onSubmit={handleSaveSheetsUrl} className="space-y-3">
              <div>
                <label htmlFor="sheets-url-input" className="block text-[11px] text-slate-500 font-medium mb-1">
                  URL Webhook Apps Script
                </label>
                <input
                  id="sheets-url-input"
                  type="url"
                  value={inputSheetsUrl}
                  onChange={(e) => setInputSheetsUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                />
              </div>

              {/* Auto Sync Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSyncSheets}
                  onChange={(e) => setAutoSyncSheets(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 border-rose-300 focus:ring-rose-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Kirim otomatis ke Sheets setiap mencatat transaksi baru
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xs transition-all min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan URL</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestSheets}
                  disabled={isTesting || !inputSheetsUrl.trim()}
                  className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all active:scale-95 min-h-[40px] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji...' : 'Test Koneksi'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkSyncSheets}
                  disabled={isBulkSyncing || !sheetsWebhookUrl}
                  className="flex-1 px-3 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all active:scale-95 min-h-[40px] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin' : ''}`} />
                  <span>{isBulkSyncing ? 'Mengirim...' : 'Kirim Semua'}</span>
                </button>
              </div>
            </form>

            {sheetsFeedback && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs font-semibold text-rose-700 animate-in fade-in">
                {sheetsFeedback}
              </div>
            )}

            {/* Accordion: Cara Pasang Script di Google Sheets */}
            <div className="pt-1 border-t border-rose-100">
              <button
                type="button"
                onClick={() => setShowScriptGuide(!showScriptGuide)}
                className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-rose-600 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cara Pasang di Google Sheets (1 Menit)</span>
                </span>
                {showScriptGuide ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showScriptGuide && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 mt-1 text-xs text-slate-600 animate-in fade-in">
                  <ol className="space-y-2 list-decimal list-inside leading-relaxed text-[11px]">
                    <li>
                      Buka spreadsheet pacarmu di laptop/PC.
                    </li>
                    <li>
                      Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </li>
                    <li>
                      Hapus teks yang ada di editor, lalu tempel kode script di bawah ini.
                    </li>
                    <li>
                      Klik tombol biru <strong>Terapkan (Deploy)</strong> di kanan atas &gt; <strong>Penerapan baru (New deployment)</strong>.
                    </li>
                    <li>
                      Pilih jenis <strong>Aplikasi web (Web app)</strong>. Ubah "Yang memiliki akses (Who has access)" ke <strong>Siapa saja (Anyone)</strong>, lalu klik <strong>Terapkan</strong>.
                    </li>
                    <li>
                      Salin <strong>URL Aplikasi Web</strong> yang muncul, lalu tempel ke kolom di atas. Selesai!
                    </li>
                  </ol>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
                    >
                      {copiedScript ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kode Script Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Kode Script (1 Klik)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Storage & Backup */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                5. Cara Kerja Penyimpanan
              </h3>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Database className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Tersimpan di Browser (Local Storage):</strong> Data transaksi, kartu kredit, dan asetmu otomatis disimpan ke penyimpanan memori browser di HP/laptop ini. Tidak akan hilang saat tab ditutup atau HP di-restart.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong className="text-emerald-950">100% Privat & Aman:</strong> Tidak ada server database yang menyimpan atau mengintip data keuanganmu. Data sepenuhnya milikmu di perangkat ini.
                </div>
              </div>
            </div>

            {/* Backup & Restore Controls */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-500 mb-2 font-medium">
                Cadangan Data (Backup):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>Download Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-white hover:bg-rose-50/50 text-slate-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[42px]"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pulihkan (Import)</span>
                </button>
              </div>

              {/* Hidden file input for restore */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              {importStatus && (
                <p className="text-center text-xs font-semibold text-rose-600 mt-2 animate-in fade-in">
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
