import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  DollarSign,
  Smile,
  Heart,
  Eye,
  ArrowRight,
  RotateCcw,
  Tag,
  Users,
  Bot,
} from 'lucide-react';
import { DiscoveryQuizAnswers, CompatibilityResult, Perfume } from '../types';
import { PerfumeImage } from './PerfumeImage';

interface QuizAdvisorProps {
  onOpenDetail: (perfume: Perfume) => void;
  onToggleSave: (perfume: Perfume) => void;
  savedPerfumeIds: string[];
  onConsultGiobotWithResults: (summary: string) => void;
}

export const QuizAdvisor: React.FC<QuizAdvisorProps> = ({
  onOpenDetail,
  onToggleSave,
  savedPerfumeIds,
  onConsultGiobotWithResults,
}) => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<DiscoveryQuizAnswers>({
    genderPreference: 'Todos',
    occasion: '',
    budgetMXNMax: 2000,
    preferredNotes: [],
    personalityStyle: '',
    desiredEmotion: '',
    weather: 'Templado',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    giobotText: string;
    recommendations: CompatibilityResult[];
  } | null>(null);

  const genderOptions = [
    {
      label: 'Caballero',
      title: '🤵 Caballero / Hombre',
      desc: 'Fragancias masculinas con acordes viriles, maderosos, especiados o marinos',
    },
    {
      label: 'Dama',
      title: '🌸 Dama / Mujer',
      desc: 'Fragancias femeninas con notas florales, gourmand, frutales o ambaradas',
    },
    {
      label: 'Unisex',
      title: '✨ Unisex / Versátil',
      desc: 'Fragancias equilibradas diseñadas para disfrutarse sin distinción de género',
    },
    {
      label: 'Todos',
      title: '💎 Cualquier opción (Sin filtro)',
      desc: 'Explorar todo el catálogo sin restricción de género para encontrar la mejor nota',
    },
  ];

  const occasionsList = [
    { label: 'Uso diario y casual', desc: 'Sencillo, limpio y cómodo para cualquier momento' },
    { label: 'Oficina o trabajo', desc: 'Elegante, pulcro y profesional sin abrumar' },
    { label: 'Citas románticas', desc: 'Seductor, misterioso y memorable de cerca' },
    { label: 'Fiestas o vida nocturna', desc: 'Gran proyección, dulce o especiado para destacar' },
    { label: 'Eventos formales y bodas', desc: 'Sofisticado, maduro y de clase superior' },
  ];

  const budgetOptions = [
    { label: 'Hasta $1,000 MXN', max: 1000, tag: 'Perfumes Árabes & Económicos de Calidad' },
    { label: 'Hasta $1,800 MXN', max: 1800, tag: 'Árabes Premium y Diseñador Accesible' },
    { label: 'Hasta $3,000 MXN', max: 3000, tag: 'Perfumes de Diseñador & Línea Alta' },
    { label: 'Sin límite de presupuesto', max: 5000, tag: 'Gama Alta y Lujo Exclusivo' },
  ];

  const notesList = [
    'Canela & Vainilla',
    'Cítricos & Bergamota',
    'Madera & Cedro',
    'Notas Marinas & Salina',
    'Café & Cacao',
    'Lavanda & Menta',
    'Miel & Dátiles',
    'Cuero & Incienso',
  ];

  const personalityList = [
    { title: 'Audaz & Seductor', desc: 'Le gusta hacerse notar y dejar una estela cautivadora' },
    { title: 'Elegante & Sofisticado', desc: 'Aprecia los detalles clásicos y la distinción discreta' },
    { title: 'Relajado & Natural', desc: 'Prefiere la frescura pura y sentirse cómodo todo el día' },
    { title: 'Dinámico & Emprendedor', desc: 'Busca proyectar energía, éxito y liderazgo' },
  ];

  const emotionList = [
    { title: 'Confianza & Seguridad', desc: 'Sentirte empoderado y seguro de ti mismo' },
    { title: 'Sensualidad & Calidez', desc: 'Atraer y transmitir una vibra envolvente' },
    { title: 'Frescura & Vitalidad', desc: 'Sentir ligereza, energía y limpieza absoluta' },
    { title: 'Sofisticación & Misterio', desc: 'Generar curiosidad y admiración con tu aroma' },
  ];

  const handleToggleNote = (note: string) => {
    setAnswers(prev => {
      const current = prev.preferredNotes || [];
      if (current.includes(note)) {
        return { ...prev, preferredNotes: current.filter(n => n !== note) };
      } else {
        return { ...prev, preferredNotes: [...current, note] };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/giobot/quiz-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Quiz recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      genderPreference: 'Todos',
      occasion: '',
      budgetMXNMax: 2000,
      preferredNotes: [],
      personalityStyle: '',
      desiredEmotion: '',
      weather: 'Templado',
    });
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in text-[#1a1a1a]">
      {/* Quiz Banner Header (Editorial Style) */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 mb-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 bg-[#c5a059]/20 text-[#1a1a1a] border border-[#c5a059] px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
          <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
          Test Olfativo de Giobot
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif italic text-[#1a1a1a] mb-2">
          Descubre la fragancia que habla de ti
        </h2>
        <p className="text-[#555] text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          Responde estas 6 preguntas para que Giobot analice el catálogo original de Gio te perfumo y calcule tus porcentajes de compatibilidad exactos según tu género, presupuesto y estilo.
        </p>
      </div>

      {!results ? (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 shadow-sm relative">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-[#1a1a1a]/70 mb-3">
            <span>Paso {step} de 6</span>
            <span className="text-[#c5a059] font-bold">{Math.round((step / 6) * 100)}% completado</span>
          </div>
          <div className="w-full bg-[#fcfaf7] h-2 mb-8 border border-[#1a1a1a]/10 overflow-hidden">
            <div
              className="bg-[#c5a059] h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          {/* Step 1: Gender Preference */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c5a059]" />
                1. ¿Para quién es la recomendación de fragancia?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {genderOptions.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, genderPreference: g.label }))}
                    className={`p-4 border text-left transition-all ${
                      answers.genderPreference === g.label
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                        : 'bg-[#fcfaf7] border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-serif italic font-bold text-sm">{g.title}</div>
                    <div className={`text-xs mt-1 font-light ${answers.genderPreference === g.label ? 'text-[#fcfaf7]/80' : 'text-[#555]'}`}>
                      {g.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Occasion */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                2. ¿Para qué ocasión principal buscas tu perfume?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {occasionsList.map((occ, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, occasion: occ.label }))}
                    className={`p-4 border text-left transition-all ${
                      answers.occasion === occ.label
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                        : 'bg-[#fcfaf7] border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-serif italic font-bold text-sm">{occ.label}</div>
                    <div className={`text-xs mt-1 font-light ${answers.occasion === occ.label ? 'text-[#fcfaf7]/80' : 'text-[#555]'}`}>
                      {occ.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#c5a059]" />
                3. ¿Cuál es tu presupuesto aproximado en Pesos Mexicanos (MXN)?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {budgetOptions.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, budgetMXNMax: b.max }))}
                    className={`p-4 border text-left transition-all ${
                      answers.budgetMXNMax === b.max
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                        : 'bg-[#fcfaf7] border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-serif font-bold text-base">{b.label}</div>
                    <div className={`text-xs mt-1 font-sans ${answers.budgetMXNMax === b.max ? 'text-[#c5a059]' : 'text-[#555]'}`}>
                      {b.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferred Notes */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#c5a059]" />
                4. Selecciona las notas u olores que más te gustan (puedes elegir varios):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {notesList.map((note, i) => {
                  const selected = answers.preferredNotes?.includes(note);
                  return (
                    <button
                      key={i}
                      onClick={() => handleToggleNote(note)}
                      className={`p-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                        selected
                          ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                          : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {note}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Personality Style */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#c5a059]" />
                5. ¿Qué estilo o personalidad te describe mejor?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalityList.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, personalityStyle: p.title }))}
                    className={`p-4 border text-left transition-all ${
                      answers.personalityStyle === p.title
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                        : 'bg-[#fcfaf7] border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-serif italic font-bold text-sm">{p.title}</div>
                    <div className={`text-xs mt-1 font-light ${answers.personalityStyle === p.title ? 'text-[#fcfaf7]/80' : 'text-[#555]'}`}>
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Desired Emotion */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
                6. ¿Qué emoción o sensación quieres transmitir al usar tu perfume?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emotionList.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, desiredEmotion: e.title }))}
                    className={`p-4 border text-left transition-all ${
                      answers.desiredEmotion === e.title
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                        : 'bg-[#fcfaf7] border-[#1a1a1a]/20 text-[#1a1a1a] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <div className="font-serif italic font-bold text-sm">{e.title}</div>
                    <div className={`text-xs mt-1 font-light ${answers.desiredEmotion === e.title ? 'text-[#fcfaf7]/80' : 'text-[#555]'}`}>
                      {e.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-[#1a1a1a]/15 mt-8">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] disabled:opacity-30"
            >
              ← Anterior
            </button>

            {step < 6 ? (
              <button
                onClick={() => setStep(s => Math.min(6, s + 1))}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-[#fcfaf7] font-bold text-xs uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#1a1a1a] transition-colors"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-[#1a1a1a] text-[#fcfaf7] font-bold text-xs uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#1a1a1a] transition-all"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-[#c5a059]" />
                    <span>Giobot está evaluando tu perfil...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>Ver mis recomendaciones de Giobot</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Results Display */
        <div className="space-y-6 animate-fade-in">
          {/* Giobot Message Box */}
          <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 border border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-6 h-6 text-[#c5a059]" />
              </div>
              <div>
                <h3 className="text-lg font-serif italic font-bold text-[#1a1a1a]">
                  Dictamen de Recomendación de Giobot
                </h3>
                <span className="text-xs text-[#555] uppercase tracking-wider font-medium">
                  Basado en tu perfil ({answers.genderPreference || 'Sin restricción de género'})
                </span>
              </div>
            </div>

            <p className="text-[#1a1a1a] text-xs sm:text-sm leading-relaxed font-light whitespace-pre-line border-t border-[#1a1a1a]/10 pt-3">
              {results.giobotText}
            </p>
          </div>

          {/* Recommended Perfumes Cards */}
          <div className="space-y-3">
            <h3 className="text-base font-serif italic text-[#1a1a1a] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              Tus Fragancias Más Compatibles del Catálogo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations.map((rec, i) => {
                const isSaved = savedPerfumeIds.includes(rec.perfume.id);
                return (
                  <div
                    key={i}
                    className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-5 shadow-sm hover:border-[#1a1a1a] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 border border-[#1a1a1a]/15 shrink-0 overflow-hidden bg-[#fcfaf7] flex items-center justify-center p-1">
                          <PerfumeImage
                            perfumeId={rec.perfume.id}
                            alt={rec.perfume.name}
                            className="w-full h-full object-contain object-center"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] bg-[#1a1a1a] text-[#fcfaf7] font-bold uppercase tracking-wider px-2 py-0.5">
                              {rec.perfume.brand}
                            </span>
                            <span className="text-xs font-bold text-[#1a1a1a] bg-[#c5a059]/20 border border-[#c5a059] px-2.5 py-0.5">
                              {rec.compatibilityScore}% Compatible
                            </span>
                          </div>

                          <h4 className="text-lg font-serif italic text-[#1a1a1a] truncate">
                            {rec.perfume.name}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-[#555] font-serif italic mt-0.5">
                            <span>{rec.perfume.gender || 'Unisex'}</span>
                            <span>•</span>
                            <span>{rec.perfume.concentration}</span>
                            <span>•</span>
                            <span className="font-bold text-[#1a1a1a]">${rec.perfume.priceMXN} MXN</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#555] leading-relaxed mt-3 mb-2 font-light italic">
                        {rec.whyGiobotRecommends}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {rec.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#fcfaf7] text-[#1a1a1a] border border-[#1a1a1a]/15 px-2 py-0.5"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]/10 gap-2">
                      <button
                        onClick={() => onOpenDetail(rec.perfume)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fcfaf7] hover:bg-[#1a1a1a] hover:text-[#fcfaf7] text-[#1a1a1a] border border-[#1a1a1a]/20 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ficha</span>
                      </button>

                      <button
                        onClick={() => onToggleSave(rec.perfume)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                          isSaved
                            ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a]'
                            : 'bg-transparent text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#c5a059]' : ''}`} />
                        <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f5f0e8] p-4 border border-[#1a1a1a]/15">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-[#fcfaf7] text-[#1a1a1a] border border-[#1a1a1a]/20 hover:border-[#1a1a1a] text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a hacer el test</span>
            </button>

            <button
              onClick={() => {
                const summary = `Completé el test olfativo. Busco fragancias para ${answers.genderPreference || 'todos'}, ocasión: ${answers.occasion}, con presupuesto de $${answers.budgetMXNMax} MXN y emoción deseada "${answers.desiredEmotion}". Mis perfumes más compatibles fueron: ${results.recommendations.map(r => r.perfume.name).join(', ')}. ¿Podrías darme más detalles sobre el primero?`;
                onConsultGiobotWithResults(summary);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#c5a059] hover:text-[#1a1a1a] text-[#fcfaf7] font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>Continuar chateando con Giobot</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
