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
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    userName,
    setUserName,
    resetToZero,
    resetAllData,
    exportData,
    importData,
  } = useFinTrack();

  const [inputName, setInputName] = useState(userName);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmResetZero, setShowConfirmResetZero] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(inputName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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

          {/* Section 3: Storage & Backup */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Cara Kerja Penyimpanan
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
