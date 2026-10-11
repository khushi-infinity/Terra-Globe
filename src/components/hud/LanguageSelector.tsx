import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, SupportedLanguage } from '../../i18n/useTranslation';
import { Globe, Check, ChevronDown, Search, X } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { language, setLanguage, currentLanguageInfo, supportedLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilterQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setFilterQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredLanguages = supportedLanguages.filter((item) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nativeName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    setFilterQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 border bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10 hover:border-white/20 active:scale-95 shadow-sm"
        title={t('nav.change_language')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentLanguageInfo.flag}</span>
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-wide">
          {currentLanguageInfo.nativeName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Animated Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('nav.select_language')}
          className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-64 max-w-[90vw] rounded-2xl border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-2xl bg-[#090d16]/98 text-white animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                {t('nav.select_language')}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setFilterQuery('');
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative mb-2 px-1">
            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-2 py-1.5 focus-within:border-emerald-500/80 focus-within:bg-white/10 transition-all">
              <Search className="w-3 h-3 text-slate-400 mr-1.5 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={t('nav.search_language')}
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching languages
              </div>
            ) : (
              filteredLanguages.map((langItem) => {
                const isSelected = langItem.code === language;
                return (
                  <button
                    key={langItem.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(langItem.code)}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'hover:bg-white/10 text-slate-200 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none flex-shrink-0">
                        {langItem.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-tight truncate">
                          {langItem.nativeName}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight truncate">
                          {langItem.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
