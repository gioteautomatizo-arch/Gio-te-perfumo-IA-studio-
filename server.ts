import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { PERFUMES_DATABASE } from './src/data/perfumes';
import { DiscoveryQuizAnswers, CompatibilityResult, Perfume, DurableProfile, ActiveSearch } from './src/types';
import {
  buildGiobotOfficialBrainPrompt,
  calculateExactCompatibility,
  rankPerfumesByCompatibility,
  convertQuizToCriteria,
  checkHardConstraints,
  getEffectivePrice,
  UserCriteria,
} from './src/knowledge';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: Extract budget constraints from natural language text as a safety backstop
function extractMaxBudgetFromText(text: string): number | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const patterns = [
    /(?:menos de|en menos de|hasta|maximo|máximo|max|tope de|tope|no mas de|no más de|inferior a|presupuesto de|gastar hasta|puedo gastar hasta|cuento con|tengo)\s*(?:de\s*)?\$?\s*([0-9]{1,2}[.,]?[0-9]{3}|[0-9]{3,5})/i,
    /\$?\s*([0-9]{1,2}[.,]?[0-9]{3})\s*(?:pesos|mxn)?\s*(?:como maximo|como máximo|maximo|máximo|de presupuesto|o menos)/i,
    /(?:en|por)\s+menos\s+de\s*\$?\s*([0-9]{1,2}[.,]?[0-9]{3}|[0-9]{3,5})/i,
    /\$?\s*([0-9]{1,2}[.,]?[0-9]{3}|[0-9]{3,5})\s*(?:pesos|mxn)/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const cleanNum = Number(match[1].replace(/[,.]/g, ''));
      if (!isNaN(cleanNum) && cleanNum >= 300 && cleanNum <= 50000) {
        return cleanNum;
      }
    }
  }

  return undefined;
}

function extractOccasionFromText(text: string): string | undefined {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('gala') || norm.includes('fiesta de gala') || norm.includes('boda') || norm.includes('graduacion') || norm.includes('evento formal')) {
    return 'Fiesta de gala';
  }
  if (norm.includes('cita') || norm.includes('salir en pareja') || norm.includes('conquistar') || norm.includes('ligar')) {
    return 'Cita romántica';
  }
  if (norm.includes('oficina') || norm.includes('trabajo') || norm.includes('juntas') || norm.includes('negocios')) {
    return 'Oficina';
  }
  if (norm.includes('fiesta') || norm.includes('antro') || norm.includes('club') || norm.includes('salidas nocturnas') || norm.includes('antrear')) {
    return 'Fiesta';
  }
  if (norm.includes('diario') || norm.includes('dia a dia') || norm.includes('casual') || norm.includes('escuela') || norm.includes('universidad')) {
    return 'Uso diario';
  }
  if (norm.includes('gimnasio') || norm.includes('deporte') || norm.includes('ejercicio')) {
    return 'Deporte';
  }
  return undefined;
}

function extractDislikesFromText(text: string): string[] {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const dislikes: string[] = [];

  const negationRegex = /(?:no\s+(?:sea\s+|muy\s+|tan\s+)?|nada\s+(?:de\s+)?|sin\s+|cero\s+|que\s+no\s+sea\s+(?:muy\s+)?)(dulce|empalagos[oa]|vainilla|amaderad[oa]|pesad[oa]|floral|citric[oa]|especiad[oa]|cuero|oud|fresc[oa]|frutal)/gi;

  let match;
  while ((match = negationRegex.exec(norm)) !== null) {
    if (match[1]) {
      let term = match[1].toLowerCase();
      if (term.startsWith('dulce') || term.startsWith('empalagos')) term = 'dulce';
      if (term.startsWith('amaderad')) term = 'amaderado';
      if (term.startsWith('citric')) term = 'cítrico';
      if (term.startsWith('fresc')) term = 'fresco';
      if (term.startsWith('pesad')) term = 'pesado';
      if (term.startsWith('especiad')) term = 'especiado';
      if (!dislikes.includes(term)) {
        dislikes.push(term);
      }
    }
  }

  return dislikes;
}

function extractOlfactoryPreferencesFromText(text: string, currentDislikes: string[]): string[] {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const found: string[] = [];

  const candidates: Record<string, string[]> = {
    'fresco': ['fresc', 'limpi', 'aquat', 'acuat', 'marino', 'ozon'],
    'cítrico': ['citric', 'bergamota', 'limon', 'pomelo', 'toronja', 'mandarina', 'naranja'],
    'amaderado': ['amaderad', 'madera', 'cedro', 'sandalo', 'vetiver'],
    'dulce': ['dulce', 'vainilla', 'gourmand', 'caramelo', 'haba tonka', 'tonka', 'chocolate'],
    'especiado': ['especiad', 'canela', 'pimienta', 'cardamomo', 'nuez moscada', 'clavo'],
    'floral': ['floral', 'flores', 'rosa', 'jazmin', 'azahar', 'lavanda'],
    'cuero': ['cuero', 'leather'],
    'oriental / ámbar': ['ambar', 'oriental', 'incienso', 'resina'],
    'frutal': ['frutal', 'manzana', 'fruta', 'pina', 'piña', 'ciruela', 'grosella', 'durazno'],
  };

  const negationRegex = /(?:no\s+(?:sea\s+|muy\s+|tan\s+)?|nada\s+(?:de\s+)?|sin\s+|cero\s+|que\s+no\s+sea\s+(?:muy\s+)?)(dulce|empalagos[oa]|vainilla|amaderad[oa]|pesad[oa]|floral|citric[oa]|especiad[oa]|cuero|oud|fresc[oa]|frutal)/gi;
  const negatedTerms = new Set<string>();
  let negMatch;
  while ((negMatch = negationRegex.exec(norm)) !== null) {
    if (negMatch[1]) {
      negatedTerms.add(negMatch[1]);
    }
  }

  for (const [key, patterns] of Object.entries(candidates)) {
    if (currentDislikes.includes(key)) continue;
    if (key === 'dulce' && (currentDislikes.includes('dulce') || norm.includes('no dulce') || norm.includes('no muy dulce') || norm.includes('no tan dulce'))) continue;

    const matched = patterns.some(p => norm.includes(p));
    if (matched) {
      let isNegated = false;
      for (const neg of negatedTerms) {
        if (patterns.some(p => neg.includes(p))) {
          isNegated = true;
          break;
        }
      }
      if (!isNegated && !found.includes(key)) {
        found.push(key);
      }
    }
  }

  return found;
}

function extractEmotionsAndStyleFromText(text: string): { emotions: string[]; style?: string } {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const emotions: string[] = [];
  let style: string | undefined = undefined;

  if (norm.includes('llamativo') || norm.includes('destacar') || norm.includes('llamar la atencion') || norm.includes('notar') || norm.includes('presencia')) {
    emotions.push('Llamativo', 'Destacar');
    style = 'Llamativo / Presencia';
  }
  if (norm.includes('elegante') || norm.includes('sofisticado') || norm.includes('porte') || norm.includes('formal')) {
    emotions.push('Elegancia', 'Seguridad');
    style = style ? `${style}, Elegante` : 'Elegante';
  }
  if (norm.includes('seductor') || norm.includes('conquistar') || norm.includes('atractivo') || norm.includes('sensual')) {
    emotions.push('Seducción', 'Atracción');
    style = style ? `${style}, Seductor` : 'Seductor';
  }
  if (norm.includes('limpio') || norm.includes('pulcro') || norm.includes('frescura')) {
    emotions.push('Frescura', 'Limpieza');
  }

  return { emotions, style };
}

function extractGenderFromText(text: string): string | undefined {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('hombre') || norm.includes('caballero') || norm.includes('masculino') || norm.includes('para mi novio') || norm.includes('para mi esposo')) {
    return 'Caballero';
  }
  if (norm.includes('mujer') || norm.includes('dama') || norm.includes('femenino') || norm.includes('para mi novia') || norm.includes('para mi esposa')) {
    return 'Dama';
  }
  if (norm.includes('unisex')) {
    return 'Unisex';
  }
  return undefined;
}

function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type ConversationIntent =
  | 'PRODUCT_QUESTION'
  | 'ALTERNATIVES_REQUEST'
  | 'COMPARISON'
  | 'EDUCATIONAL'
  | 'RECOMMENDATION_REQUEST'
  | 'ACTIVE_SEARCH_CONTINUATION';

