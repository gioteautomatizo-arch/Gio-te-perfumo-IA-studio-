// ============================================================================
// MOTOR DETERMINISTA DE COMPATIBILIDAD — GIO TE PERFUMO
// Puntuación total = 100 puntos:
// 1. Ocasión de uso: 30 puntos
// 2. Preferencias olfativas: 25 puntos
// 3. Personalidad y estilo de vida: 20 puntos
// 4. Emociones / sensaciones buscadas: 15 puntos
// 5. Factores complementarios (clima, estación, horario, duración, proyección, favoritos): 10 puntos
// RESTRICCIÓN DURA: Presupuesto máximo (filtro excluyente antes del cálculo)
// ============================================================================

import { Perfume, CompatibilityResult, DiscoveryQuizAnswers, UserCriteria } from '../types';

export type { UserCriteria };

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function containsAny(source: string | string[], targets: string[]): boolean {
  if (!targets || targets.length === 0) return false;
  const sourceNormalized = Array.isArray(source)
    ? source.map(normalizeText).join(' ')
    : normalizeText(source);

  return targets.some(target => {
    const normTarget = normalizeText(target);
    return normTarget.length > 1 && sourceNormalized.includes(normTarget);
  });
}

/**
 * Retorna el precio efectivo vigente de un perfume:
 * Si promoActive === true y promoPriceMXN es válido (> 0), retorna promoPriceMXN.
 * De lo contrario, retorna priceMXN.
 */
export function getEffectivePrice(perfume: Perfume): number {
  if (
    perfume.promoActive === true &&
    typeof perfume.promoPriceMXN === 'number' &&
    perfume.promoPriceMXN > 0
  ) {
    return perfume.promoPriceMXN;
  }
  return perfume.effectivePriceMXN || perfume.priceMXN;
}

/**
 * Verifica restricciones duras (Disponibilidad en stock, Presupuesto efectivo y Género).
 * Retorna true si es elegible, false si queda descartado.
 */
export function checkHardConstraints(perfume: Perfume, criteria: UserCriteria): { eligible: boolean; reason?: string } {
  // 1. RESTRICCIÓN DURA: Disponibilidad en stock
  if (perfume.stockStatus === 'Agotado') {
    return {
      eligible: false,
      reason: 'Producto actualmente agotado en catálogo',
    };
  }

  if (
    criteria.preferredCategory &&
    normalizeText(perfume.category || '') !== normalizeText(criteria.preferredCategory)
  ) {
    return { eligible: false, reason: `No pertenece a la categoría ${criteria.preferredCategory}` };
  }

  // 2. RESTRICCIÓN DURA: Presupuesto (evaluado contra el precio efectivo vigente)
  const effectivePrice = getEffectivePrice(perfume);
  if (criteria.maxBudgetMXN && criteria.maxBudgetMXN > 0) {
    if (effectivePrice > criteria.maxBudgetMXN) {
      const priceText =
        perfume.promoActive === true &&
        typeof perfume.promoPriceMXN === 'number' &&
        perfume.promoPriceMXN > 0
          ? `precio promocional $${effectivePrice.toLocaleString('es-MX')} MXN`
          : `$${effectivePrice.toLocaleString('es-MX')} MXN`;

      return {
        eligible: false,
        reason: `Excede el presupuesto máximo de $${criteria.maxBudgetMXN.toLocaleString('es-MX')} MXN (${priceText})`,
      };
    }
  }

  // 3. RESTRICCIÓN DURA: Género específico
  if (criteria.genderPreference) {
    const pref = normalizeText(criteria.genderPreference);
    const pGender = normalizeText(perfume.gender || '');

    const isMalePref = pref.includes('hombre') || pref.includes('caballero') || pref.includes('masculino');
    const isFemalePref = pref.includes('mujer') || pref.includes('dama') || pref.includes('femenino');

    if (isMalePref) {
      if (!pGender.includes('masculino') && !pGender.includes('unisex') && !pGender.includes('caballero')) {
        return { eligible: false, reason: 'No coincide con la preferencia de género (Caballero)' };
      }
    } else if (isFemalePref) {
      if (!pGender.includes('femenino') && !pGender.includes('unisex') && !pGender.includes('dama')) {
        return { eligible: false, reason: 'No coincide con la preferencia de género (Dama)' };
      }
    }
  }

  return { eligible: true };
}

