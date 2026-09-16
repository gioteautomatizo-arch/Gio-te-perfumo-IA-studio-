import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { GiobotChat } from './components/GiobotChat';
import { PerfumeCommerceActions } from './components/PerfumeCommerceActions';
import { Perfume } from './types';
import { PERFUMES_DATABASE } from './data/perfumes';
import { subscribeCatalog } from './lib/catalogService';

// Lazy-loaded components for optimal initial load speed
const QuizAdvisor = lazy(() =>
  import('./components/QuizAdvisor').then(m => ({ default: m.QuizAdvisor }))
);
const KnowledgeBase = lazy(() =>
  import('./components/KnowledgeBase').then(m => ({ default: m.KnowledgeBase }))
);
const Academy = lazy(() =>
  import('./components/Academy').then(m => ({ default: m.Academy }))
);
const SavedProfile = lazy(() =>
  import('./components/SavedProfile').then(m => ({ default: m.SavedProfile }))
);
const AboutGio = lazy(() =>
  import('./components/AboutGio').then(m => ({ default: m.AboutGio }))
);
const PerfumeDetailModal = lazy(() =>
  import('./components/PerfumeDetailModal').then(m => ({ default: m.PerfumeDetailModal }))
);
const AdminAccess = lazy(() =>
  import('./components/AdminAccess').then(m => ({ default: m.AdminAccess }))
);

const TabLoadingFallback = () => (
  <div className="max-w-4xl mx-auto p-12 text-center space-y-3 animate-fade-in flex flex-col items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
    <span className="text-xs uppercase tracking-[0.2em] font-serif italic text-[#c5a059] font-semibold">
      Cargando experiencia...
    </span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'catalog' | 'academy' | 'saved' | 'about' | 'admin'>('chat');
  const [theme, setTheme] = useState<'cream' | 'noir'>(() => {
    try {
      return (localStorage.getItem('gio_theme') as 'cream' | 'noir') || 'cream';
    } catch {
      return 'cream';
    }
  });

  const [savedPerfumes, setSavedPerfumes] = useState<Perfume[]>(() => {
    try {
      const stored = localStorage.getItem('gio_saved_perfumes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [modalPerfume, setModalPerfume] = useState<Perfume | null>(null);
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);
  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('gio_theme', theme);
    } catch (err) {
      console.error('LocalStorage theme error:', err);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('gio_saved_perfumes', JSON.stringify(savedPerfumes));
    } catch (err) {
      console.error('LocalStorage save error:', err);
    }
  }, [savedPerfumes]);

  useEffect(() => {
    const unsubscribe = subscribeCatalog(perfumes => {
      // Keep the original exported array reference so existing components and quiz logic
      // automatically consume the live Firestore catalog without a destructive rewrite.
      PERFUMES_DATABASE.splice(0, PERFUMES_DATABASE.length, ...perfumes);
      setCatalogVersion(version => version + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPerfumeId = params.get('perfume');
    if (!sharedPerfumeId) return;

    const sharedPerfume = PERFUMES_DATABASE.find(perfume => perfume.id === sharedPerfumeId);
    if (!sharedPerfume) return;

    setActiveTab('catalog');
    setModalPerfume(sharedPerfume);
  }, [catalogVersion]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'cream' ? 'noir' : 'cream'));
  };

  const handleToggleSave = (perfume: Perfume) => {
    setSavedPerfumes(prev => {
      const exists = prev.some(p => p.id === perfume.id);
      if (exists) {
        return prev.filter(p => p.id !== perfume.id);
      } else {
        return [...prev, perfume];
      }
    });
  };

  const handleConsultGiobotAboutPerfume = (perfume: Perfume) => {
    setInitialChatQuery(`Hola Giobot, me llama la atención el perfume ${perfume.brand} ${perfume.name}. ¿Me podrías explicar sus notas principales, para qué ocasiones me conviene y con qué personalidad encaja?`);
    setActiveTab('chat');
  };

  const handleConsultGiobotWithQuizSummary = (summary: string) => {
    setInitialChatQuery(summary);
    setActiveTab('chat');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#1a1a1a] transition-colors duration-300 ${
      theme === 'noir' ? 'dark bg-[#0b0b0d] text-[#f4f4f5]' : 'bg-[#fcfaf7] text-[#1a1a1a]'
    }`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPerfumes.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <GiobotChat
            key={`chat-${catalogVersion}`}
            onOpenDetail={setModalPerfume}
            onToggleSave={handleToggleSave}
            savedPerfumeIds={savedPerfumes.map(p => p.id)}
            onStartQuiz={() => setActiveTab('quiz')}
            initialQuery={initialChatQuery}
          />
        )}

        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === 'quiz' && (
            <QuizAdvisor
              key={`quiz-${catalogVersion}`}
              onOpenDetail={setModalPerfume}
              onToggleSave={handleToggleSave}
              savedPerfumeIds={savedPerfumes.map(p => p.id)}
              onConsultGiobotWithResults={handleConsultGiobotWithQuizSummary}
            />
          )}

          {activeTab === 'catalog' && (
            <KnowledgeBase
              key={`catalog-${catalogVersion}`}
              onOpenDetail={setModalPerfume}
              onToggleSave={handleToggleSave}
              savedPerfumeIds={savedPerfumes.map(p => p.id)}
              onConsultGiobot={handleConsultGiobotAboutPerfume}
            />
          )}

          {activeTab === 'academy' && <Academy />}

          {activeTab === 'saved' && (
            <SavedProfile
              savedPerfumes={savedPerfumes}
              onOpenDetail={setModalPerfume}
              onRemoveSave={handleToggleSave}
              onConsultGiobot={handleConsultGiobotAboutPerfume}
              onExploreCatalog={() => setActiveTab('catalog')}
            />
          )}

          {activeTab === 'about' && <AboutGio />}
          {activeTab === 'admin' && <AdminAccess />}

          {modalPerfume && (
            <>
              <PerfumeDetailModal
                perfume={modalPerfume}
                onClose={() => setModalPerfume(null)}
                onToggleSave={handleToggleSave}
                isSaved={savedPerfumes.some(p => p.id === modalPerfume.id)}
                onAskGiobotAbout={handleConsultGiobotAboutPerfume}
              />
              <PerfumeCommerceActions perfume={modalPerfume} />
            </>
          )}
        </Suspense>
      </main>

      <footer className="bg-[#f5f0e8] dark:bg-[#141418] border-t border-[#1a1a1a]/15 dark:border-[#c5a059]/20 py-6 text-center text-xs text-[#555] dark:text-[#a1a1aa] space-y-1 transition-colors duration-300">
        <div className="flex items-center justify-center gap-2 font-serif italic text-sm font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
          <span>Gio te perfumo</span>
          <span className="text-[#c5a059]">•</span>
          <span className="text-xs font-sans font-normal text-[#555] dark:text-[#a1a1aa] not-italic">Asesoría de Inteligencia Artificial</span>
        </div>
        <p className="font-light">
          "Encuentra la fragancia que habla de ti." © {new Date().getFullYear()} Gio te perfumo. Todos los derechos reservados.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#777] dark:text-[#777] hover:text-[#c5a059] transition-colors"
        >
          Administrar
        </button>
      </footer>
    </div>
  );
}