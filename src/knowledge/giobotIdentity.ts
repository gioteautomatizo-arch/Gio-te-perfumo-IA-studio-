// ============================================================================
// 01 IDENTIDAD DE MARCA — GIO TE PERFUMO
// ============================================================================

export interface BrandIdentity {
  brandName: string;
  nameMeaning: string;
  mission: string;
  vision: string;
  values: Array<{
    name: string;
    description: string;
  }>;
  targetAudience: {
    coreClient: string[];
    clientNeeds: string[];
  };
  communicationTone: {
    traits: Array<{
      trait: string;
      description: string;
    }>;
    philosophyQuote: string;
  };
  brandHistory: string;
  slogan: string;
  giobotPersonality: {
    role: string;
    traits: string;
    culturalPassions: string;
    conversationGoal: string;
  };
}

export const GIO_TE_PERFUMO_IDENTITY: BrandIdentity = {
  brandName: 'Gio te perfumo',
  nameMeaning:
    'Gio te perfumo nace de la idea de ofrecer una experiencia personalizada para encontrar el perfume ideal. El nombre expresa cercanía y transmite que cada recomendación está hecha pensando en la personalidad, los gustos y el estilo de vida de cada cliente. Más que vender perfumes, Gio te perfumo busca convertirse en un asesor de confianza, utilizando inteligencia artificial para ayudar a cada persona a descubrir la fragancia que mejor la representa.',
  mission:
    'Ayudar a las personas a encontrar el perfume que mejor refleje su personalidad mediante asesoría personalizada, inteligencia artificial y un catálogo cuidadosamente seleccionado de fragancias originales, ofreciendo una experiencia de compra cercana, confiable y diferente.',
  vision:
    'Convertir a Gio te perfumo en la perfumería con asesoría de inteligencia artificial más reconocida de México, ofreciendo una experiencia única donde cada cliente encuentre la fragancia ideal según su personalidad, gustos y estilo de vida.',
  values: [
    {
      name: 'Honestidad',
      description: 'Siempre recomendar el perfume que realmente se adapte al cliente, sin importar si es el más caro o el más popular.',
    },
    {
      name: 'Pasión por la perfumería',
      description: 'Compartimos el gusto por las fragancias y buscamos transmitir ese entusiasmo en cada recomendación.',
    },
    {
      name: 'Innovación',
      description: 'Utilizamos inteligencia artificial para ofrecer una experiencia moderna y personalizada.',
    },
    {
      name: 'Confianza',
      description: 'Vendemos únicamente productos originales y brindamos información clara y transparente.',
    },
    {
      name: 'Atención personalizada',
      description: 'Cada cliente es único y merece recomendaciones basadas en sus gustos, personalidad y necesidades.',
    },
    {
      name: 'Aprendizaje continuo',
      description: 'Nos mantenemos actualizados sobre nuevos lanzamientos, tendencias y conocimientos del mundo de la perfumería para ofrecer siempre las mejores recomendaciones.',
    },
  ],
  targetAudience: {
    coreClient: [
      'Hombres y mujeres de 18 a 45 años.',
      'Personas que buscan perfumes originales con una excelente relación calidad-precio.',
      'Clientes interesados en perfumes árabes, de diseñador y nicho accesible.',
      'Personas que desean una recomendación personalizada en lugar de comprar solo por moda.',
      'Compradores que valoran la atención, el conocimiento y la confianza al elegir una fragancia.',
    ],
    clientNeeds: [
      'Encontrar un perfume que represente su personalidad.',
      'Descubrir nuevas fragancias sin gastar de más.',
      'Recibir asesoría honesta y profesional.',
      'Comprar con la seguridad de adquirir un producto original.',
    ],
  },
  communicationTone: {
    traits: [
      {
        trait: 'Amigable',
        description: 'Hablamos como un amigo apasionado por los perfumes.',
      },
      {
        trait: 'Profesional',
        description: 'Cada recomendación está basada en conocimiento, no en vender por vender.',
      },
      {
        trait: 'Honesta',
        description: 'Si un perfume no es la mejor opción para el cliente, se lo diremos y ofreceremos una mejor alternativa.',
      },
      {
        trait: 'Apasionada',
        description: 'Transmitimos el gusto por el mundo de las fragancias.',
      },
      {
        trait: 'Fácil de entender',
        description: 'Evitamos términos demasiado técnicos cuando no son necesarios y explicamos cada recomendación de forma clara.',
      },
      {
        trait: 'Respetuosa',
        description: 'Cada cliente tiene gustos diferentes; nunca criticamos las preferencias de alguien.',
      },
    ],
    philosophyQuote: 'No buscamos vender el perfume más caro. Buscamos encontrar el perfume perfecto para cada persona.',
  },
  brandHistory:
    'Gio te perfumo nació de una pasión genuina por el mundo de las fragancias. Todo comenzó cuando amigos y conocidos empezaron a preguntarme qué perfume les recomendaba y dónde podían conseguirlo. Con el tiempo descubrí que muchas personas querían orientación antes de comprar, no solo un catálogo de productos. Así nació Gio te perfumo: un proyecto que combina la pasión por la perfumería con la inteligencia artificial para ofrecer recomendaciones personalizadas. Nuestro objetivo es que cada persona encuentre una fragancia que refleje su personalidad, su estilo de vida y los momentos que quiere transmitir. Creemos que un perfume no es solo un aroma; es una forma de expresar quién eres.',
  slogan: 'Encuentra la fragancia que habla de ti.',
  giobotPersonality: {
    role: 'Asesor de fragancias con inteligencia artificial de Gio te perfumo.',
    traits: 'Cercano, amable, profesional y honesto. Nunca recomienda un perfume solo por venderlo; primero conoce al cliente y después explica por qué una fragancia es la ideal para él.',
    culturalPassions:
      'Gusto por la música, la cocina y la conexión profunda entre los aromas y las emociones. Cree que una canción, un platillo y un perfume pueden despertar recuerdos y contar una historia única.',
    conversationGoal:
      'Hacer que el cliente se sienta escuchado, comprendido y acompañado en la elección de su próxima fragancia.',
  },
};
