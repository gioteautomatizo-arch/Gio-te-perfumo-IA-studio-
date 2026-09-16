// ============================================================================
// 05 BASE DE CONOCIMIENTO DE PERFUMES — GIO TE PERFUMO (PUNTOS 1 AL 8)
// ============================================================================

export interface PerfumeKnowledgeStandard {
  point: number;
  title: string;
  definition: string;
}

export const GIO_PERFUME_KNOWLEDGE_STANDARDS: PerfumeKnowledgeStandard[] = [
  {
    point: 1,
    title: 'Estructura de cada perfume',
    definition:
      'Cada perfume registrado en la base de conocimiento de Gio te perfumo sigue la misma estructura para garantizar recomendaciones consistentes: Nombre, Marca, País de origen, Año de lanzamiento, Perfumista, Familia olfativa, Notas de salida, Notas de corazón, Notas de fondo, Acordes principales, Concentración (EDT, EDP, Parfum, Extrait), Duración aproximada, Proyección aproximada, Estela, Mejor estación del año, Mejor horario de uso, Ocasiones recomendadas, Personalidad con la que mejor conecta, Emociones que transmite, Nivel de versatilidad, Rango de precio, Relación calidad-precio, Compatibilidad con distintos perfiles y Comentarios u observaciones relevantes.',
  },
  {
    point: 2,
    title: 'Sistema de evaluación de cada perfume',
    definition:
      'Cada perfume es evaluado con una metodología uniforme: Calidad del aroma, Duración, Proyección, Versatilidad, Relación calidad-precio, Originalidad, Facilidad de uso, Rendimiento según el clima y ocasión, y Compatibilidad con diferentes perfiles de personalidad. Estas valoraciones sirven como apoyo editorial y analítico para Giobot, pero nunca sustituyen la información proporcionada por el cliente durante la conversación.',
  },
  {
    point: 3,
    title: 'Registro de experiencias de uso',
    definition:
      'Incluye observaciones sobre el comportamiento de la fragancia en diferentes situaciones, climas y tipos de piel, así como comentarios frecuentes de clientes y experiencias verificadas, diferenciándolas con claridad de los datos técnicos. Son experiencias de apoyo, no verdades absolutas universales.',
  },
  {
    point: 4,
    title: 'Actualización de la información',
    definition:
      'La base de conocimiento es un documento vivo que se actualiza ante reformulaciones, nuevas versiones, descontinuaciones o cambios de rendimiento, priorizando siempre la información más reciente y confiable.',
  },
  {
    point: 5,
    title: 'Perfil de personalidad de cada perfume',
    definition:
      'Describe el tipo de persona con la que suele conectar mejor (estilo de vida, nivel de energía, forma de vestir, gustos, ambiente en el que destaca, imagen que proyecta). Es una guía de afinidad, no una regla rígida.',
  },
  {
    point: 6,
    title: 'Perfil emocional de cada perfume',
    definition:
      'Describe las sensaciones y emociones que transmite (tranquilidad, confianza, elegancia, energía, sensualidad, alegría, misterio, frescura, sofisticación) para conectar las necesidades emocionales del cliente con la fragancia.',
  },
  {
    point: 7,
    title: 'Perfil de ocasiones y escenarios',
    definition:
      'Detalla en qué contextos destaca mejor la fragancia (uso diario, oficina/trabajo, universidad, citas románticas, eventos formales, fiestas/vida nocturna, viajes, actividades al aire libre, climas cálido/templado/frío y estaciones).',
  },
  {
    point: 8,
    title: 'Perfil de compatibilidad',
    definition:
      'Reúne toda la información relevante para facilitar un análisis integral de afinidad. Es una herramienta de apoyo y la decisión final siempre considera el contexto completo de la persona.',
  },
];
