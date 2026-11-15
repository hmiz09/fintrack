import React, { useState } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';
import { CATEGORY_ICONS, CategoryIcon } from '../../constants/icons';
import { X, Plus, Trash2, Tag } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, deleteCategory } = useFinTrack();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('utensils');
  const [suggestionStr, setSuggestionStr] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const suggestions = suggestionStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addCategory({
      name: name.trim(),
      icon: selectedIcon,
      suggestions: suggestions.length > 0 ? suggestions : [name.trim()],
    });

    setName('');
    setSuggestionStr('');
    setIsAdding(false);
  };

  const iconKeys = Object.keys(CATEGORY_ICONS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-rose-100/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Expense Categories</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* New Category Form Toggle */}
          {isAdding ? (
            <form onSubmit={handleAdd} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Add New Category</h4>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Books, Gaming, Hobby"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[40px]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Pick Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {iconKeys.map((key) => {
                    const isSelected = selectedIcon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedIcon(key)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-xs scale-105'
                            : 'bg-white border border-rose-100 hover:bg-rose-50'
                        }`}
                      >
                        <CategoryIcon icon={key} className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">
                  Preset suggestions (comma separated)
                </label>
                <input
                  type="text"
                  value={suggestionStr}
                  onChange={(e) => setSuggestionStr(e.target.value)}
                  placeholder="e.g. Manga, Novel, Kindle"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[40px]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-white min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs min-h-[40px]"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Category</span>
            </button>
          )}

          {/* List of categories */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3 bg-white rounded-2xl border border-rose-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <CategoryIcon icon={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{cat.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {cat.suggestions.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>

                {categories.length > 3 && (
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100/60 bg-rose-50/20 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