/**
 * Calcula la puntuación determinista de compatibilidad (0 a 100 puntos)
 * solo para perfumes que ya superaron las restricciones duras.
 */
export function calculateExactCompatibility(perfume: Perfume, criteria: UserCriteria): CompatibilityResult {
  const hardCheck = checkHardConstraints(perfume, criteria);
  if (!hardCheck.eligible) {
    return {
      perfume,
      compatibilityScore: 0,
      matchReasons: [hardCheck.reason || 'No elegible según restricciones'],
      whyGiobotRecommends: '',
    };
  }

  const matchReasons: string[] = [];

  // =========================================================================
  // 1. OCASIÓN DE USO: 30 PUNTOS MÁXIMO
  // =========================================================================
  let occasionPoints = 0;
  if (criteria.occasion && criteria.occasion.trim().length > 0) {
    const occKeywords = criteria.occasion.split(/[,/ ]+/).map(normalizeText).filter(k => k.length > 2);
    const occasionsList = [
      ...perfume.recommendedOccasions,
      ...perfume.occasionsIdeal,
      ...perfume.occasionsPossible,
    ].map(normalizeText);

    const isIdeal = perfume.occasionsIdeal.some(occ => containsAny(occ, occKeywords));
    const isRecommended = perfume.recommendedOccasions.some(occ => containsAny(occ, occKeywords));
    const isPossible = perfume.occasionsPossible.some(occ => containsAny(occ, occKeywords));
    const isNotRecommended = perfume.occasionsNotRecommended.some(occ => containsAny(occ, occKeywords));

    if (isIdeal || isRecommended) {
      occasionPoints = 30;
      matchReasons.push(`Ideal para ${criteria.occasion}`);
    } else if (isPossible) {
      occasionPoints = 20;
      matchReasons.push(`Apto para ${criteria.occasion}`);
    } else if (isNotRecommended) {
      occasionPoints = 5;
    } else {
      // Afinidad general según versatilidad
      occasionPoints = Math.round((perfume.versatility / 10) * 22);
    }
  } else {
    // Si no se especificó ocasión particular, se evalúa la versatilidad de la fragancia
    occasionPoints = Math.round((perfume.versatility / 10) * 28);
  }

  // =========================================================================
  // 2. PREFERENCIAS OLFATIVAS: 25 PUNTOS MÁXIMO
  // =========================================================================
  let olfactoryPoints = 0;
  if (criteria.olfactoryPreferences && criteria.olfactoryPreferences.length > 0) {
    const allPerfumeNotes = [
      perfume.family,
      ...perfume.mainAccords,
      ...perfume.topNotes,
      ...perfume.heartNotes,
      ...perfume.baseNotes,
    ].map(normalizeText);

    let matchCount = 0;
    criteria.olfactoryPreferences.forEach(pref => {
      if (containsAny(allPerfumeNotes, [pref])) {
        matchCount++;
      }
    });

    if (matchCount >= 3) {
      olfactoryPoints = 25;
      matchReasons.push(`Gran coincidencia con tus notas y acordes favoritos`);
    } else if (matchCount === 2) {
      olfactoryPoints = 21;
      matchReasons.push(`Coincide con notas clave de tu preferencia`);
    } else if (matchCount === 1) {
      olfactoryPoints = 17;
      matchReasons.push(`Incluye notas de ${criteria.olfactoryPreferences[0]}`);
    } else {
      // Afinidad de armonía aromática
      olfactoryPoints = Math.round((perfume.ratings.aromaQuality / 10) * 16);
    }

    // Ajuste si contiene notas que el usuario explícitamente no desea
    if (criteria.dislikes && criteria.dislikes.length > 0) {
      if (containsAny(allPerfumeNotes, criteria.dislikes)) {
        olfactoryPoints = Math.max(5, olfactoryPoints - 10);
      }
    }
  } else {
    olfactoryPoints = Math.round((perfume.ratings.aromaQuality / 10) * 22);
    if (criteria.dislikes && criteria.dislikes.length > 0) {
      const allPerfumeNotes = [
        perfume.family,
        ...perfume.mainAccords,
        ...perfume.topNotes,
        ...perfume.heartNotes,
        ...perfume.baseNotes,
      ].map(normalizeText);
      if (containsAny(allPerfumeNotes, criteria.dislikes)) {
        olfactoryPoints = Math.max(5, olfactoryPoints - 10);
      }
    }
  }

  // =========================================================================
  // 3. PERSONALIDAD Y ESTILO DE VIDA: 20 PUNTOS MÁXIMO
  // =========================================================================
  let personalityPoints = 0;
  if (criteria.personalityStyle && criteria.personalityStyle.trim().length > 0) {
    const personalityPool = [
      ...perfume.personalityMatch,
      ...perfume.personalityPoints,
      ...perfume.lifestyleMatch,
    ].map(normalizeText);

    const styleTerms = criteria.personalityStyle.split(/[,/ ]+/).map(normalizeText).filter(t => t.length > 2);

    if (containsAny(personalityPool, styleTerms)) {
      personalityPoints = 20;
      matchReasons.push(`Refleja perfectamente un estilo ${criteria.personalityStyle}`);
    } else {
      personalityPoints = 14;
    }
  } else {
    personalityPoints = 16;
  }

  // =========================================================================
  // 4. EMOCIONES / SENSACIONES BUSCADAS: 15 PUNTOS MÁXIMO
  // =========================================================================
  let emotionPoints = 0;
  if (criteria.desiredEmotions && criteria.desiredEmotions.length > 0) {
    const emotionPool = [
      ...perfume.emotions,
      ...perfume.emotionsForUser,
      ...perfume.emotionsProjected,
    ].map(normalizeText);

    let emoMatches = 0;
    criteria.desiredEmotions.forEach(emo => {
      if (containsAny(emotionPool, [emo])) {
        emoMatches++;
      }
    });

    if (emoMatches >= 2) {
      emotionPoints = 15;
      matchReasons.push(`Transmite exactamente ${criteria.desiredEmotions.join(' y ')}`);
    } else if (emoMatches === 1) {
      emotionPoints = 13;
      matchReasons.push(`Evoca sensación de ${criteria.desiredEmotions[0]}`);
    } else {
      emotionPoints = 9;
    }
  } else {
    emotionPoints = 12;
  }

  // =========================================================================
  // 5. FACTORES COMPLEMENTARIOS: 10 PUNTOS MÁXIMO
  // (clima, estación, horario, duración, proyección, perfumes favoritos)
  // =========================================================================
  let compPoints = 0;
  let compFactorsEvaluated = 0;

  // Clima / Estación
  if (criteria.weather || criteria.season) {
    compFactorsEvaluated++;
    const w = normalizeText(criteria.weather || '');
    const s = normalizeText(criteria.season || '');

    const isHot = w.includes('cal') || s.includes('ver') || s.includes('prim');
    const isCold = w.includes('frio') || s.includes('inv') || s.includes('oto');

    if (isHot && (perfume.bestSeason.includes('Verano') || perfume.bestSeason.includes('Primavera'))) {
      compPoints += 4;
      matchReasons.push('Excelente rendimiento en clima cálido');
    } else if (isCold && (perfume.bestSeason.includes('Invierno') || perfume.bestSeason.includes('Otoño'))) {
      compPoints += 4;
      matchReasons.push('Aroma envolvente ideal para clima frío');
    } else if (perfume.bestSeason.length >= 3) {
      compPoints += 3;
    } else {
      compPoints += 2;
    }
  }

  // Horario (Día / Noche)
  if (criteria.timeOfDay) {
    compFactorsEvaluated++;
    const t = normalizeText(criteria.timeOfDay);
    const matchesTime = perfume.bestTime.some(bt => normalizeText(bt).includes(t));
    if (matchesTime) {
      compPoints += 3;
    } else {
      compPoints += 1;
    }
  }

  // Duración / Proyección deseadas
  if (criteria.desiredDuration || criteria.desiredProjection) {
    compFactorsEvaluated++;
    if (perfume.ratings.durationRating >= 8.0) {
      compPoints += 3;
      matchReasons.push(`Fijación sólida (${perfume.duration.split('.')[0]})`);
    } else {
      compPoints += 2;
    }
  }

  // Perfumes favoritos / inspiración
  if (criteria.favoritePerfumesOrNotes && criteria.favoritePerfumesOrNotes.length > 0) {
    compFactorsEvaluated++;
    const favMatches = criteria.favoritePerfumesOrNotes.some(fav => {
      const nFav = normalizeText(fav);
      return normalizeText(perfume.name).includes(nFav) || normalizeText(perfume.brand).includes(nFav);
    });
    if (favMatches) {
      compPoints += 4;
    }
  }

  // Si no se proveyeron factores complementarios, se utiliza el índice de calidad general (0 a 10 pts)
  if (compFactorsEvaluated === 0) {
    compPoints = Math.round(((perfume.ratings.aromaQuality + perfume.ratings.durationRating) / 20) * 8) + 1;
  } else {
    compPoints = Math.min(10, compPoints);
  }

  // Puntuación total sumada (máximo 100)
  let totalScore = occasionPoints + olfactoryPoints + personalityPoints + emotionPoints + compPoints;

  // Normalización a rango estándar de recomendación (mínimo 60% si califica, máximo 98%)
  totalScore = Math.min(98, Math.max(60, Math.round(totalScore)));

  // Explicación de recomendación sustentada en la ficha técnica con precio efectivo real
  const effectivePrice = getEffectivePrice(perfume);
  const isPromo =
    perfume.promoActive === true &&
    typeof perfume.promoPriceMXN === 'number' &&
    perfume.promoPriceMXN > 0;

  const priceMention = isPromo
    ? `precio promocional de $${effectivePrice.toLocaleString('es-MX')} MXN`
    : `precio de $${effectivePrice.toLocaleString('es-MX')} MXN`;

  const whyGiobotRecommends = `Recomendado por Giobot para ${criteria.occasion || 'tu día a día'} por su armonía de notas (${perfume.topNotes.slice(0, 2).join(', ')} en salida con fondo de ${perfume.baseNotes.slice(0, 2).join(', ')}), excelente desempeño de ${perfume.duration.split('.')[0]} y ${priceMention}.`;

  return {
    perfume,
    compatibilityScore: totalScore,
    matchReasons,
    whyGiobotRecommends,
  };
}