export function findMentionedPerfumes(text: string, catalog: Perfume[]): Perfume[] {
  const normText = ' ' + normalizeSearchText(text) + ' ';
  const matched: Perfume[] = [];

  const aliasMap: Record<string, string[]> = {
    'bleu-de-chanel-edp': ['bleu de chanel', 'bleu chanel', 'chanel bleu', 'bleu', 'chanel bleu de chanel'],
    'montblanc-legend-spirit': ['legend spirit', 'montblanc legend spirit', 'mont blanc legend spirit', 'legend', 'montblanc legend', 'mont blanc legend'],
    'montblanc-explorer': ['montblanc explorer', 'mont blanc explorer', 'explorer', 'montblanc explorer edp'],
    'dior-sauvage-edt': ['sauvage edt', 'dior sauvage', 'sauvage', 'sauvage dior'],
    'paco-rabanne-one-million': ['1 million', 'one million', 'one milion', '1 millon', 'one million paco rabanne'],
    'paco-rabanne-invictus': ['invictus', 'paco rabanne invictus', 'invictus paco rabanne'],
    'armani-acqua-di-gio-profondo': ['acqua di gio profondo', 'gio profondo', 'profondo', 'adg profondo'],
    'ysl-y-edp': ['ysl y', 'y edp', 'y de ysl', 'yves saint laurent y'],
    'versace-eros-edp': ['versace eros', 'eros edp', 'eros'],
    'nautica-voyage': ['nautica voyage', 'voyage', 'voyage nautica', 'nautica'],
    'lacoste-l1212-blanc': ['lacoste blanc', 'l 12 12 blanc', 'lacoste l1212 blanc', 'lacoste blanco'],
    'azzaro-the-most-wanted': ['the most wanted', 'most wanted'],
    'jpg-le-male-elixir': ['le male elixir', 'le male'],
    'valentino-uomo-born-in-roma': ['uomo born in roma', 'valentino born in roma hombre'],
    'prada-luna-rossa-carbon': [
      'luna rossa carbon',
      'prada carbon',
      'luna rossa',
      'prada luna',
      'luna prada',
      'prada luna rossa',
      'luna rossa prada',
      'prada luna carbon',
      'luna prada carbon',
      'prada luna rossa carbon'
    ],
    'hugo-boss-bottled': ['boss bottled', 'hugo boss bottled'],
    'coach-for-men': ['coach for men', 'coach men'],
    'versace-dylan-blue': ['dylan blue', 'versace dylan blue'],
    'givenchy-gentleman-reserve-privee': ['gentleman reserve privee', 'reserve privee', 'gentleman reserve'],
    'armani-stronger-with-you-intensely': ['stronger with you intensely', 'stronger with you'],
    'carolina-herrera-good-girl': ['good girl', 'ch good girl', 'zapatito'],
    'ysl-libre-edp': ['ysl libre', 'libre edp', 'libre ysl'],
    'lancome-la-vie-est-belle': ['la vie est belle', 'vie est belle'],
    'cacharel-amor-amor': ['amor amor'],
    'chanel-coco-mademoiselle': ['coco mademoiselle', 'mademoiselle chanel'],
    'dior-miss-dior': ['miss dior'],
    'ysl-black-opium': ['black opium'],
    'armani-my-way': ['my way', 'armani my way'],
    'lancome-idole': ['lancome idole', 'idole'],
    'versace-bright-crystal': ['bright crystal'],
    'valentino-donna-born-in-roma': ['donna born in roma', 'valentino born in roma mujer'],
    'chanel-chance-eau-tendre': ['chance eau tendre', 'chanel chance'],
    'armani-si-edp': ['armani si', 'si edp', 'si armani'],
    'viktor-rolf-flowerbomb': ['flowerbomb'],
    'dolce-gabbana-light-blue': ['light blue', 'd&g light blue'],
    'lattafa-khamrah': ['khamrah', 'lattafa khamrah'],
    'lattafa-khamrah-qahwa': ['khamrah qahwa', 'qahwa'],
    'afnan-9pm': ['afnan 9pm', '9pm', '9 pm'],
    'rasasi-hawas': ['rasasi hawas', 'hawas'],
    'club-de-nuit-intense-man': ['club de nuit intense man', 'club de nuit intense', 'club de nuit', 'cdnim'],
    'lattafa-asad': ['lattafa asad', 'asad'],
    'lattafa-fakhar-black': ['fakhar black', 'lattafa fakhar black', 'fakhar'],
    'lattafa-qaed-al-fursan': ['qaed al fursan', 'al fursan'],
    'lattafa-honor-and-glory': ['honor and glory', 'honor & glory', 'bade e al oud honor and glory'],
    'maison-alhambra-jean-lowe-immortel': ['jean lowe immortel', 'immortel'],
    'lattafa-yara': ['lattafa yara', 'yara rosa', 'yara edp'],
    'lattafa-yara-candy': ['yara candy'],
    'lattafa-yara-moi': ['yara moi', 'yara blanca'],
    'lattafa-fakhar-rose': ['fakhar rose', 'fakhar rosa'],
    'lattafa-mayar': ['lattafa mayar', 'mayar'],
    'lattafa-yara-tous': ['yara tous', 'yara amarilla'],
    'zara-rich-warm-addictive': ['rich warm addictive', 'zara rich warm'],
    'mancera-cedrat-boise': ['cedrat boise', 'mancera cedrat boise']
  };

  for (const p of catalog) {
    const normName = normalizeSearchText(p.name);
    const normBrand = normalizeSearchText(p.brand);
    const normFullName = normalizeSearchText(p.brand + ' ' + p.name);
    const cleanName = normName.replace(/\b(edt|edp|parfum|extrait|eau de toilette|eau de parfum|eau fraiche|pour homme|for him|for men)\b/g, '').trim();

    const candidates = [
      normFullName,
      normName,
      cleanName,
      normBrand + ' ' + cleanName,
      cleanName + ' ' + normBrand,
      ...(aliasMap[p.id] || []).map(a => normalizeSearchText(a)),
    ].filter(c => c.length >= 3);

    // Prioritize longer strings so sub-phrases like 'qahwa' match 'khamrah qahwa' before 'khamrah'
    candidates.sort((a, b) => b.length - a.length);

    for (const cand of candidates) {
      if (cand.length < 3) continue;
      const target = ' ' + cand + ' ';
      if (normText.includes(target)) {
        if (!matched.some(m => m.id === p.id)) {
          matched.push(p);
        }
        break;
      }
    }
  }

  return matched;
}

export function isAlternativesRequest(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('otra opcion') ||
    norm.includes('otras opciones') ||
    norm.includes('otro perfume') ||
    norm.includes('otros perfumes') ||
    norm.includes('alternativa') ||
    norm.includes('alternativas') ||
    norm.includes('algo parecido') ||
    norm.includes('algo similar') ||
    norm.includes('parecido a') ||
    norm.includes('similar a') ||
    norm.includes('que mas tienes') ||
    norm.includes('que mas me recomiendas') ||
    norm.includes('que otra cosa') ||
    norm.includes('muestrame otras') ||
    norm.includes('dame otras') ||
    norm.includes('dame mas opciones') ||
    norm.includes('que puedo comprar con') ||
    norm.includes('que me alcanza con') ||
    norm.includes('que opciones tengo') ||
    norm.includes('que tengo por') ||
    norm.includes('algo mas economico') ||
    norm.includes('algo mas barato')
  );
}

export function isComparisonRequest(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('compara') ||
    norm.includes('comparar') ||
    norm.includes('comparacion') ||
    norm.includes('comparalo con') ||
    norm.includes('comparar con') ||
    norm.includes('diferencia entre') ||
    norm.includes('diferencia con') ||
    norm.includes('frente a') ||
    norm.includes(' vs ') ||
    norm.includes('versus') ||
    norm.includes('cual es mejor entre') ||
    norm.includes('cual me conviene mas entre') ||
    norm.includes('cual dura mas entre')
  );
}

export function isEducationalQuestion(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('edt vs edp') ||
    norm.includes('diferencia entre edt') ||
    norm.includes('concentracion') ||
    norm.includes('como aplicar') ||
    norm.includes('donde aplicar') ||
    norm.includes('maceracion') ||
    norm.includes('que es ambroxan') ||
    norm.includes('mision') ||
    norm.includes('filosofia') ||
    norm.includes('quien eres')
  );
}

export function isNewSearchInitiation(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('ahora quiero') ||
    norm.includes('ahora busco') ||
    norm.includes('ahora para') ||
    norm.includes('otra busqueda') ||
    norm.includes('nueva busqueda') ||
    norm.includes('empecemos de nuevo') ||
    norm.includes('otro perfume para') ||
    norm.includes('cambiar de busqueda') ||
    norm.includes('buscar otro')
  );
}

function isComparisonFollowUpText(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('de los dos') ||
    norm.includes('entre los dos') ||
    norm.includes('entre ambos') ||
    norm.includes('cual de los dos') ||
    norm.includes('cual es mas') ||
    norm.includes('cual dura mas') ||
    norm.includes('cual proyecta mas') ||
    norm.includes('mas fresco') ||
    norm.includes('mas duradero') ||
    norm.includes('para diario') ||
    norm.includes('para el diario') ||
    norm.includes('para calor') ||
    norm.includes('para oficina') ||
    norm.includes('llamativo') ||
    norm.includes('destacar') ||
    norm.includes('llamar la atencion') ||
    norm.includes('notar') ||
    norm.includes('presencia') ||
    norm.includes('para fiesta') ||
    norm.includes('para noche') ||
    norm.includes('para cita') ||
    norm.includes('frescura') ||
    norm.includes('duracion') ||
    norm.includes('proyeccion') ||
    norm.includes('estela') ||
    norm.includes('versatil') ||
    norm.includes('versatilidad')
  );
}

function isProductFollowUpText(text: string): boolean {
  const norm = normalizeSearchText(text);
  return (
    norm.includes('lo quiero') ||
    norm.includes('lo compro') ||
    norm.includes('me interesa') ||
    norm.includes('ese quiero') ||
    norm.includes('ese me interesa') ||
    norm.includes('quiero ese') ||
    norm.includes('cuanto me falta') ||
    norm.includes('me alcanza') ||
    norm.includes('tengo ') ||
    /\b[0-9]{3,5}\b/.test(norm)
  );
}

export function detectConversationIntent(
  text: string,
  catalog: Perfume[]
): { intent: ConversationIntent; mentionedPerfumes: Perfume[] } {
  const mentionedPerfumes = findMentionedPerfumes(text, catalog);
  const isComp = isComparisonRequest(text);
  const isAlt = isAlternativesRequest(text);
  const isEdu = isEducationalQuestion(text);

  if (isComp) {
    return { intent: 'COMPARISON', mentionedPerfumes };
  }
  if (isAlt) {
    return { intent: 'ALTERNATIVES_REQUEST', mentionedPerfumes };
  }
  if (mentionedPerfumes.length > 0) {
    return { intent: 'PRODUCT_QUESTION', mentionedPerfumes };
  }
  if (isEdu) {
    return { intent: 'EDUCATIONAL', mentionedPerfumes };
  }

  const norm = normalizeSearchText(text);
  const hasRecommendationKeywords =
    norm.includes('busco') ||
    norm.includes('quiero') ||
    norm.includes('recomiendame') ||
    norm.includes('recomendacion') ||
    norm.includes('para fiesta') ||
    norm.includes('para oficina') ||
    norm.includes('para cita') ||
    norm.includes('presupuesto') ||
    norm.includes('menos de') ||
    norm.includes('maximo');

  if (hasRecommendationKeywords) {
    return { intent: 'RECOMMENDATION_REQUEST', mentionedPerfumes };
  }

  return { intent: 'ACTIVE_SEARCH_CONTINUATION', mentionedPerfumes };
}

