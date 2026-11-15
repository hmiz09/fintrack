import React, { useState, useEffect } from 'react';
import { useFinTrack, getTxCcHold } from '../../context/FinTrackContext';
import { CategoryIcon } from '../../constants/icons';
import { formatDots, formatIDR } from '../../utils/formatters';
import type { Transaction, PaymentMethod, CcMode } from '../../types';
import { X, Trash2, CreditCard, Wallet, Calculator } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTx: Transaction | null;
  onOpenCategories: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editingTx,
  onOpenCategories,
}) => {
  const { categories, addTransaction, updateTransaction, deleteTransaction, metrics } =
    useFinTrack();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [ccMode, setCcMode] = useState<CcMode>('full');
  const [tenor, setTenor] = useState(6);
  const [keypadOpen, setKeypadOpen] = useState(true);

  // Keypad Calculator State
  const [amountStr, setAmountStr] = useState('0');
  const [leftVal, setLeftVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [enteringNew, setEnteringNew] = useState(false);
  const [lastExpr, setLastExpr] = useState('');

  useEffect(() => {
    if (editingTx) {
      setTitle(editingTx.title);
      setCategory(editingTx.category);
      setMethod(editingTx.method);
      setCcMode(editingTx.ccMode || 'full');
      setTenor(editingTx.tenor || 6);
      setAmountStr(String(Math.round(editingTx.amount)));
      setLeftVal(null);
      setOp(null);
      setEnteringNew(false);
      setLastExpr('');
    } else {
      setTitle('');
      setCategory(categories[0]?.name || 'Food & Dining');
      setMethod('cash');
      setCcMode('full');
      setTenor(6);
      setAmountStr('0');
      setLeftVal(null);
      setOp(null);
      setEnteringNew(false);
      setLastExpr('');
    }
  }, [editingTx, isOpen, categories]);

  if (!isOpen) return null;

  const formatCalcOperand = (num: number) => {
    const val = Math.round(Number(num) || 0);
    return (val < 0 ? '-' : '') + formatDots(Math.abs(val));
  };

  const getCalcResult = () => {
    const rightVal = parseInt(amountStr, 10) || 0;
    if (op && leftVal !== null) {
      const leftText = formatCalcOperand(leftVal);
      const exprText = enteringNew
        ? `${leftText} ${op}`
        : `${leftText} ${op} ${formatCalcOperand(rightVal)}`;
      const amount = enteringNew
        ? leftVal
        : op === '+'
        ? leftVal + rightVal
        : leftVal - rightVal;
      return { amount, exprText };
    }
    return {
      amount: rightVal,
      exprText: lastExpr || '',
    };
  };

  const { amount, exprText } = getCalcResult();

  const pressKey = (k: string) => {
    if (k === 'C') {
      setLeftVal(null);
      setOp(null);
      setAmountStr('0');
      setEnteringNew(false);
      setLastExpr('');
    } else if (k === 'Del') {
      if (op && (enteringNew || amountStr === '0')) {
        setAmountStr(String(leftVal));
        setLeftVal(null);
        setOp(null);
        setEnteringNew(false);
      } else {
        setEnteringNew(false);
        setLastExpr('');
        const isSingleSigned = amountStr.startsWith('-') && amountStr.length <= 2;
        setAmountStr(amountStr.length <= 1 || isSingleSigned ? '0' : amountStr.slice(0, -1));
      }
    } else if (k === '+' || k === '-') {
      const rightVal = parseInt(amountStr, 10) || 0;
      if (op && leftVal !== null) {
        if (!enteringNew) {
          setLeftVal(op === '+' ? leftVal + rightVal : leftVal - rightVal);
        }
      } else {
        setLeftVal(rightVal);
      }
      setOp(k);
      setAmountStr('0');
      setEnteringNew(true);
      setLastExpr('');
    } else if (k === '=') {
      if (op && leftVal !== null) {
        if (enteringNew) {
          setAmountStr(String(leftVal));
          setLastExpr('');
        } else {
          const rightVal = parseInt(amountStr, 10) || 0;
          const res = op === '+' ? leftVal + rightVal : leftVal - rightVal;
          setLastExpr(
            `${formatCalcOperand(leftVal)} ${op} ${formatCalcOperand(rightVal)} =`
          );
          setAmountStr(String(res));
        }
        setLeftVal(null);
        setOp(null);
        setEnteringNew(true);
      }
    } else {
      if (enteringNew || amountStr === '0') {
        setAmountStr(k === '0' || k === '000' ? '0' : k);
        setEnteringNew(false);
        setLastExpr('');
      } else {
        const digitsLen = amountStr.replace('-', '').length;
        if (digitsLen < 10) {
          setAmountStr((prev) => prev + k.slice(0, 10 - digitsLen));
        }
      }
    }
  };

  const handleSave = () => {
    if (amount <= 0) return;

    const chosenTitle = title.trim() || category;
    if (editingTx) {
      updateTransaction({
        ...editingTx,
        title: chosenTitle,
        category,
        amount,
        method,
        ccMode: method === 'cc' ? ccMode : undefined,
        tenor: method === 'cc' && ccMode === 'installment' ? tenor : 1,
      });
    } else {
      addTransaction({
        title: chosenTitle,
        category,
        amount,
        date: 'Today',
        weekIdx: 3,
        method,
        ccMode: method === 'cc' ? ccMode : undefined,
        tenor: method === 'cc' && ccMode === 'installment' ? tenor : 1,
        installmentPaidCount: 0,
        paidThisMonth: false,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingTx) {
      deleteTransaction(editingTx.id);
      onClose();
    }
  };

  const activeCatObj = categories.find((c) => c.name === category) || categories[0];
  const suggestions = activeCatObj?.suggestions || ['Lunch', 'Coffee', 'Essentials'];

  const monthlyAmt =
    method === 'cc' && ccMode === 'installment' ? Math.round(amount / tenor) : amount;
  const freedLimit = editingTx ? getTxCcHold(editingTx) : 0;
  const availAfter = Math.max(0, metrics.ccAvailableLimit + freedLimit - amount);

  const calcKeys = [
    { key: '7', label: '7', fn: false },
    { key: '8', label: '8', fn: false },
    { key: '9', label: '9', fn: false },
    { key: 'Del', label: '⌫', fn: true },
    { key: '4', label: '4', fn: false },
    { key: '5', label: '5', fn: false },
    { key: '6', label: '6', fn: false },
    { key: '-', label: '−', op: true },
    { key: '1', label: '1', fn: false },
    { key: '2', label: '2', fn: false },
    { key: '3', label: '3', fn: false },
    { key: '+', label: '+', op: true },
    { key: 'C', label: 'C', fn: true },
    { key: '0', label: '0', fn: false },
    { key: '000', label: '000', fn: false },
    { key: '=', label: '=', eq: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-800">
            {editingTx ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Amount Display (Tap to open/close keypad) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setKeypadOpen(true)}
          className="text-center py-2 cursor-pointer select-none"
        >
          <span className="block min-h-[16px] text-xs font-semibold text-rose-600 tabular-nums">
            {exprText}
          </span>
          <span className="block text-3xl font-black text-slate-800 tabular-nums tracking-tight">
            {formatIDR(amount)}
          </span>
        </div>

        {/* Category Selector */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Category
            </span>
            <button
              type="button"
              onClick={onOpenCategories}
              className="text-xs font-bold text-rose-600 hover:underline min-h-[32px] px-1"
            >
              Manage
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const active = category === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all min-h-[36px] ${
                    active
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'bg-rose-50/60 text-slate-700 hover:bg-rose-100'
                  }`}
                >
                  <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note / Title Input & Suggestions */}
        <div className="mt-3 space-y-1.5">
          <div className="h-11 rounded-2xl border border-rose-200/80 px-3 flex items-center gap-2 bg-rose-50/30 focus-within:border-rose-500 focus-within:bg-white transition-colors">
            <span className="text-xs text-slate-400 font-medium shrink-0">Note:</span>
            <input
              type="text"
              value={title}
              onFocus={() => setKeypadOpen(false)}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={suggestions[0] || 'Transaction note'}
              className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.slice(0, 4).map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setTitle(sug)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shrink-0 min-h-[30px]"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`py-2 text-xs font-bold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                method === 'cash'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Cash / Bank</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('cc')}
              className={`py-2 text-xs font-bold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
                method === 'cc'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Credit Card</span>
            </button>
          </div>

          {method === 'cc' && (
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 6, 12].map((tn) => {
                  const active =
                    tn === 1 ? ccMode === 'full' : ccMode === 'installment' && tenor === tn;
                  return (
                    <button
                      key={tn}
                      type="button"
                      onClick={() => {
                        if (tn === 1) {
                          setCcMode('full');
                          setTenor(1);
                        } else {
                          setCcMode('installment');
                          setTenor(tn);
                        }
                      }}
                      className={`py-1.5 text-xs font-bold rounded-xl transition-all min-h-[36px] ${
                        active
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-rose-200/60 hover:bg-rose-100'
                      }`}
                    >
                      {tn === 1 ? 'Full' : `${tn} mo`}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  Bill:{' '}
                  <strong className="text-slate-800">
                    {formatIDR(monthlyAmt)}
                    {ccMode === 'installment' ? '/mo' : ''}
                  </strong>
                </span>
                <span>
                  Limit left: <strong className="text-rose-600">{formatIDR(availAfter)}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4x4 Calculator Keypad */}
        {keypadOpen ? (
          <div className="mt-4 grid grid-cols-4 gap-2 select-none">
            {calcKeys.map((k) => {
              const isOpActive = op === k.key;
              return (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => pressKey(k.key)}
                  className={`h-11 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
                    k.eq
                      ? op
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-rose-100 text-rose-800'
                      : k.op
                      ? isOpActive
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : k.fn
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-rose-50/50 border border-rose-100 text-slate-800 hover:bg-rose-100'
                  }`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setKeypadOpen(true)}
            className="mt-3 w-full py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-200/70 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
          >
            <Calculator className="w-4 h-4" />
            <span>Show Calculator Keypad</span>
          </button>
        )}

        {/* Actions (Save & Delete) */}
        <div className="mt-4 flex items-center gap-2">
          {editingTx && (
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 px-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={amount <= 0}
            className={`flex-1 h-12 rounded-2xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center min-h-[44px] ${
              amount > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {amount > 0
              ? `${editingTx ? 'Update' : 'Save'} Transaction (${formatIDR(amount)})`
              : 'Enter Amount'}
          </button>
        </div>
      </div>
    </div>
  );
};
