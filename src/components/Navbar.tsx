import React from 'react';
import {
  Search,
  BookOpen,
  Heart,
  Info,
  Compass,
  MessageSquare,
  Moon,
  Sun,
  Sparkles,
  Bot,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'quiz' | 'catalog' | 'academy' | 'saved' | 'about' | 'admin';
  setActiveTab: (tab: 'chat' | 'quiz' | 'catalog' | 'academy' | 'saved' | 'about' | 'admin') => void;
  savedCount: number;
  theme: 'cream' | 'noir';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf7]/98 dark:bg-[#0b0b0d]/98 backdrop-blur-md border-b border-[#1a1a1a]/10 dark:border-[#c5a059]/25 text-[#1a1a1a] dark:text-[#f4f4f5] shadow-xs transition-colors duration-300">
      {/* Top Ticker / Brand Subtitle */}
      <div className="bg-[#f5f0e8] dark:bg-[#141418] border-b border-[#1a1a1a]/5 dark:border-[#c5a059]/10 py-1 px-3 sm:px-6 text-[11px] font-light text-[#555] dark:text-[#a1a1aa]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="font-serif italic text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold truncate">
              Giobot Asesor IA
            </span>
            <span className="hidden sm:inline text-[#888] dark:text-[#666]">•</span>
            <span className="hidden sm:inline truncate">Asesoría de Fragancias Personalizada</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">
              100% Originales
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2">
          {/* Logo & Brand Name */}
          <div
            onClick={() => setActiveTab('chat')}
            className="cursor-pointer group flex items-center gap-2 sm:gap-2.5 min-w-0"
            role="button"
            tabIndex={0}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#1a1a1a] dark:border-[#c5a059] bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
            </div>
            <div className="min-w-0">
              <span className="uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[8px] sm:text-[9px] font-bold text-[#c5a059] block whitespace-nowrap">
                Perfumería & Asesoría IA
              </span>
              <h1 className="text-[1.05rem] xs:text-lg sm:text-2xl font-serif italic leading-tight text-[#1a1a1a] dark:text-[#f4f4f5] whitespace-nowrap tracking-tight sm:tracking-normal">
                Gio te perfumo
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-[11px] uppercase tracking-widest font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'text-[#1a1a1a] dark:text-[#f4f4f5] border-b-2 border-[#c5a059] font-bold'
                  : 'text-[#1a1a1a]/70 dark:text-[#a1a1aa] hover:text-[#c5a059]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Giobot</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'text-[#1a1a1a] dark:text-[#f4f4f5] border-b-2 border-[#c5a059] font-bold'
                  : 'text-[#1a1a1a]/70 dark:text-[#a1a1aa] hover:text-[#c5a059]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`pb-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'text-[#1a1a1a] dark:text-[#f4f4f5] border-b-2 border-[#c5a059] font-bold'
                  : 'text-[#1a1a1a]/70 dark:text-[#a1a1aa] hover:text-[#c5a059]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Test Olfativo</span>
            </button>

            <button
              onClick={() => setActiveTab('academy')}
              className={`pb-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'academy'
                  ? 'text-[#1a1a1a] dark:text-[#f4f4f5] border-b-2 border-[#c5a059] font-bold'
                  : 'text-[#1a1a1a]/70 dark:text-[#a1a1aa] hover:text-[#c5a059]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Academia</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`pb-1 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'about'
                  ? 'text-[#1a1a1a] dark:text-[#f4f4f5] border-b-2 border-[#c5a059] font-bold'
                  : 'text-[#1a1a1a]/70 dark:text-[#a1a1aa] hover:text-[#c5a059]'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Nosotros</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'cream' ? 'Modo Noir' : 'Modo Cream'}
              aria-label="Cambiar tema"
              className="p-2 sm:px-2.5 sm:py-2 border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 hover:border-[#1a1a1a] dark:hover:border-[#c5a059] transition-all text-xs text-[#1a1a1a] dark:text-[#f4f4f5] bg-[#f5f0e8] dark:bg-[#141418] flex items-center justify-center min-h-[38px] min-w-[38px]"
            >
              {theme === 'cream' ? (
                <Moon className="w-4 h-4 text-[#c5a059]" />
              ) : (
                <Sun className="w-4 h-4 text-[#c5a059]" />
              )}
            </button>

            {/* Mi Armario */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-2 border transition-all text-xs font-semibold uppercase tracking-wider min-h-[38px] ${
                activeTab === 'saved'
                  ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059]'
                  : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/15 dark:border-[#c5a059]/30 hover:border-[#1a1a1a]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'fill-[#c5a059] text-[#c5a059]' : ''}`} />
              <span className="text-[11px] whitespace-nowrap">Mi Armario</span>
              {savedCount > 0 && (
                <span className="bg-[#c5a059] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#c5a059] font-bold text-[10px] px-1.5 py-0.5 leading-none">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar (Mobile-First touch-friendly) */}
        <nav className="flex md:hidden items-center py-2 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 overflow-x-auto no-scrollbar scroll-smooth gap-1.5 text-[11px] uppercase tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 whitespace-nowrap border transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
              activeTab === 'chat'
                ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059] font-bold shadow-xs'
                : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/10 dark:border-[#c5a059]/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059] dark:text-[#1a1a1a]" />
            <span>Giobot</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 whitespace-nowrap border transition-all min-h-[40px] shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059] font-bold shadow-xs'
                : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/10 dark:border-[#c5a059]/20'
            }`}
          >
            <span>Catálogo</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 whitespace-nowrap border transition-all min-h-[40px] shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059] font-bold shadow-xs'
                : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/10 dark:border-[#c5a059]/20'
            }`}
          >
            <span>Test Olfativo</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`px-3.5 py-2 whitespace-nowrap border transition-all min-h-[40px] shrink-0 ${
              activeTab === 'academy'
                ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059] font-bold shadow-xs'
                : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/10 dark:border-[#c5a059]/20'
            }`}
          >
            <span>Academia</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2 whitespace-nowrap border transition-all min-h-[40px] shrink-0 ${
              activeTab === 'about'
                ? 'bg-[#1a1a1a] dark:bg-[#c5a059] text-[#fcfaf7] dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-[#c5a059] font-bold shadow-xs'
                : 'bg-[#f5f0e8] dark:bg-[#141418] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/10 dark:border-[#c5a059]/20'
            }`}
          >
            <span>Nosotros</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