function updateCriteriaWithText(
  current: UserCriteria,
  text: string,
  intent?: ConversationIntent
): UserCriteria {
  const updated: UserCriteria = { ...current };

  // Inicializar o recuperar durableProfile (preferencias estables del cliente)
  const durable: DurableProfile = {
    genderPreference: current.genderPreference || current.durableProfile?.genderPreference,
    olfactoryPreferences: current.olfactoryPreferences || current.durableProfile?.olfactoryPreferences || [],
    dislikes: current.dislikes || current.durableProfile?.dislikes || [],
    personalityStyle: current.personalityStyle || current.durableProfile?.personalityStyle,
    favoritePerfumesOrNotes: current.favoritePerfumesOrNotes || current.durableProfile?.favoritePerfumesOrNotes || [],
  };

  // Inicializar o recuperar activeSearch (búsqueda y contexto actual)
  const isAwaitingSecond = Boolean(current.activeSearch?.awaitingSecondComparisonPerfume);
  let active: ActiveSearch = {
    preferredCategory: current.preferredCategory || current.activeSearch?.preferredCategory,
    occasion: current.occasion || current.activeSearch?.occasion,
    maxBudgetMXN: current.maxBudgetMXN ?? current.activeSearch?.maxBudgetMXN,
    minBudgetMXN: current.minBudgetMXN ?? current.activeSearch?.minBudgetMXN,
    weather: current.weather || current.activeSearch?.weather,
    season: current.season || current.activeSearch?.season,
    timeOfDay: current.timeOfDay || current.activeSearch?.timeOfDay,
    desiredEmotions: current.desiredEmotions || current.activeSearch?.desiredEmotions || [],
    desiredDuration: current.desiredDuration || current.activeSearch?.desiredDuration,
    desiredProjection: current.desiredProjection || current.activeSearch?.desiredProjection,
    desiredPerformance: current.desiredPerformance || current.activeSearch?.desiredPerformance,
    searchGoal: current.activeSearch?.searchGoal,
    selectedPerfumeId: current.activeSearch?.selectedPerfumeId,
    comparedPerfumeIds: current.activeSearch?.comparedPerfumeIds || [],
    awaitingSecondComparisonPerfume: current.activeSearch?.awaitingSecondComparisonPerfume,
  };

  // Una nueva búsqueda explícita o el inicio de una comparación fresca inicia un contexto temporal propio.
  // Esto evita que presupuesto/ocasión/clima de una búsqueda anterior contaminen la nueva consulta.
  if (isNewSearchInitiation(text)) {
    active = {};
  } else if (intent === 'COMPARISON') {
    if (!isAwaitingSecond) {
      active = {
        searchGoal: 'COMPARISON',
        comparedPerfumeIds: [],
        awaitingSecondComparisonPerfume: false,
      };
    }
  } else if (intent === 'PRODUCT_QUESTION') {
    if (!isAwaitingSecond) {
      active = {};
    }
  }

  // Si estamos en una comparación activa, NO extraemos presupuesto ni ocasión de búsqueda general
  const isInActiveComparison = intent === 'COMPARISON' || active.searchGoal === 'COMPARISON' || isAwaitingSecond;
  if (!isInActiveComparison) {
    // 1. Budget
    const detectedBudget = extractMaxBudgetFromText(text);
    if (detectedBudget) {
      active.maxBudgetMXN = detectedBudget;
    }

    // 2. Occasion
    const detectedOccasion = extractOccasionFromText(text);
    if (detectedOccasion) {
      active.occasion = detectedOccasion;
    }
  }

  // 3. Dislikes / Negations (Perfil duradero)
  const detectedDislikes = extractDislikesFromText(text);
  if (detectedDislikes.length > 0) {
    const existingDislikes = durable.dislikes || [];
    const combinedDislikes = Array.from(new Set([...existingDislikes, ...detectedDislikes]));
    durable.dislikes = combinedDislikes;

    if (durable.olfactoryPreferences) {
      durable.olfactoryPreferences = durable.olfactoryPreferences.filter(
        p => !combinedDislikes.some(d => p.toLowerCase().includes(d.toLowerCase()))
      );
    }
  }

  // 4. Olfactory Preferences (Perfil duradero)
  const detectedPrefs = extractOlfactoryPreferencesFromText(text, durable.dislikes || []);
  if (detectedPrefs.length > 0) {
    const existingPrefs = durable.olfactoryPreferences || [];
    const combinedPrefs = Array.from(new Set([...existingPrefs, ...detectedPrefs]));
    durable.olfactoryPreferences = combinedPrefs;
  }

  // 5. Emotions and Personality
  const { emotions, style } = extractEmotionsAndStyleFromText(text);
  if (emotions.length > 0) {
    const existingEmotions = active.desiredEmotions || [];
    active.desiredEmotions = Array.from(new Set([...existingEmotions, ...emotions]));
  }
  if (style) {
    durable.personalityStyle = style;
  }

  // 6. Gender (Perfil duradero)
  const detectedGender = extractGenderFromText(text);
  if (detectedGender) {
    durable.genderPreference = detectedGender;
  }

  // 7. Weather / Climate (Búsqueda activa)
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/\barabe(?:s)?\b/.test(norm)) {
    active.preferredCategory = 'Árabe';
  } else if (/\bdisenador(?:es)?\b/.test(norm)) {
    active.preferredCategory = 'Diseñador';
  } else if (/\bnicho\b/.test(norm)) {
    active.preferredCategory = 'Nicho';
  }
  if (norm.includes('calor') || norm.includes('verano') || norm.includes('calido')) {
    active.weather = 'Calor';
  } else if (norm.includes('frio') || norm.includes('invierno')) {
    active.weather = 'Frío';
  }

  // Mantener sincronizados durableProfile y activeSearch con los campos raíz de UserCriteria
  updated.durableProfile = durable;
  updated.activeSearch = active;

  updated.genderPreference = durable.genderPreference;
  updated.olfactoryPreferences = durable.olfactoryPreferences;
  updated.dislikes = durable.dislikes;
  updated.personalityStyle = durable.personalityStyle;
  updated.favoritePerfumesOrNotes = durable.favoritePerfumesOrNotes;

  updated.occasion = active.occasion;
  updated.maxBudgetMXN = active.maxBudgetMXN;
  updated.minBudgetMXN = active.minBudgetMXN;
  updated.weather = active.weather;
  updated.season = active.season;
  updated.timeOfDay = active.timeOfDay;
  updated.desiredEmotions = active.desiredEmotions;
  updated.desiredDuration = active.desiredDuration;
  updated.desiredProjection = active.desiredProjection;
  updated.desiredPerformance = active.desiredPerformance;
  updated.preferredCategory = active.preferredCategory;

  return updated;
}

function accumulateCriteriaFromHistory(
  messages: { role: string; text: string }[],
  initialCriteria?: UserCriteria,
  catalog: Perfume[] = PERFUMES_DATABASE
): UserCriteria {
  let criteria: UserCriteria = { ...(initialCriteria || {}) };

  for (const msg of messages) {
    if (msg.role === 'user' && msg.text) {
      const detection = detectConversationIntent(msg.text, catalog);
      const isAwaitingSecond = Boolean(criteria.activeSearch?.awaitingSecondComparisonPerfume);
      const p1Id = criteria.activeSearch?.comparedPerfumeIds?.[0];

      // Si había una comparación pendiente esperando el segundo perfume
      if (isAwaitingSecond && p1Id && !isNewSearchInitiation(msg.text)) {
        const candidates = detection.mentionedPerfumes.filter(p => p.id !== p1Id);
        if (candidates.length === 1) {
          const p2 = candidates[0];
          criteria = updateCriteriaWithText(criteria, msg.text, 'COMPARISON');
          criteria.activeSearch = {
            ...(criteria.activeSearch || {}),
            searchGoal: 'COMPARISON',
            selectedPerfumeId: undefined,
            comparedPerfumeIds: [p1Id, p2.id],
            awaitingSecondComparisonPerfume: false,
          };
          continue;
        } else if (candidates.length > 1) {
          // Nombre ambiguo que coincide con varias opciones
          criteria = updateCriteriaWithText(criteria, msg.text, 'COMPARISON');
          criteria.activeSearch = {
            ...(criteria.activeSearch || {}),
            searchGoal: 'COMPARISON',
            selectedPerfumeId: undefined,
            comparedPerfumeIds: [p1Id],
            awaitingSecondComparisonPerfume: true,
          };
          continue;
        }
      }

      criteria = updateCriteriaWithText(criteria, msg.text, detection.intent);

      if (detection.intent === 'PRODUCT_QUESTION' && detection.mentionedPerfumes.length >= 1) {
        if (!criteria.activeSearch?.awaitingSecondComparisonPerfume) {
          criteria.activeSearch = {
            ...(criteria.activeSearch || {}),
            selectedPerfumeId: detection.mentionedPerfumes[0].id,
          };
        }
      }

      if (detection.intent === 'COMPARISON') {
        if (detection.mentionedPerfumes.length >= 2) {
          criteria.activeSearch = {
            ...(criteria.activeSearch || {}),
            searchGoal: 'COMPARISON',
            selectedPerfumeId: undefined,
            comparedPerfumeIds: detection.mentionedPerfumes.slice(0, 2).map(p => p.id),
            awaitingSecondComparisonPerfume: false,
          };
        } else if (detection.mentionedPerfumes.length === 1) {
          criteria.activeSearch = {
            ...(criteria.activeSearch || {}),
            searchGoal: 'COMPARISON',
            selectedPerfumeId: undefined,
            comparedPerfumeIds: [detection.mentionedPerfumes[0].id],
            awaitingSecondComparisonPerfume: true,
          };
        }
      }
    }
  }

  return criteria;
}

function hasSufficientCriteriaForRecommendation(criteria: UserCriteria): boolean {
  const hasOccasion = Boolean(criteria.occasion && criteria.occasion.trim().length > 0);
  const hasBudget = Boolean(criteria.maxBudgetMXN && criteria.maxBudgetMXN > 0);
  const hasNotes = Boolean(criteria.olfactoryPreferences && criteria.olfactoryPreferences.length > 0);
  const hasDislikes = Boolean(criteria.dislikes && criteria.dislikes.length > 0);
  const hasEmotions = Boolean(criteria.desiredEmotions && criteria.desiredEmotions.length > 0);

  // If user gave occasion + budget + (notes or dislikes or emotions) -> Sufficient!
  if (hasOccasion && hasBudget && (hasNotes || hasDislikes || hasEmotions)) {
    return true;
  }

  // If user gave occasion AND notes -> Sufficient!
  if (hasOccasion && hasNotes) {
    return true;
  }

  // If user gave occasion AND budget -> Sufficient!
  if (hasOccasion && hasBudget) {
    return true;
  }

  // If user gave notes AND budget -> Sufficient!
  if (hasNotes && hasBudget) {
    return true;
  }

  let count = 0;
  if (hasOccasion) count++;
  if (hasBudget) count++;
  if (hasNotes) count++;
  if (hasDislikes) count++;
  if (hasEmotions) count++;

  return count >= 2;
}

export interface LiveCatalogPricingItem {
  id: string;
  priceMXN?: number;
  promoActive?: boolean;
  promoPriceMXN?: number | null;
  promoLabel?: string;
  stockStatus?: 'Disponible' | 'Agotado' | 'Pocas Unidades';
}

