import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Heart,
  Eye,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { ChatMessage, Perfume, DiscoveryQuizAnswers, UserCriteria } from '../types';
import { PERFUMES_DATABASE } from '../data/perfumes';
import { PerfumeImage } from './PerfumeImage';
import giobotAvatarWebp from '../../Giobot Sommelier.webp';
import giobotAvatarPng from '../../Giobot Sommelier.png';

interface GiobotChatProps {
  onOpenDetail: (perfume: Perfume) => void;
  onToggleSave: (perfume: Perfume) => void;
  savedPerfumeIds: string[];
  userProfile?: DiscoveryQuizAnswers;
  onStartQuiz: () => void;
  initialQuery?: string;
}

const GiobotAvatar: React.FC<{ size?: 'header' | 'message' }> = ({ size = 'message' }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(giobotAvatarWebp);
  const isHeader = size === 'header';

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 bg-[#1a1a1a] flex items-center justify-center ${
        isHeader
          ? 'w-[52px] h-[52px] border-[1.5px] border-[#c5a059] shadow-sm'
          : 'w-[36px] h-[36px] border border-[#c5a059]/80 mt-1 shadow-sm'
      }`}
    >
      {!imgError ? (
        <img
          src={imgSrc}
          onError={() => {
            if (imgSrc !== giobotAvatarPng) {
              setImgSrc(giobotAvatarPng);
            } else {
              setImgError(true);
            }
          }}
          alt="Giobot Sommelier"
          className="w-full h-full object-cover scale-[1.4] origin-[50%_22%]"
          style={{ objectPosition: '50% 20%' }}
        />
      ) : (
        <Bot className={isHeader ? 'w-6 h-6 text-[#c5a059]' : 'w-4 h-4 text-[#c5a059]'} />
      )}
    </div>
  );
};

// Helper: Parse and render formatted text cleanly without raw markdown symbols (** or *)
const renderFormattedText = (content: string, isUser: boolean) => {
  if (!content) return null;

  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              const isBullet = /^[*-•]\s+/.test(trimmed);
              const textToParse = isBullet ? trimmed.replace(/^[*-•]\s+/, '') : trimmed;

              const elements: React.ReactNode[] = [];
              const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_\b([^_]+)\b)/g;
              let lastIndex = 0;
              let match: RegExpExecArray | null;

              while ((match = regex.exec(textToParse)) !== null) {
                if (match.index > lastIndex) {
                  const plain = textToParse.substring(lastIndex, match.index).replace(/\*\*/g, '');
                  elements.push(plain);
                }

                if (match[2]) {
                  elements.push(
                    <strong
                      key={match.index}
                      className={isUser ? 'font-bold text-[#fcfaf7]' : 'font-bold text-[#1a1a1a]'}
                    >
                      {match[2]}
                    </strong>
                  );
                } else if (match[3]) {
                  elements.push(
                    <em key={match.index} className="italic opacity-90">
                      {match[3]}
                    </em>
                  );
                } else if (match[4]) {
                  elements.push(
                    <strong
                      key={match.index}
                      className={isUser ? 'font-bold text-[#fcfaf7]' : 'font-bold text-[#1a1a1a]'}
                    >
                      {match[4]}
                    </strong>
                  );
                } else if (match[5]) {
                  elements.push(
                    <em key={match.index} className="italic opacity-90">
                      {match[5]}
                    </em>
                  );
                }

                lastIndex = regex.lastIndex;
              }

              if (lastIndex < textToParse.length) {
                const remaining = textToParse
                  .substring(lastIndex)
                  .replace(/\*\*/g, '')
                  .replace(/^\*+|\*+$/g, '');
                elements.push(remaining);
              }

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className={isUser ? 'text-[#fcfaf7] font-bold mt-0.5' : 'text-[#c5a059] font-bold mt-0.5'}>
                      •
                    </span>
                    <span className="flex-1 leading-relaxed">
                      {elements.length > 0 ? elements : textToParse}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {elements.length > 0 ? elements : textToParse}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const GIOBOT_SESSION_STORAGE_KEY = 'gioteperfumo_giobot_session_v1';

interface GiobotStoredSession {
  messages: ChatMessage[];
  conversationProfile?: UserCriteria;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'giobot',
  text: '¡Hola! Soy **Giobot**, el asesor inteligente de **Gio te perfumo**. 👋✨\n\nMi objetivo es ayudarte a encontrar el perfume original que mejor refleje tu personalidad, gustos y presupuesto. *Recuerda: no busco venderte el perfume más caro, sino el ideal para ti.*\n\nCuéntame: ¿para qué ocasión estás buscando una fragancia o qué aromas te agradan?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  quickReplies: [
    'Busco un perfume dulce y amaderado para salir de noche',
    'Necesito una fragancia fresca para oficina por menos de $1,200 MXN',
    '¿Cuáles son los perfumes árabes de mayor duración?',
    'Hacer el Test de Descubrimiento (Quiz)',
  ],
};

function getStoredGiobotSession(): GiobotStoredSession | null {
  try {
    const raw = sessionStorage.getItem(GIOBOT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error al leer sessionStorage de Giobot:', e);
  }
  return null;
}

function normalizeIntentText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isComparisonBoundary(text: string): boolean {
  const norm = normalizeIntentText(text);
  return (
    /\bcompara(?:r|cion|lo)?\b/.test(norm) ||
    /\bdiferencia\s+(?:entre|en\s+tre|con)\b/.test(norm) ||
    /\bversus\b/.test(norm) ||
    /\bvs\b/.test(norm) ||
    norm.includes('frente a') ||
    norm.includes('cual es mejor entre') ||
    norm.includes('cual me conviene mas entre') ||
    norm.includes('cual dura mas entre')
  );
}

function isExplicitNewSearchBoundary(text: string): boolean {
  const norm = normalizeIntentText(text);
  return (
    norm.includes('ahora quiero') ||
    norm.includes('ahora busco') ||
    norm.includes('otra busqueda') ||
    norm.includes('nueva busqueda') ||
    norm.includes('empecemos de nuevo') ||
    norm.includes('cambiar de busqueda')
  );
}

function normalizeTextForApi(text: string): string {
  let normalized = text;
  normalized = normalized.replace(/diferencia\s+en\s+tre/gi, 'diferencia entre');
  return normalized;
}

function sanitizeConversationProfileForNewContext(
  profile?: UserCriteria
): UserCriteria | undefined {
  if (!profile) return undefined;

  return {
    ...profile,
    durableProfile: profile.durableProfile,
    activeSearch: {},
    occasion: undefined,
    maxBudgetMXN: undefined,
    minBudgetMXN: undefined,
    weather: undefined,
    season: undefined,
    timeOfDay: undefined,
    desiredEmotions: undefined,
    desiredDuration: undefined,
    desiredProjection: undefined,
    desiredPerformance: undefined,
  };
}

function sanitizeGiobotReply(text: string): string {
  if (!text) return text;
  return text.replace(/\\n/g, '\n');
}

export const GiobotChat: React.FC<GiobotChatProps> = ({
  onOpenDetail,
  onToggleSave,
  savedPerfumeIds,
  userProfile,
  onStartQuiz,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = getStoredGiobotSession();
    return stored ? stored.messages : [DEFAULT_WELCOME_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationProfile, setConversationProfile] = useState<UserCriteria | undefined>(() => {
    const stored = getStoredGiobotSession();
    return stored?.conversationProfile;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const sentInitialRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        const sessionPayload: GiobotStoredSession = {
          messages,
          conversationProfile,
        };
        sessionStorage.setItem(GIOBOT_SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
      }
    } catch (err) {
      console.warn('Error al guardar sesión de Giobot en sessionStorage:', err);
    }
  }, [messages, conversationProfile]);

  useEffect(() => {
    if (initialQuery && initialQuery !== sentInitialRef.current) {
      sentInitialRef.current = initialQuery;
      handleSendText(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    if (textToSend.includes('Hacer el Test')) {
      onStartQuiz();
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const fullHistory = messages.concat(userMsg);

      // La API solo recibe el tramo de conversación correspondiente a la búsqueda activa.
      // Esto evita que un presupuesto/ocasión viejo reaparezca al iniciar una comparación nueva.
      let activeBoundaryIndex = 0;
      for (let i = fullHistory.length - 1; i >= 0; i -= 1) {
        const msg = fullHistory[i];
        if (msg.sender !== 'user') continue;
        if (isComparisonBoundary(msg.text) || isExplicitNewSearchBoundary(msg.text)) {
          activeBoundaryIndex = i;
          break;
        }
      }

      const hasActiveBoundary = activeBoundaryIndex > 0 ||
        (fullHistory[0]?.sender === 'user' &&
          (isComparisonBoundary(fullHistory[0].text) || isExplicitNewSearchBoundary(fullHistory[0].text)));

      const historyForApi = fullHistory
        .slice(hasActiveBoundary ? activeBoundaryIndex : 0)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          text: m.sender === 'user' ? normalizeTextForApi(m.text) : m.text,
        }));

      const isAwaitingSecondComparison = Boolean(
        conversationProfile?.activeSearch?.awaitingSecondComparisonPerfume
      );
      const isStartingBrandNewContext =
        !isAwaitingSecondComparison &&
        (isComparisonBoundary(userMsg.text) || isExplicitNewSearchBoundary(userMsg.text));

      const profileForApi = isStartingBrandNewContext
        ? sanitizeConversationProfileForNewContext(conversationProfile)
        : conversationProfile;

      const catalogPricing = PERFUMES_DATABASE.map(p => ({
        id: p.id,
        priceMXN: p.priceMXN,
        promoActive: p.promoActive ?? false,
        promoPriceMXN: p.promoPriceMXN ?? null,
        promoLabel: p.promoLabel ?? '',
        stockStatus: p.stockStatus ?? 'Disponible',
      }));

      const res = await fetch('/api/giobot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          userProfile,
          conversationProfile: profileForApi,
          catalogPricing,
        }),
      });

      const data = await res.json();

      if (data.conversationProfile) {
        setConversationProfile(data.conversationProfile);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'giobot',
        text: sanitizeGiobotReply(data.replyText || 'He analizado tu consulta.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: data.recommendations || [],
        quickReplies: data.quickReplies || [],
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat submit error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'giobot',
          text: 'Disculpa, tuve un problema de conexión. ¿Podrías volver a comentarme tu duda o presupuesto?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    try {
      sessionStorage.removeItem(GIOBOT_SESSION_STORAGE_KEY);
    } catch (err) {
      console.warn('Error al reiniciar sessionStorage de Giobot:', err);
    }
    setConversationProfile(undefined);
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'giobot',
        text: '¡Conversación reiniciada! Estoy listo para ayudarte a descubrir tu nueva firma olfativa. ¿Por dónde empezamos?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          'Hacer el Test Olfativo de 1 minuto',
          'Recomiéndame un perfume versátil para diario',
          'Busco un perfume para cita romántica',
          'Perfumes árabes de alta duración por menos de $1,500 MXN',
        ],
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto p-2 sm:p-4 animate-fade-in text-[#1a1a1a]">
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/10 px-3.5 py-2.5 sm:px-4 sm:py-3 mb-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <GiobotAvatar size="header" />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#f5f0e8] ring-1 ring-[#1a1a1a]/20"
              title="Disponible"
            />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-serif italic font-bold text-[#1a1a1a] leading-tight">
              Giobot Sommelier
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span className="text-[11px] sm:text-xs text-[#c5a059] font-medium tracking-wide">
                Asesor IA
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStartQuiz}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-[#fcfaf7] hover:bg-[#c5a059] hover:text-[#1a1a1a] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Test Olfativo</span>
          </button>

          <button
            onClick={handleResetChat}
            title="Reiniciar chat"
            className="p-2 border border-[#1a1a1a]/20 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fcfaf7] transition-colors rounded-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-5 bg-[#fcfaf7] border border-[#1a1a1a]/15 shadow-inner no-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } animate-fade-in`}
          >
            <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
              {msg.sender === 'giobot' && <GiobotAvatar size="message" />}

              <div
                className={`p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#1a1a1a] text-[#fcfaf7] font-sans'
                    : 'bg-[#f5f0e8] text-[#1a1a1a] border border-[#1a1a1a]/10 border-l-2 border-l-[#c5a059]'
                }`}
              >
                <div>{renderFormattedText(msg.text, msg.sender === 'user')}</div>

                <div
                  className={`text-[10px] mt-2 font-mono text-right ${
                    msg.sender === 'user' ? 'text-[#fcfaf7]/70' : 'text-[#1a1a1a]/50'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 border border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center shrink-0 mt-1 text-[#fcfaf7]">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-3 ml-9 w-full max-w-2xl space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-bold flex items-center gap-1.5 border-b border-[#1a1a1a]/10 pb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  Fragancias Recomendadas por Giobot:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.recommendations.map((rec, i) => {
                    const isSaved = savedPerfumeIds.includes(rec.perfume.id);
                    return (
                      <div
                        key={i}
                        className="bg-[#f5f0e8] border border-[#1a1a1a]/20 p-3 flex flex-col justify-between hover:border-[#1a1a1a] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 border border-[#1a1a1a]/20 shrink-0 overflow-hidden bg-[#fcfaf7] flex items-center justify-center p-1">
                            <PerfumeImage
                              perfumeId={rec.perfume.id}
                              alt={rec.perfume.name}
                              className="w-full h-full object-contain object-center"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-[#c5a059] font-bold uppercase tracking-wider block">
                              {rec.perfume.brand} • {rec.perfume.concentration}
                            </span>
                            <h4 className="text-sm font-serif font-bold text-[#1a1a1a] truncate">
                              {rec.perfume.name}
                            </h4>
                            {rec.perfume.promoActive === true &&
                            typeof rec.perfume.promoPriceMXN === 'number' &&
                            rec.perfume.promoPriceMXN > 0 ? (
                              <div className="flex items-baseline gap-1.5 flex-wrap my-0.5">
                                <span className="text-[11px] text-[#71717a] line-through font-serif italic">
                                  ${rec.perfume.priceMXN.toLocaleString('es-MX')}
                                </span>
                                <span className="text-xs font-serif italic font-bold text-[#1a1a1a]">
                                  ${rec.perfume.promoPriceMXN.toLocaleString('es-MX')} MXN
                                </span>
                                {rec.perfume.promoLabel && rec.perfume.promoLabel.trim() ? (
                                  <span className="text-[8px] uppercase tracking-wider font-bold bg-[#c5a059]/20 text-[#8c6d23] px-1.5 py-0.5 border border-[#c5a059]/40">
                                    {rec.perfume.promoLabel.trim()}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="text-xs font-serif italic text-[#1a1a1a]">
                                ${rec.perfume.priceMXN.toLocaleString('es-MX')} MXN
                              </div>
                            )}
                            <div className="mt-1 inline-flex items-center text-[10px] bg-[#c5a059]/20 text-[#1a1a1a] border border-[#c5a059] px-2 py-0.5 font-bold">
                              {rec.compatibilityScore}% Compatible
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#555] line-clamp-2 my-2 font-light italic">
                          {rec.whyGiobotRecommends}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]/10 gap-2">
                          <button
                            onClick={() => onOpenDetail(rec.perfume)}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a] hover:text-[#c5a059] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>

                          <button
                            onClick={() => onToggleSave(rec.perfume)}
                            className={`p-1.5 border transition-colors ${
                              isSaved
                                ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a]'
                                : 'bg-transparent text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#c5a059]' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {msg.quickReplies && msg.quickReplies.length > 0 && (
              <div className="mt-2.5 ml-9 flex flex-wrap gap-2">
                {msg.quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendText(reply)}
                    className="text-xs bg-[#f5f0e8] text-[#1a1a1a] border border-[#1a1a1a]/30 hover:bg-[#1a1a1a] hover:text-[#fcfaf7] px-3 py-1.5 transition-all tracking-wide"
                  >
                    💬 {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#1a1a1a] p-3 bg-[#f5f0e8] border border-[#1a1a1a]/20 w-fit animate-pulse font-serif italic">
            <Sparkles className="w-4 h-4 text-[#c5a059] animate-spin" />
            <span>Giobot está evaluando el catálogo de Gio te perfumo...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendText(input);
        }}
        className="mt-3 flex items-center gap-2 bg-[#f5f0e8] p-2 border border-[#1a1a1a]/20 shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tus gustos, ocasión de uso o presupuesto en $MXN..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#c5a059] hover:text-[#1a1a1a] disabled:opacity-40 text-[#fcfaf7] px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all"
        >
          <span>Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