/**
 * Convierte las respuestas del Quiz interactivo al formato UserCriteria
 */
export function convertQuizToCriteria(quiz: DiscoveryQuizAnswers): UserCriteria {
  const criteria: UserCriteria = {
    genderPreference: quiz.genderPreference,
    maxBudgetMXN: quiz.budgetMXNMax,
    occasion: quiz.occasion,
    personalityStyle: quiz.personalityStyle,
    weather: quiz.weather,
  };

  if (quiz.olfactoryFamily) {
    criteria.olfactoryPreferences = [quiz.olfactoryFamily];
  }

  if (quiz.preferredNotes && quiz.preferredNotes.length > 0) {
    criteria.olfactoryPreferences = [
      ...(criteria.olfactoryPreferences || []),
      ...quiz.preferredNotes,
    ];
  }

  if (quiz.desiredEmotion) {
    criteria.desiredEmotions = [quiz.desiredEmotion];
  }

  return criteria;
}

/**
 * Ranking determinista de todos los perfumes elegibles ordenados por compatibilidad decreciente
 */
export function rankPerfumesByCompatibility(
  catalog: Perfume[],
  criteria: UserCriteria,
  limit = 4
): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];

  for (const perfume of catalog) {
    const hardCheck = checkHardConstraints(perfume, criteria);
    if (hardCheck.eligible) {
      const res = calculateExactCompatibility(perfume, criteria);
      if (res.compatibilityScore > 0) {
        results.push(res);
      }
    }
  }

  // Ordenar de mayor a menor compatibilidad
  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Asegurar que si hay empates, haya una ligera diferenciación natural decreciente si es necesario
  const formatted = results.slice(0, limit).map((r, idx) => {
    let score = r.compatibilityScore;
    if (idx > 0 && score >= results[idx - 1].compatibilityScore) {
      score = Math.max(65, results[idx - 1].compatibilityScore - (idx + 1));
    }
    return {
      ...r,
      compatibilityScore: score,
    };
  });

  return formatted;
}