/**
 * Genera un nuevo arreglo de catálogo aplicando precios y stock vivos por request.
 * IMPORTANTE: NO muta permanentemente el catálogo del servidor (PERFUMES_DATABASE).
 */
export function applyLiveCatalogPricing(
  serverCatalog: Perfume[],
  catalogPricing?: LiveCatalogPricingItem[]
): Perfume[] {
  if (!Array.isArray(catalogPricing) || catalogPricing.length === 0) {
    return serverCatalog.map(p => {
      const isPromo =
        p.promoActive === true &&
        typeof p.promoPriceMXN === 'number' &&
        p.promoPriceMXN > 0;
      return {
        ...p,
        effectivePriceMXN: isPromo ? p.promoPriceMXN! : p.priceMXN,
      };
    });
  }

  const liveMap = new Map<string, LiveCatalogPricingItem>();
  for (const item of catalogPricing) {
    if (item && typeof item === 'object' && item.id) {
      liveMap.set(item.id, item);
    }
  }

  return serverCatalog.map(p => {
    const live = liveMap.get(p.id);
    if (!live) {
      const isPromo =
        p.promoActive === true &&
        typeof p.promoPriceMXN === 'number' &&
        p.promoPriceMXN > 0;
      return {
        ...p,
        effectivePriceMXN: isPromo ? p.promoPriceMXN! : p.priceMXN,
      };
    }

    const priceMXN =
      typeof live.priceMXN === 'number' && live.priceMXN > 0 ? live.priceMXN : p.priceMXN;
    const promoActive = Boolean(live.promoActive);
    const promoPriceMXN =
      typeof live.promoPriceMXN === 'number'
        ? live.promoPriceMXN
        : live.promoPriceMXN === null
        ? null
        : p.promoPriceMXN;
    const promoLabel =
      typeof live.promoLabel === 'string' ? live.promoLabel : p.promoLabel;
    const stockStatus =
      live.stockStatus === 'Disponible' ||
      live.stockStatus === 'Agotado' ||
      live.stockStatus === 'Pocas Unidades'
        ? live.stockStatus
        : p.stockStatus;

    const effectivePriceMXN =
      promoActive === true &&
      typeof promoPriceMXN === 'number' &&
      promoPriceMXN > 0
        ? promoPriceMXN
        : priceMXN;

    return {
      ...p,
      priceMXN,
      promoActive,
      promoPriceMXN,
      promoLabel,
      stockStatus,
      effectivePriceMXN,
    };
  });
}

