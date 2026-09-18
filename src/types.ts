export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Extrait de Parfum' | 'Elixir' | 'Cologne';

export type OlfactoryFamily =
  | 'Cítrica'
  | 'Fresca / Acuática'
  | 'Aromática Acuática'
  | 'Amaderada'
  | 'Amaderada Especiada'
  | 'Amaderada Aromática'
  | 'Amaderada Especiada Gourmand'
  | 'Oriental / Ambarada'
  | 'Gourmand / Dulce'
  | 'Especiada'
  | 'Floral'
  | 'Aromática / Fougère'
  | 'Cuero / Cuero Elegante'
  | (string & {});

export type PriceCategory = 'Accesible' | 'Intermedio' | 'Premium' | 'Lujo';
export type StockStatus = 'Disponible' | 'Agotado' | 'Pocas Unidades' | 'Sobre pedido' | 'Reservado';

export interface PerfumeRatings {
  aromaQuality?: number;
  durationRating?: number;
  projectionRating?: number;
  versatilityRating?: number;
  valueRating?: number;
  originalityRating?: number;
  verdict?: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  country: string;
  year: number;
  perfumer?: string;
  line?: string;
  category?: 'Diseñador' | 'Árabe' | 'Nicho' | 'Accesible';
  gender?: 'Masculino' | 'Femenino' | 'Unisex' | string;
  status?: string;
  family: OlfactoryFamily;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  mainAccords: string[];
  concentration: Concentration;
  duration: string; // e.g. "8-12 horas"
  projection: string; // e.g. "Alta (1.5 - 2 metros)"
  sillage: string; // e.g. "Moderada a Intensa"
  bestSeason: ('Primavera' | 'Verano' | 'Otoño' | 'Invierno')[];
  bestTime: ('Día' | 'Noche' | 'Día y Noche')[];
  recommendedOccasions: string[];
  occasionsIdeal?: string[];
  occasionsPossible?: string[];
  occasionsNotRecommended?: string[];
  personalityMatch: string[];
  personalityPoints?: string[];
  lifestyleMatch?: string[];
  emotions: string[];
  emotionsForUser?: string[];
  emotionsProjected?: string[];
  giobotAnalysis?: string;
  strengths?: string[];
  aspectsToConsider?: string[];
  ratings?: PerfumeRatings;
  versatility: number; // 1 to 10
  priceMXN: number;
  promoActive?: boolean;
  promoPriceMXN?: number | null;
  promoLabel?: string;
  effectivePriceMXN?: number;
  priceCategory: PriceCategory;
  valueForMoney: number; // 1 to 10
  image: string;
  description: string;
  usageExperience: string;
  stockStatus: StockStatus;
  stockQuantity?: number;
  bottleVolumeML?: number;
  availableML?: number;
  decant5mlEnabled?: boolean;
  decant5mlPriceMXN?: number | null;
  reservationDepositMXN?: number | null;
  originalGuaranteed: boolean;
  isFoundingCollection?: boolean;
  foundingOrder?: number;
}

export interface DiscoveryQuizAnswers {
  genderPreference?: 'Caballero' | 'Dama' | 'Unisex' | 'Todos' | string;
  occasion?: string;
  budgetMXNMax?: number;
  olfactoryFamily?: string;
  preferredNotes?: string[];
  personalityStyle?: string;
  desiredEmotion?: string;
  weather?: string;
  experienceLevel?: 'Principiante' | 'Intermedio' | 'Entusiasta / Apasionado';
}

export interface CompatibilityResult {
  perfume: Perfume;
  compatibilityScore: number; // 0 - 100%
  matchReasons: string[];
  whyGiobotRecommends: string;
}

export interface DurableProfile {
  genderPreference?: string;
  olfactoryPreferences?: string[];
  dislikes?: string[];
  personalityStyle?: string;
  favoritePerfumesOrNotes?: string[];
}

export interface ActiveSearch {
  preferredCategory?: Perfume['category'];
  occasion?: string;
  maxBudgetMXN?: number;
  minBudgetMXN?: number;
  weather?: string;
  season?: string;
  timeOfDay?: string;
  desiredEmotions?: string[];
  desiredDuration?: string;
  desiredProjection?: string;
  desiredPerformance?: string;
  searchGoal?: string;
  selectedPerfumeId?: string;
  comparedPerfumeIds?: string[];
  awaitingSecondComparisonPerfume?: boolean;
}

export interface UserCriteria {
  preferredCategory?: Perfume['category'];
  genderPreference?: string;
  maxBudgetMXN?: number;
  minBudgetMXN?: number;
  occasion?: string;
  olfactoryPreferences?: string[];
  dislikes?: string[];
  personalityStyle?: string;
  desiredEmotions?: string[];
  weather?: string;
  season?: string;
  timeOfDay?: string;
  desiredDuration?: string;
  desiredProjection?: string;
  desiredPerformance?: string;
  favoritePerfumesOrNotes?: string[];
  // Dos niveles conceptuales de memoria:
  durableProfile?: DurableProfile;
  activeSearch?: ActiveSearch;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'giobot';
  text: string;
  timestamp: string;
  recommendations?: CompatibilityResult[];
  quickReplies?: string[];
}