// Local Expert Fallback System
function generateLocalGiobotResponse(
  userText: string,
  criteria: UserCriteria,
  _messages?: { role: string; text: string }[],
  catalog: Perfume[] = PERFUMES_DATABASE
): {
  replyText: string;
  recommendedPerfumes: Array<{ id: string; whyGiobotRecommends?: string }>;
  quickReplies: string[];
} {
  const q = userText.toLowerCase();
  const detected = detectConversationIntent(userText, catalog);
  let intent = detected.intent;
  let mentionedPerfumes = detected.mentionedPerfumes;

  const activeSelectedPerfume = criteria.activeSearch?.selectedPerfumeId
    ? catalog.find(p => p.id === criteria.activeSearch?.selectedPerfumeId)
    : undefined;

  if (activeSelectedPerfume && mentionedPerfumes.length === 0 && isProductFollowUpText(userText) && !isNewSearchInitiation(userText)) {
    intent = 'PRODUCT_QUESTION';
    mentionedPerfumes = [activeSelectedPerfume];
  }

  const activeComparisonPerfumes = (criteria.activeSearch?.comparedPerfumeIds || [])
    .map(id => catalog.find(p => p.id === id))
    .filter((p): p is Perfume => Boolean(p));

  if (activeComparisonPerfumes.length >= 2 && !isNewSearchInitiation(userText)) {
    intent = 'COMPARISON';
    mentionedPerfumes = activeComparisonPerfumes.slice(0, 2);
  } else if (
    activeComparisonPerfumes.length === 1 &&
    criteria.activeSearch?.awaitingSecondComparisonPerfume &&
    !isNewSearchInitiation(userText)
  ) {
    intent = 'COMPARISON';
    mentionedPerfumes = [activeComparisonPerfumes[0]];
  }

  // 1. Mission / Identity / Brand
  if (q.includes('mision') || q.includes('misión') || q.includes('filosofia') || q.includes('filosofía') || q.includes('quién eres') || q.includes('quien eres')) {
    return {
      replyText:
        '¡Hola! Soy Giobot, el asesor de fragancias de **Gio te perfumo**.\n\nNuestra misión es ayudarte a encontrar el perfume que mejor refleje tu personalidad mediante asesoría cercana, honesta y un catálogo de fragancias originales.\n\nNuestra filosofía fundamental es: *"No buscamos vender el perfume más caro. Buscamos encontrar el perfume perfecto para cada persona."*\n\n¿Qué tipo de fragancia o momento te gustaría explorar hoy?',
      recommendedPerfumes: [],
      quickReplies: ['Hacer el Test Olfativo', 'Perfumes para citas', 'Perfumes para oficina'],
    };
  }

  // 2. Educational: EDT vs EDP, maceración, aplicación
  if ((q.includes('edt') && q.includes('edp')) || (q.includes('diferencia') && q.includes('edt')) || q.includes('concentracion') || q.includes('concentración')) {
    return {
      replyText:
        '¡Con gusto te lo explico de forma sencilla!\n\nLa principal diferencia entre **EDT (Eau de Toilette)** y **EDP (Eau de Parfum)** es la concentración de aceites esenciales:\n\n- **EDT (5-15% esencia)**: Más fresco, ligero y chispeante. Ideal para el día a día, trabajo, climas cálidos y ocasiones casuales (duración promedio 4 a 7 horas).\n- **EDP (15-20% esencia)**: Mayor cuerpo, profundidad y estela. Destaca por sus notas cálidas y amaderadas, perfecto para citas, noches y eventos especiales (duración promedio 7 a 10+ horas).\n\nNinguno es mejor que otro; el secreto está en elegir el adecuado según la ocasión.',
      recommendedPerfumes: [],
      quickReplies: ['Recomiéndame un EDT fresco', 'Recomiéndame un EDP duradero', 'Hacer el Test Olfativo'],
    };
  }

  // 3. Most Expensive Perfume
  if (q.includes('mas caro') || q.includes('más caro') || q.includes('mayor precio') || q.includes('mas costoso') || q.includes('más costoso')) {
    const cedrat = catalog.find(p => p.id === 'mancera-cedrat-boise');
    const cedratPrice = cedrat ? getEffectivePrice(cedrat) : 2850;
    return {
      replyText:
        `En nuestro catálogo de fragancias originales, la opción con mayor valor de perfumería nicho es **Cedrat Boise EDP de Mancera** ($${cedratPrice.toLocaleString('es-MX')} MXN), destacada por su noble mezcla de cítricos sicilianos, grosella negra y cuero refinado.\n\nSin embargo, en **Gio te perfumo** nos regimos por una regla de oro: *"El precio no define si un perfume es el ideal para ti."* Una fragancia debe elegirse por cómo conecta con tu piel, tu personalidad y la ocasión en que la usarás.\n\n¿Te gustaría que evaluemos si este perfume u otra opción se adapta mejor a tu día a día?`,
      recommendedPerfumes: [
        {
          id: 'mancera-cedrat-boise',
          whyGiobotRecommends: `Nuestra opción más exclusiva de perfumería nicho francesa ($${cedratPrice.toLocaleString('es-MX')} MXN), con una composición magistral de cítricos, maderas nobles y cuero.`,
        },
      ],
      quickReplies: ['Ver opciones accesibles', 'Perfumes para diario', 'Perfumes para citas'],
    };
  }

  // 4. Non-cataloged perfumes (Aventus, Baccarat, etc.)
  if (q.includes('aventus') || q.includes('baccarat') || q.includes('roja') || q.includes('xerjoff') || q.includes('naxos')) {
    const armaf = catalog.find(p => p.id === 'armaf-club-de-nuit-intense-man');
    const armafPrice = armaf ? getEffectivePrice(armaf) : 1150;
    const montblanc = catalog.find(p => p.id === 'montblanc-explorer');
    const montblancPrice = montblanc ? getEffectivePrice(montblanc) : 2450;
    return {
      replyText:
        'Con total transparencia y honestidad, te comento que actualmente esa fragancia específica **no se encuentra disponible en nuestro catálogo** de fragancias originales de Gio te perfumo.\n\nSin embargo, contamos con alternativas originales de excelente calidad y rendimiento con perfiles olfativos muy afines, como **Club de Nuit Intense Man** (Armaf) o **Explorer** (Montblanc).\n\n¿Te gustaría que te presente sus características y notas?',
      recommendedPerfumes: [
        {
          id: 'armaf-club-de-nuit-intense-man',
          whyGiobotRecommends: `Alternativa árabe legendaria con perfil cítrico ahumado y duración sobresaliente ($${armafPrice.toLocaleString('es-MX')} MXN).`,
        },
        {
          id: 'montblanc-explorer',
          whyGiobotRecommends: `Alternativa de diseñador refinada con bergamota, vetiver y cuero suave ($${montblancPrice.toLocaleString('es-MX')} MXN).`,
        },
      ],
      quickReplies: ['Ver Club de Nuit Intense', 'Ver Montblanc Explorer', 'Hacer el Test Olfativo'],
    };
  }

  // 5A. COMPARISON FOLLOW-UP: resolve the user's criterion instead of repeating the full comparison.
  if (
    intent === 'COMPARISON' &&
    mentionedPerfumes.length >= 2 &&
    isComparisonFollowUpText(userText) &&
    !isComparisonRequest(userText)
  ) {
    const p1 = mentionedPerfumes[0];
    const p2 = mentionedPerfumes[1];
    const normFollowUp = normalizeSearchText(userText);

    const profile = (p: Perfume) => normalizeSearchText([
      p.family, p.description, p.projection, p.sillage,
      ...(p.mainAccords || []), ...(p.topNotes || []), ...(p.heartNotes || []),
      ...(p.baseNotes || []), ...(p.recommendedOccasions || []), ...(p.strengths || [])
    ].join(' '));

    const freshnessScore = (p: Perfume) => {
      const s = profile(p);
      let score = 0;
      ['fresco','fresca','citric','bergamota','limon','toronja','pomelo','mandarina','acuatic','acuat','marino','ozon','lavanda','limpio','limpieza'].forEach(t => { if (s.includes(t)) score += 2; });
      ['cuero','incienso','oud','gourmand','dulce','ambar','resina'].forEach(t => { if (s.includes(t)) score -= 1; });
      return score;
    };

    const dailyScore = (p: Perfume) => {
      const s = normalizeSearchText((p.recommendedOccasions || []).join(' '));
      let score = 0;
      ['uso diario','diario','casual','oficina','universidad','escuela'].forEach(t => { if (s.includes(t)) score += 2; });
      return score + Math.max(0, Math.min(10, p.versatility || 0)) / 5;
    };

    let score1 = 0;
    let score2 = 0;
    const reasons: string[] = [];

    if (normFollowUp.includes('fresc')) {
      score1 += freshnessScore(p1);
      score2 += freshnessScore(p2);
      reasons.push('mayor sensación de frescura y acordes chispeantes');
    }
    if (normFollowUp.includes('diario') || normFollowUp.includes('dia a dia')) {
      score1 += dailyScore(p1);
      score2 += dailyScore(p2);
      reasons.push('mejor encaje y versatilidad para el uso diario');
    }
    if (normFollowUp.includes('dura mas') || normFollowUp.includes('duradero') || normFollowUp.includes('duracion') || normFollowUp.includes('longevidad')) {
      score1 += (p1.ratings?.durationRating || 0) * 2;
      score2 += (p2.ratings?.durationRating || 0) * 2;
      reasons.push('mayor duración y fijación en piel');
    }
    if (normFollowUp.includes('proyecta mas') || normFollowUp.includes('proyeccion') || normFollowUp.includes('estela')) {
      score1 += (p1.ratings?.projectionRating || 0) * 2;
      score2 += (p2.ratings?.projectionRating || 0) * 2;
      reasons.push('mayor proyección y alcance de estela');
    }
    if (normFollowUp.includes('llamativo') || normFollowUp.includes('destacar') || normFollowUp.includes('llamar la atencion') || normFollowUp.includes('notar') || normFollowUp.includes('presencia') || normFollowUp.includes('fiesta') || normFollowUp.includes('noche')) {
      score1 += (p1.ratings?.projectionRating || 0) * 1.5 + (p1.ratings?.durationRating || 0);
      score2 += (p2.ratings?.projectionRating || 0) * 1.5 + (p2.ratings?.durationRating || 0);
      reasons.push('mayor presencia y perfil llamativo para destacar');
    }
    if (normFollowUp.includes('amarrado') || normFollowUp.includes('amaderado')) {
      score1 += freshnessScore(p1);
      score2 += freshnessScore(p2);
    }

    if (score1 === 0 && score2 === 0) {
      score1 = dailyScore(p1);
      score2 = dailyScore(p2);
      reasons.push('mayor versatilidad para el contexto indicado');
    }

    const winner = score1 >= score2 ? p1 : p2;
    const runnerUp = winner.id === p1.id ? p2 : p1;
    const reasonText = reasons.join(' y ');

    return {
      replyText:
        `Entre **${p1.brand} ${p1.name}** y **${p2.brand} ${p2.name}**, para lo que acabas de pedir me quedaría con **${winner.brand} ${winner.name}**.\n\n` +
        `La razón principal es su **${reasonText}**. En este contexto encaja mejor que ${runnerUp.brand} ${runnerUp.name}.\n\n` +
        `Si quieres, también puedo decirte cuál de los dos conviene más por duración, proyección o clima.`,
      recommendedPerfumes: [],
      quickReplies: [`Ver más sobre ${winner.name}`, '¿Cuál dura más?', '¿Cuál proyecta más?'],
    };
  }

  // 5. COMPARISON BETWEEN PERFUMES (Strictly NO extra unsolicited cards)
  if (intent === 'COMPARISON') {
    if (mentionedPerfumes.length >= 2) {
      const p1 = mentionedPerfumes[0];
      const p2 = mentionedPerfumes[1];
      const price1 = getEffectivePrice(p1);
      const price2 = getEffectivePrice(p2);

      const promo1Str = p1.promoActive && p1.promoPriceMXN ? ` (Precio promocional: $${p1.promoPriceMXN.toLocaleString('es-MX')} MXN | Regular: $${p1.priceMXN.toLocaleString('es-MX')} MXN)` : ` ($${price1.toLocaleString('es-MX')} MXN)`;
      const promo2Str = p2.promoActive && p2.promoPriceMXN ? ` (Precio promocional: $${p2.promoPriceMXN.toLocaleString('es-MX')} MXN | Regular: $${p2.priceMXN.toLocaleString('es-MX')} MXN)` : ` ($${price2.toLocaleString('es-MX')} MXN)`;

      return {
        replyText:
          `¡Excelente comparación! Analicemos frente a frente **${p1.brand} ${p1.name}** y **${p2.brand} ${p2.name}**:\n\n` +
          `🔹 **${p1.brand} ${p1.name}**${promo1Str}:\n` +
          `- **Familia**: ${p1.family} (${p1.concentration})\n` +
          `- **Notas clave**: ${p1.topNotes.slice(0, 2).join(', ')} en salida; fondo de ${p1.baseNotes.slice(0, 2).join(', ')}.\n` +
          `- **Rendimiento**: Duración aprox. **${p1.duration}** con proyección ${p1.projection.toLowerCase()}.\n` +
          `- **Ocasiones ideales**: ${p1.recommendedOccasions.slice(0, 3).join(', ')}.\n\n` +
          `🔹 **${p2.brand} ${p2.name}**${promo2Str}:\n` +
          `- **Familia**: ${p2.family} (${p2.concentration})\n` +
          `- **Notas clave**: ${p2.topNotes.slice(0, 2).join(', ')} en salida; fondo de ${p2.baseNotes.slice(0, 2).join(', ')}.\n` +
          `- **Rendimiento**: Duración aprox. **${p2.duration}** con proyección ${p2.projection.toLowerCase()}.\n` +
          `- **Ocasiones ideales**: ${p2.recommendedOccasions.slice(0, 3).join(', ')}.\n\n` +
          `¿Para qué ocasión o momento principal estás evaluando elegir entre ambos?`,
        recommendedPerfumes: [],
        quickReplies: ['¿Cuál dura más?', '¿Cuál es más fresco?', '¿Para diario cuál?'],
      };
    } else if (mentionedPerfumes.length === 1) {
      const p = mentionedPerfumes[0];
      const otherMatches = findMentionedPerfumes(userText, catalog).filter(m => m.id !== p.id);
      if (otherMatches.length > 1) {
        return {
          replyText:
            `En nuestro catálogo contamos con varias opciones de esa línea: ${otherMatches.map(m => `**${m.brand} ${m.name}**`).join(', ')}.\n\n` +
            `¿Con cuál de ellas te gustaría comparar a **${p.name}**?`,
          recommendedPerfumes: [],
          quickReplies: otherMatches.slice(0, 3).map(m => `Con ${m.name}`),
        };
      }
      return {
        replyText:
          `Ya tengo a **${p.brand} ${p.name}** como punto de partida. ¿Con qué otra fragancia de nuestro catálogo te gustaría compararlo para contrastar notas, duración y ocasiones?`,
        recommendedPerfumes: [],
        quickReplies: ['Comparar con Sauvage', 'Comparar con Explorer', 'Comparar con Club de Nuit'],
      };
    }
  }

  // 6. DIRECT PRODUCT QUESTION (User asks about a single perfume: price, budget match, duration, etc.)
  if (intent === 'PRODUCT_QUESTION' && mentionedPerfumes.length > 0) {
    const p = mentionedPerfumes[0];
    const effPrice = getEffectivePrice(p);
    const hasPromo = p.promoActive === true && typeof p.promoPriceMXN === 'number' && p.promoPriceMXN > 0;
    const userBudget = criteria.maxBudgetMXN;

    const asksAboutBudgetOrPrice =
      q.includes('tengo') ||
      q.includes('presupuesto') ||
      q.includes('precio') ||
      q.includes('cuesta') ||
      q.includes('vale') ||
      q.includes('alcanza') ||
      typeof userBudget === 'number';

    if (asksAboutBudgetOrPrice) {
      let priceSection = '';
      if (hasPromo) {
        priceSection =
          `Precio promocional actual: $${p.promoPriceMXN!.toLocaleString('es-MX')} MXN.\n` +
          `Precio regular: $${p.priceMXN.toLocaleString('es-MX')} MXN.` +
          (p.promoLabel ? ` (${p.promoLabel})` : '');
      } else {
        priceSection = `Precio regular: $${p.priceMXN.toLocaleString('es-MX')} MXN.`;
      }

      let budgetAnalysis = '';
      if (typeof userBudget === 'number' && userBudget > 0) {
        if (userBudget < effPrice) {
          const diffPromo = effPrice - userBudget;
          const diffRegular = p.priceMXN - userBudget;
          if (hasPromo) {
            budgetAnalysis =
              `\n\nCon tu presupuesto actual de **$${userBudget.toLocaleString('es-MX')} MXN**, te faltan únicamente **$${diffPromo.toLocaleString('es-MX')} MXN** para aprovechar su precio promocional (o $${diffRegular.toLocaleString('es-MX')} MXN respecto a su precio regular).`;
          } else {
            budgetAnalysis =
              `\n\nCon tu presupuesto actual de **$${userBudget.toLocaleString('es-MX')} MXN**, te faltan **$${diffRegular.toLocaleString('es-MX')} MXN** para alcanzar su valor de catálogo.`;
          }
        } else {
          budgetAnalysis =
            `\n\n¡Buenas noticias! Con tu presupuesto de **$${userBudget.toLocaleString('es-MX')} MXN** te alcanza perfectamente para adquirirlo` +
            (hasPromo ? ` aprovechando su precio promocional de **$${p.promoPriceMXN!.toLocaleString('es-MX')} MXN**.` : '.');
        }
      }

      return {
        replyText:
          `Sobre **${p.brand} ${p.name}**:\n\n${priceSection}${budgetAnalysis}\n\n` +
          `Es una fragancia de la familia **${p.family}** (${p.concentration}) que destaca por su duración de **${p.duration}** y notas de ${p.topNotes.slice(0, 2).join(', ')} con fondo de ${p.baseNotes.slice(0, 2).join(', ')}. Muy versátil tanto para oficina como para citas y eventos especiales.\n\n` +
          (userBudget && userBudget < effPrice
            ? `¿Te gustaría que te muestre otras opciones disponibles dentro de tu presupuesto de $${userBudget.toLocaleString('es-MX')} MXN o prefieres conocer más sobre este perfume?`
            : `¿Deseas conocer más detalles de sus notas u ocasiones ideales de uso?`),
        recommendedPerfumes: [],
        quickReplies: [
          userBudget && userBudget < effPrice
            ? `¿Qué otras opciones tengo por $${userBudget.toLocaleString('es-MX')}?`
            : 'Ver ocasiones de uso',
          '¿Cuánto dura en piel?',
          '¿Cómo aplicarlo correctamente?',
        ],
      };
    }

    // Longevity / Duration question
    if (q.includes('dura') || q.includes('fija') || q.includes('rendimiento') || q.includes('estela')) {
      return {
        replyText:
          `En piel, **${p.brand} ${p.name}** ofrece una duración promedio de **${p.duration}**, con una proyección **${p.projection.toLowerCase()}** y estela ${p.sillage?.toLowerCase() || 'notable'}.\n\n` +
          `Su desarrollo abre con notas de ${p.topNotes.join(', ')} y fija sobre un fondo elegante de ${p.baseNotes.join(', ')}.\n\n` +
          `¿Te gustaría saber cómo aplicarlo correctamente para maximizar su fijación o en qué clima destaca más?`,
        recommendedPerfumes: [],
        quickReplies: ['¿Cómo aplicarlo correctamente?', 'Mejor clima y horario', 'Hacer el Test Olfativo'],
      };
    }

    // General product info
    const priceLine = hasPromo
      ? `Precio promocional actual: $${p.promoPriceMXN!.toLocaleString('es-MX')} MXN. Precio regular: $${p.priceMXN.toLocaleString('es-MX')} MXN.`
      : `Precio: $${p.priceMXN.toLocaleString('es-MX')} MXN.`;

    return {
      replyText:
        `**${p.brand} ${p.name}** (${p.concentration}):\n\n` +
        `${p.description}\n\n` +
        `• **Familia**: ${p.family}\n` +
        `• **Salida**: ${p.topNotes.join(', ')}\n` +
        `• **Fondo**: ${p.baseNotes.join(', ')}\n` +
        `• **Duración**: ${p.duration} (Proyección ${p.projection.toLowerCase()})\n` +
        `• **${priceLine}**\n\n` +
        `¿Te gustaría saber si se adapta a una ocasión específica o compararlo con otra opción?`,
      recommendedPerfumes: [],
      quickReplies: ['¿Para qué ocasiones es mejor?', '¿Cuánto dura en piel?', 'Hacer el Test Olfativo'],
    };
  }

  // 7. ALTERNATIVES REQUEST (User explicitly asks for alternatives or other options for budget)
  if (intent === 'ALTERNATIVES_REQUEST') {
    const matched = rankPerfumesByCompatibility(catalog, criteria, 3);
    const recs = matched.map(m => ({
      id: m.perfume.id,
      whyGiobotRecommends: m.whyGiobotRecommends,
    }));

    const budgetStr = criteria.maxBudgetMXN ? ` dentro de tu presupuesto de **$${criteria.maxBudgetMXN.toLocaleString('es-MX')} MXN**` : '';

    return {
      replyText:
        `¡Con gusto! Aquí tienes excelentes opciones originales${budgetStr}, seleccionadas por su alto rendimiento, calidad de ingredientes y gran compatibilidad:`,
      recommendedPerfumes: recs,
      quickReplies: ['Ver notas detalladas', '¿Cuál dura más de estas?', '¿Cómo aplicarlos correctamente?'],
    };
  }

  // 8. Follow-up comparative questions (longevity, projection, etc.) on past recommendations
  if (
    q.includes('duracion') ||
    q.includes('duración') ||
    q.includes('dura mas') ||
    q.includes('dura más') ||
    q.includes('fijacion') ||
    q.includes('fijación') ||
    q.includes('de los que me recomendaste') ||
    q.includes('cual me recomiendas de esos') ||
    q.includes('cuál me recomiendas de esos')
  ) {
    const matched = rankPerfumesByCompatibility(catalog, criteria, 3);
    if (matched.length > 0) {
      const sortedByDuration = [...matched].sort(
        (a, b) => (b.perfume.ratings?.durationRating || 0) - (a.perfume.ratings?.durationRating || 0)
      );
      const best = sortedByDuration[0].perfume;
      const others = sortedByDuration.slice(1);
      const othersText = others.length > 0 
        ? others.map(m => `**${m.perfume.brand} ${m.perfume.name}** (${m.perfume.duration}, calificación ${m.perfume.ratings?.durationRating || 8}/10)`).join(' y ')
        : '';

      const comparisonText = othersText 
        ? `\n\nEn comparación, ${othersText} también tienen un rendimiento destacado, pero con un desarrollo más ligero o íntimo.`
        : '';

      return {
        replyText: `De las fragancias recomendadas, la que ofrece **mayor duración y fijación** es **${best.brand} ${best.name}**, alcanzando aproximadamente **${best.duration}** en piel con una calificación de fijación de **${best.ratings?.durationRating || 9}/10** y estela ${best.sillage?.toLowerCase() || 'notable'}.${comparisonText}\n\n¿Te gustaría conocer más sobre sus notas olfativas o cómo aplicarlo para maximizar su fijación?`,
        recommendedPerfumes: sortedByDuration.map(m => ({
          id: m.perfume.id,
          whyGiobotRecommends: `${m.perfume.duration} de fijación sobresaliente. ${m.whyGiobotRecommends}`,
        })),
        quickReplies: ['¿Cómo aplicarlo correctamente?', 'Ver pirámide olfativa completa', 'Ajustar presupuesto'],
      };
    }
  }

  // 9. Direct recommendation if sufficient info
  if (hasSufficientCriteriaForRecommendation(criteria)) {
    const matched = rankPerfumesByCompatibility(catalog, criteria, 3);
    const recs = matched.map(m => ({
      id: m.perfume.id,
      whyGiobotRecommends: m.whyGiobotRecommends,
    }));

    const contextParts: string[] = [];
    if (criteria.occasion) contextParts.push(`para **${criteria.occasion}**`);
    if (criteria.maxBudgetMXN) contextParts.push(`con presupuesto de hasta **$${criteria.maxBudgetMXN.toLocaleString('es-MX')} MXN**`);
    if (criteria.olfactoryPreferences && criteria.olfactoryPreferences.length > 0) {
      contextParts.push(`con notas de **${criteria.olfactoryPreferences.join(', ')}**`);
    }
    if (criteria.dislikes && criteria.dislikes.length > 0) {
      contextParts.push(`evitando notas de **${criteria.dislikes.join(', ')}**`);
    }
    if (criteria.desiredEmotions && criteria.desiredEmotions.length > 0) {
      contextParts.push(`proyectando **${criteria.desiredEmotions.join(' y ')}**`);
    }

    const summaryStr = contextParts.length > 0 ? ` Tomando en cuenta tu búsqueda ${contextParts.join(', ')}, ` : ' ';

    return {
      replyText: `¡Excelente!${summaryStr}he analizado nuestro catálogo aplicando el **Método de Giobot** y seleccioné estas fragancias originales de máxima compatibilidad para ti. Cada una cumple estrictamente con tu presupuesto y resalta por su rendimiento y armonía:`,
      recommendedPerfumes: recs,
      quickReplies: [
        criteria.maxBudgetMXN ? `¿Y si puedo gastar hasta $${(criteria.maxBudgetMXN + 500).toLocaleString('es-MX')}?` : 'Ajustar presupuesto',
        'Ver opciones con mayor fijación',
        '¿Cómo aplicarlo correctamente?',
      ],
    };
  }

  // 10. Discovery phase: ASK ONLY WHAT IS MISSING
  const missingQuestions: string[] = [];
  if (!criteria.occasion) {
    missingQuestions.push('¿Para qué ocasión principal buscas tu perfume (diario, oficina, citas o eventos especiales)?');
  }
  if (!criteria.olfactoryPreferences || criteria.olfactoryPreferences.length === 0) {
    missingQuestions.push('¿Qué familias o notas aromáticas disfrutas más (fresco, cítrico, dulce, amaderado, especiado)?');
  }
  if (!criteria.maxBudgetMXN) {
    missingQuestions.push('¿Cuentas con algún presupuesto o rango de precio en mente?');
  }

  const knownParts: string[] = [];
  if (criteria.occasion) knownParts.push(`ocasión: ${criteria.occasion}`);
  if (criteria.maxBudgetMXN) knownParts.push(`presupuesto máx: $${criteria.maxBudgetMXN.toLocaleString('es-MX')} MXN`);
  if (criteria.olfactoryPreferences?.length) knownParts.push(`aromas: ${criteria.olfactoryPreferences.join(', ')}`);
  if (criteria.dislikes?.length) knownParts.push(`sin: ${criteria.dislikes.join(', ')}`);

  const ackText = knownParts.length > 0 ? `¡Perfecto! Ya tengo presente: **${knownParts.join(' · ')}**.\n\n` : '¡Hola! Qué gusto saludarte.\n\n';
  const questionsFormatted = missingQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');

  return {
    replyText: `${ackText}Para afinar la recomendación perfecta y darte las mejores opciones, me ayudaría conocer:\n\n${questionsFormatted}`,
    recommendedPerfumes: [],
    quickReplies: [
      !criteria.occasion ? 'Para fiesta de gala' : 'Para citas románticas',
      !criteria.maxBudgetMXN ? 'Menos de $1,500 MXN' : 'Fresco y cítrico',
      'Hacer el Test Olfativo',
    ],
  };
}

// API Routes
app.get('/api/perfumes', (req, res) => {
  const { family, search, maxPrice, occasion } = req.query;
  let result = [...PERFUMES_DATABASE];

  if (family && typeof family === 'string') {
    result = result.filter(p => p.family.toLowerCase() === family.toLowerCase());
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    const price = Number(maxPrice);
    result = result.filter(p => p.priceMXN <= price);
  }

  if (occasion && typeof occasion === 'string') {
    const occ = occasion.toLowerCase();
    result = result.filter(p => p.recommendedOccasions.some(o => o.toLowerCase().includes(occ)));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        p.mainAccords.some(a => a.toLowerCase().includes(q)) ||
        p.topNotes.some(n => n.toLowerCase().includes(q)) ||
        p.heartNotes.some(n => n.toLowerCase().includes(q)) ||
        p.baseNotes.some(n => n.toLowerCase().includes(q))
    );
  }

  res.json({ perfumes: result, total: result.length });
});

// Single Perfume by ID
app.get('/api/perfumes/:id', (req, res) => {
  const perfume = PERFUMES_DATABASE.find(p => p.id === req.params.id);
  if (!perfume) {
    return res.status(404).json({ error: 'Perfume no encontrado en el catálogo de Gio te perfumo.' });
  }
  res.json(perfume);
});

// Quiz Recommendation Endpoint
app.post('/api/giobot/quiz-recommend', async (req, res) => {
  try {
    const { answers } = req.body as { answers: DiscoveryQuizAnswers };

    const criteria = convertQuizToCriteria(answers);
    const topRecommendations = rankPerfumesByCompatibility(PERFUMES_DATABASE, criteria, 4);

    let giobotExplanation = '';

    if (ai) {
      try {
        const prompt = `
El cliente completó el test interactivo con las siguientes respuestas:
- Preferencia de género: ${answers.genderPreference || 'Sin preferencia'}
- Ocasión de uso: ${answers.occasion || 'No especificada'}
- Presupuesto máximo: ${answers.budgetMXNMax ? `$${answers.budgetMXNMax.toLocaleString('es-MX')} MXN` : 'Sin límite'}
- Familia / Preferencia olfativa: ${answers.olfactoryFamily || 'Variada'}
- Notas favoritas: ${answers.preferredNotes?.join(', ') || 'Sin especificar'}
- Personalidad / Estilo: ${answers.personalityStyle || 'No especificado'}
- Emoción deseada: ${answers.desiredEmotion || 'No especificada'}
- Clima: ${answers.weather || 'Templado'}

Los perfumes recomendados determinísticamente por compatibilidad son:
${topRecommendations
  .map(
    r =>
      `- ${r.perfume.brand} ${r.perfume.name} (${r.compatibilityScore}% compatibilidad): $${r.perfume.priceMXN.toLocaleString('es-MX')} MXN. Notas: ${r.perfume.topNotes.slice(0, 2).join(', ')} / ${r.perfume.baseNotes.slice(0, 2).join(', ')}. Ocasión: ${r.perfume.recommendedOccasions.join(', ')}`
  )
  .join('\n')}

Escribe un mensaje entusiasta, amigable, honesto y profesional de Giobot presentando estas opciones seleccionadas.
Sigue estrictamente las 20 reglas del Manual de Giobot y la Filosofía de Gio te perfumo.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: buildGiobotOfficialBrainPrompt(),
          },
        });

        giobotExplanation = response.text || '';
      } catch (err) {
        console.error('Error generating AI explanation for quiz:', err);
      }
    }

    if (!giobotExplanation) {
      giobotExplanation = `¡Hola! Con base en tus respuestas de ocasión (${answers.occasion || 'uso general'}), presupuesto y estilo, he evaluado nuestro catálogo aplicando el Método de Giobot y seleccioné estas fragancias originales de alta compatibilidad para ti.`;
    }

    res.json({
      giobotText: giobotExplanation,
      recommendations: topRecommendations,
    });
  } catch (err: any) {
    console.error('Quiz recommendation error:', err);
    res.status(500).json({ error: 'Error al procesar la recomendación de Giobot.' });
  }
});

// Interactive Chat Endpoint
app.post('/api/giobot/chat', async (req, res) => {
  try {
    const { messages, userProfile, conversationProfile, catalogSnapshot } = req.body as {
      messages: { role: 'user' | 'assistant'; text: string }[];
      userProfile?: DiscoveryQuizAnswers;
      conversationProfile?: UserCriteria;
      catalogSnapshot?: Perfume[];
    };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un mensaje.' });
    }

    const validSnapshot = Array.isArray(catalogSnapshot)
      ? catalogSnapshot.filter(p =>
          p && typeof p.id === 'string' && typeof p.name === 'string' &&
          typeof p.brand === 'string' && typeof p.priceMXN === 'number' &&
          Array.isArray(p.topNotes) && Array.isArray(p.baseNotes)
        )
      : [];
    const requestCatalog = validSnapshot.length > 0
      ? validSnapshot
      : applyLiveCatalogPricing(PERFUMES_DATABASE);

    const lastUserMessage = messages[messages.length - 1].text;

    // Detección precisa de la intención del usuario y de perfumes mencionados
    const { intent: detectedIntent, mentionedPerfumes } = detectConversationIntent(lastUserMessage, requestCatalog);

    const isDirectProductQuestion = detectedIntent === 'PRODUCT_QUESTION';
    const isComparison = detectedIntent === 'COMPARISON';
    const isEducational = detectedIntent === 'EDUCATIONAL';
    const isAlternatives = detectedIntent === 'ALTERNATIVES_REQUEST';
    const isExplicitRecRequest = detectedIntent === 'RECOMMENDATION_REQUEST';

    // Build the accumulated profile by progressively aggregating from quiz, stored state and ALL message history
    let accumulatedCriteria: UserCriteria = {
      ...(userProfile ? convertQuizToCriteria(userProfile) : {}),
      ...(conversationProfile || {}),
    };

    // Incrementally process all messages to capture and update criteria
    accumulatedCriteria = accumulateCriteriaFromHistory(messages, accumulatedCriteria, requestCatalog);

    const activeSelectedPerfumeId = accumulatedCriteria.activeSearch?.selectedPerfumeId;
    const isProductFollowUp =
      detectedIntent === 'ACTIVE_SEARCH_CONTINUATION' &&
      Boolean(activeSelectedPerfumeId) &&
      isProductFollowUpText(lastUserMessage) &&
      !isNewSearchInitiation(lastUserMessage);
    const shouldHandleAsProductQuestion = isDirectProductQuestion || isProductFollowUp;

    const activeComparisonIds = accumulatedCriteria.activeSearch?.comparedPerfumeIds || [];
    const isAwaitingSecondPerfume = Boolean(accumulatedCriteria.activeSearch?.awaitingSecondComparisonPerfume);
    const isComparisonFollowUp =
      activeComparisonIds.length >= 2 &&
      isComparisonFollowUpText(lastUserMessage) &&
      !isNewSearchInitiation(lastUserMessage);
    const shouldHandleAsComparison =
      isComparison ||
      isComparisonFollowUp ||
      isAwaitingSecondPerfume ||
      (activeComparisonIds.length >= 2 && !isNewSearchInitiation(lastUserMessage) && !isExplicitRecRequest && !isAlternatives);

    const isRecommendationIntent =
      isAlternatives ||
      isExplicitRecRequest ||
      (detectedIntent === 'ACTIVE_SEARCH_CONTINUATION' && hasSufficientCriteriaForRecommendation(accumulatedCriteria));

    const normalizedLastMessage = normalizeSearchText(lastUserMessage);
    const requestedCategory = accumulatedCriteria.preferredCategory;
    const asksCategoryRanking = Boolean(
      requestedCategory &&
      /(mayor duracion|dura mas|mas duradero|mejor fijacion|recomienda|recomendacion|cuales|opciones)/.test(normalizedLastMessage)
    );

    let resultJson: {
      replyText: string;
      extractedCriteria?: UserCriteria;
      recommendedPerfumes?: Array<{ id: string; whyGiobotRecommends?: string }>;
      quickReplies?: string[];
    } | null = null;

    if (ai) {
      try {
        const conversationContext = messages
          .map(m => `${m.role === 'user' ? 'Cliente' : 'Giobot'}: ${m.text}`)
          .join('\n');

        const mentionedSummary = mentionedPerfumes.length > 0
          ? mentionedPerfumes.map(p => {
              const eff = getEffectivePrice(p);
              const promoInfo = p.promoActive && p.promoPriceMXN ? `Promo activa: $${p.promoPriceMXN} MXN (Regular: $${p.priceMXN} MXN)` : `Precio regular: $${p.priceMXN} MXN`;
              return `• ${p.brand} ${p.name} (id: "${p.id}", ${promoInfo}, ${p.duration}, ${p.family})`;
            }).join('\n')
          : 'Ninguno';

        const fullPrompt = `
HISTORIAL COMPLETO DE LA CONVERSACIÓN:
${conversationContext}

PERFIL ACUMULADO DEL CLIENTE HASTA EL MOMENTO (MEMORIA CONVERSACIONAL ACTIVA):
${JSON.stringify(accumulatedCriteria, null, 2)}

ÚLTIMO MENSAJE DEL CLIENTE:
"${lastUserMessage}"

DIAGNÓSTICO AUTOMÁTICO DE INTENCIÓN:
- Intención clasificada: ${detectedIntent}
- Perfumes del catálogo identificados en el mensaje:
${mentionedSummary}

INSTRUCCIONES CLAVE DE DECISIÓN (CEREBRO DE GIOBOT):
1. PREGUNTAS DIRECTAS SOBRE UN PRODUCTO O COMPARACIONES (REGLA MANDATORIA DE ORO):
   - ${isDirectProductQuestion ? `ALERTA MÁXIMA: El cliente pregunta DIRECTAMENTE sobre un perfume específico del catálogo.
     * Responde ÚNICA Y DIRECTAMENTE sobre ese perfume.
     * Si pregunta de precio/presupuesto (ej. "tengo $3,400 y quiero Bleu de Chanel"):
       - Si tiene promoción activa, menciona de manera obligatoria y textual:
         "Precio promocional actual: $X MXN. Precio regular: $Y MXN."
       - Compara el presupuesto del cliente con el precio vigente: si le faltan $100 respecto al precio promocional, dilo con honestidad y empatía.
     * REGLA DE SALIDA: "recommendedPerfumes" DEBE IR ESTRICTAMENTE VACÍO []. PROHIBIDO adjuntar tarjetas de otros perfumes no solicitados.` : 'Si el cliente hace preguntas sobre un producto específico, responde directo y no agregues tarjetas no solicitadas.'}
   - ${isComparison ? `ALERTA DE COMPARACIÓN: El cliente solicita comparar dos fragancias.
     * Realiza un análisis comparativo frente a frente (notas, duración, proyección, ocasiones y precios vigentes).
     * REGLA DE SALIDA: "recommendedPerfumes" DEBE IR ESTRICTAMENTE VACÍO []. NO recomiendes otros perfumes.` : ''}
   - ${isEducational ? `ALERTA EDUCATIVA: El cliente hace una pregunta conceptual o de perfumería.
     * Educa con sencillez y pasión.
     * REGLA DE SALIDA: "recommendedPerfumes" DEBE IR ESTRICTAMENTE VACÍO [].` : ''}

2. SOLICITUDES DE ALTERNATIVAS O RECOMENDACIÓN:
   - ${isAlternatives || isExplicitRecRequest ? `El cliente ha solicitado alternativas u opciones dentro de su presupuesto o criterios.
     * Aquí SÍ debes recomendar de 2 a 3 perfumes compatibles del catálogo de Gio te perfumo que respeten estrictamente su presupuesto.` : 'Si el cliente no pidió recomendaciones ni alternativas, concéntrate en responder su inquietud.'}

3. RESTRICCIÓN DURA DE PRESUPUESTO (HARD CONSTRAINT):
   - Si el presupuesto máximo actual es $1,500 MXN o $3,400 MXN, NINGUNA recomendación puede costar más de ese monto, evaluando siempre el precio efectivo (promoPriceMXN si promoActive es true, o priceMXN regular).

4. CONSERVACIÓN DE MEMORIA Y NO REPETICIÓN:
   - NUNCA vuelvas a preguntar datos que el cliente ya proporcionó (ocasión, presupuesto, aromas).
   - En "extractedCriteria", devuelve el perfil COMPLETO acumulado y actualizado.

RESPONDE EXCLUSIVAMENTE EN FORMATO JSON VÁLIDO CON ESTA ESTRUCTURA:
{
  "replyText": "Tu respuesta conversacional con el tono cálido, profesional, respetuoso y honesto de Giobot.",
  "extractedCriteria": {
    "genderPreference": "Caballero | Dama | Unisex | Todos",
    "preferredCategory": "Árabe | Diseñador | Nicho",
    "maxBudgetMXN": 1500,
    "occasion": "Fiesta de gala",
    "olfactoryPreferences": ["fresco", "cítrico"],
    "dislikes": ["dulce"],
    "personalityStyle": "Llamativo / Presencia",
    "desiredEmotions": ["Destacar", "Elegancia"]
  },
  "recommendedPerfumes": [
    {
      "id": "id-exacto-del-catalogo",
      "whyGiobotRecommends": "Explicación clara de por qué encaja con la ocasión, presupuesto y notas solicitadas."
    }
  ],
  "quickReplies": ["Opción de seguimiento 1", "Opción 2", "Opción 3"]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction: buildGiobotOfficialBrainPrompt(requestCatalog),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replyText: { type: Type.STRING },
                extractedCriteria: {
                  type: Type.OBJECT,
                  properties: {
                    genderPreference: { type: Type.STRING },
                    preferredCategory: { type: Type.STRING },
                    maxBudgetMXN: { type: Type.NUMBER },
                    occasion: { type: Type.STRING },
                    olfactoryPreferences: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    dislikes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    personalityStyle: { type: Type.STRING },
                    desiredEmotions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
                recommendedPerfumes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      whyGiobotRecommends: { type: Type.STRING },
                    },
                    required: ['id'],
                  },
                },
                quickReplies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['replyText'],
            },
          },
        });

        if (response.text) {
          resultJson = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.error('Gemini generation error, using deterministic expert engine fallback:', geminiErr);
      }
    }

    // If Gemini was offline or didn't return, use deterministic expert engine
    if (!resultJson || !resultJson.replyText) {
      resultJson = generateLocalGiobotResponse(lastUserMessage, accumulatedCriteria, messages, requestCatalog);
    }

    if (asksCategoryRanking && requestedCategory) {
      const eligible = requestCatalog
        .filter(p => checkHardConstraints(p, accumulatedCriteria).eligible)
        .sort((a, b) =>
          (b.ratings?.durationRating || 0) - (a.ratings?.durationRating || 0) ||
          (b.ratings?.projectionRating || 0) - (a.ratings?.projectionRating || 0)
        )
        .slice(0, 3);

      if (eligible.length > 0) {
        const detail = eligible
          .map((p, index) => `${index + 1}. **${p.brand} ${p.name}** — ${p.duration}; fijación ${p.ratings?.durationRating || 'sin calificación'}/10.`)
          .join('\n');
        resultJson = {
          replyText: `Según las fichas vigentes de nuestro catálogo, los perfumes **${requestedCategory.toLowerCase()}s** con mayor duración son:\n\n${detail}\n\nLa duración puede variar según la piel, el clima y la cantidad aplicada. ¿Quieres que compare sus notas, precio y ocasión de uso?`,
          extractedCriteria: accumulatedCriteria,
          recommendedPerfumes: eligible.map(p => ({
            id: p.id,
            whyGiobotRecommends: `${p.duration} de duración estimada y ${p.ratings?.durationRating || 'alto rendimiento'}/10 en fijación según su ficha.`,
          })),
          quickReplies: ['Comparar sus notas', '¿Cuál conviene para diario?', 'Ver precios'],
        };
      } else {
        resultJson = {
          replyText: `Ahora mismo no encuentro perfumes de categoría **${requestedCategory}** disponibles que cumplan con los demás filtros de tu búsqueda.`,
          extractedCriteria: accumulatedCriteria,
          recommendedPerfumes: [],
          quickReplies: ['Quitar filtros', 'Ver todo el catálogo'],
        };
      }
    }

    // Preguntas directas y comparaciones se resuelven de forma determinista con el catálogo vivo.
    // Así Gemini no puede cambiar de intención, reinyectar un presupuesto viejo ni omitir uno de los productos.
    if (shouldHandleAsProductQuestion || shouldHandleAsComparison) {
      resultJson = generateLocalGiobotResponse(lastUserMessage, accumulatedCriteria, messages, requestCatalog);
    }

    // Merge any extracted criteria from AI back into accumulated criteria
    if (resultJson.extractedCriteria && !shouldHandleAsComparison) {
      accumulatedCriteria = {
        ...accumulatedCriteria,
        ...Object.fromEntries(
          Object.entries(resultJson.extractedCriteria).filter(([_, v]) => v !== undefined && v !== null)
        ),
      };
    }

    // Always re-apply deterministic extraction from the conversation as high-integrity guardrail
    accumulatedCriteria = accumulateCriteriaFromHistory(messages, accumulatedCriteria, requestCatalog);

    // CRITICAL GUARDRAIL:
    // If the user is asking a direct question about a product, comparing perfumes, or asking an educational question,
    // NEVER attach unsolicited recommendation cards!
    const effectiveRecommendationIntent = isRecommendationIntent || asksCategoryRanking;
    if (!effectiveRecommendationIntent || shouldHandleAsProductQuestion || shouldHandleAsComparison || isEducational) {
      resultJson.recommendedPerfumes = [];
    }

    // Auto-generate recommendations ONLY if this is a genuine recommendation intent AND rawList is empty
    let rawList = resultJson.recommendedPerfumes || [];
    if (
      effectiveRecommendationIntent &&
      !shouldHandleAsProductQuestion &&
      !shouldHandleAsComparison &&
      !isEducational &&
      (!rawList || rawList.length === 0) &&
      (hasSufficientCriteriaForRecommendation(accumulatedCriteria) || isAlternatives)
    ) {
      const matched = rankPerfumesByCompatibility(requestCatalog, accumulatedCriteria, 3);
      rawList = matched.map(m => ({
        id: m.perfume.id,
        whyGiobotRecommends: m.whyGiobotRecommends,
      }));
    }

    // Resolve recommended perfumes with STRICT DETERMINISTIC COMPATIBILITY
    const recommendedPerfumes: CompatibilityResult[] = [];

    if (
      effectiveRecommendationIntent &&
      !shouldHandleAsProductQuestion &&
      !shouldHandleAsComparison &&
      !isEducational &&
      Array.isArray(rawList) &&
      rawList.length > 0
    ) {
      rawList.forEach(item => {
        const id = typeof item === 'string' ? item : item?.id;
        if (!id) return;

        const found = requestCatalog.find(p => p.id === id);
        if (!found) return;

        // Verify HARD CONSTRAINTS (Strict budget & gender check)
        const hardCheck = checkHardConstraints(found, accumulatedCriteria);
        if (!hardCheck.eligible) {
          return;
        }

        // Calculate deterministic compatibility score using the 100-point formula
        const deterministicResult = calculateExactCompatibility(found, accumulatedCriteria);

        const whyRecommends =
          typeof item === 'object' && item.whyGiobotRecommends
            ? item.whyGiobotRecommends
            : deterministicResult.whyGiobotRecommends;

        recommendedPerfumes.push({
          perfume: found,
          compatibilityScore: deterministicResult.compatibilityScore,
          matchReasons: deterministicResult.matchReasons,
          whyGiobotRecommends: whyRecommends,
        });
      });

      // If all passed filters are below the count or empty, fill with top eligible from catalog
      if (
        effectiveRecommendationIntent &&
        !isDirectProductQuestion &&
        !shouldHandleAsComparison &&
        !isEducational &&
        recommendedPerfumes.length === 0 &&
        hasSufficientCriteriaForRecommendation(accumulatedCriteria)
      ) {
        const fallbackRanked = rankPerfumesByCompatibility(requestCatalog, accumulatedCriteria, 3);
        fallbackRanked.forEach(rec => {
          recommendedPerfumes.push(rec);
        });
      }

      // Preserve the requested ranking criterion. Otherwise use compatibility.
      recommendedPerfumes.sort((a, b) =>
        asksCategoryRanking
          ? (b.perfume.ratings?.durationRating || 0) - (a.perfume.ratings?.durationRating || 0)
          : b.compatibilityScore - a.compatibilityScore
      );

      // Ensure slight realistic descending differentiation if identical
      recommendedPerfumes.forEach((rec, idx) => {
        if (idx > 0 && rec.compatibilityScore >= recommendedPerfumes[idx - 1].compatibilityScore) {
          rec.compatibilityScore = Math.max(65, recommendedPerfumes[idx - 1].compatibilityScore - (idx + 1));
        }
      });
    }

    const normalizedReplyText = (resultJson.replyText || '').replace(/\\n/g, '\n');

    res.json({
      replyText: normalizedReplyText,
      recommendations: recommendedPerfumes,
      quickReplies: resultJson.quickReplies || [],
      conversationProfile: accumulatedCriteria,
    });
  } catch (err: any) {
    console.error('Chat endpoint fatal error:', err);
    res.status(500).json({
      replyText:
        '¡Hola! Soy Giobot de Gio te perfumo. Cuéntame: ¿qué tipo de fragancia o presupuesto tienes en mente para asesorarte con nuestro catálogo?',
      recommendations: [],
      quickReplies: ['Perfumes para oficina', 'Perfumes para citas', 'Ver todo el catálogo'],
    });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
