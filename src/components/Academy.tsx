import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Droplet,
  Clock,
  Wind,
  Layers,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const Academy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pyramid' | 'concentrations' | 'sillage' | 'tips'>('pyramid');

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in text-[#1a1a1a]">
      {/* Header Banner (Editorial Style) */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <div className="inline-flex items-center gap-2 bg-[#c5a059]/20 text-[#1a1a1a] border border-[#c5a059] px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold">
          <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
          Aprende con Giobot
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif italic text-[#1a1a1a]">
          Academia & Glosario de Perfumería
        </h2>
        <p className="text-[#555] text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
          En Gio te perfumo creemos en educar antes de recomendar. Descubre cómo funcionan las notas, concentraciones y secretos para que tu perfume dure todo el día.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-[#f5f0e8] p-2 border border-[#1a1a1a]/15">
        <button
          onClick={() => setActiveTab('pyramid')}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'pyramid'
              ? 'bg-[#1a1a1a] text-[#fcfaf7]'
              : 'text-[#1a1a1a] hover:bg-[#fcfaf7]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Pirámide Olfativa</span>
        </button>

        <button
          onClick={() => setActiveTab('concentrations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'concentrations'
              ? 'bg-[#1a1a1a] text-[#fcfaf7]'
              : 'text-[#1a1a1a] hover:bg-[#fcfaf7]'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>EDT, EDP y Extrait</span>
        </button>

        <button
          onClick={() => setActiveTab('sillage')}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'sillage'
              ? 'bg-[#1a1a1a] text-[#fcfaf7]'
              : 'text-[#1a1a1a] hover:bg-[#fcfaf7]'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Proyección y Estela</span>
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'tips'
              ? 'bg-[#1a1a1a] text-[#fcfaf7]'
              : 'text-[#1a1a1a] hover:bg-[#fcfaf7]'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Tips de Duración</span>
        </button>
      </div>

      {/* Tab Content 1: Pirámide Olfativa */}
      {activeTab === 'pyramid' && (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#c5a059]" />
              ¿Qué es la Pirámide Olfativa?
            </h3>
            <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
              Un perfume no huele igual todo el día. Evoluciona en tres etapas a medida que las moléculas de aceite aromático se evaporan con el calor de tu piel:
            </p>
          </div>

          <div className="space-y-4">
            {/* Top */}
            <div className="bg-[#fcfaf7] border border-[#1a1a1a]/15 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#1a1a1a] bg-[#c5a059]/20 border border-[#c5a059] px-2.5 py-0.5 tracking-wider">
                  1. Notas de Salida (Top Notes)
                </span>
                <span className="text-xs text-[#555] font-serif italic">0 a 30 minutos</span>
              </div>
              <h4 className="text-base font-serif italic font-bold text-[#1a1a1a] mb-1">La Primera Impresión</h4>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Es el aroma chispeante que percibes inmediatamente al atomizar. Compuesto por las moléculas más volátiles como cítricos (bergamota, limón), frutas frescas y especias ligeras.
              </p>
            </div>

            {/* Heart */}
            <div className="bg-[#fcfaf7] border border-[#1a1a1a]/15 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#1a1a1a] bg-[#c5a059]/20 border border-[#c5a059] px-2.5 py-0.5 tracking-wider">
                  2. Notas de Corazón (Heart Notes)
                </span>
                <span className="text-xs text-[#555] font-serif italic">30 min a 4 horas</span>
              </div>
              <h4 className="text-base font-serif italic font-bold text-[#1a1a1a] mb-1">El Alma del Perfume</h4>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Emergen cuando las notas de salida comienzan a disiparse. Definen el carácter real de la fragancia. Incluyen flores (rosa, jazmín, lavanda), especias cálidas (canela, cardamomo) y hierbas.
              </p>
            </div>

            {/* Base */}
            <div className="bg-[#fcfaf7] border border-[#1a1a1a]/15 p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#1a1a1a] bg-[#c5a059]/20 border border-[#c5a059] px-2.5 py-0.5 tracking-wider">
                  3. Notas de Fondo (Base Notes)
                </span>
                <span className="text-xs text-[#555] font-serif italic">4 a 12+ horas</span>
              </div>
              <h4 className="text-base font-serif italic font-bold text-[#1a1a1a] mb-1">La Fijación y Recuerdo</h4>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Son las moléculas más pesadas y duraderas. Dan cuerpo y riqueza al secarse en tu piel. Compuestas por maderas (sándalo, cedro), vainilla, ámbar, praliné, cuero y almizcles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Concentraciones */}
      {activeTab === 'concentrations' && (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
              <Droplet className="w-5 h-5 text-[#c5a059]" />
              ¿Qué significan EDT, EDP y Extrait de Parfum?
            </h3>
            <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
              La diferencia principal radica en el **porcentaje de concentración de aceites esenciales** disueltos en alcohol:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#fcfaf7] p-5 border border-[#1a1a1a]/15 space-y-2">
              <div className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">EDT (Eau de Toilette)</div>
              <div className="text-2xl font-serif italic font-bold text-[#1a1a1a]">10% - 15%</div>
              <div className="text-xs text-[#555] font-serif italic">Duración: 4 a 6 horas</div>
              <p className="text-xs text-[#555] font-light leading-relaxed pt-2 border-t border-[#1a1a1a]/10">
                Frescos y ligeros. Perfectos para el día a día, clima caluroso o gimnasio. Proyectan de forma chispeante y renovadora.
              </p>
            </div>

            <div className="bg-[#fcfaf7] p-5 border border-[#1a1a1a]/15 space-y-2">
              <div className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">EDP (Eau de Parfum)</div>
              <div className="text-2xl font-serif italic font-bold text-[#1a1a1a]">15% - 20%</div>
              <div className="text-xs text-[#555] font-serif italic">Duración: 8 a 12 horas</div>
              <p className="text-xs text-[#555] font-light leading-relaxed pt-2 border-t border-[#1a1a1a]/10">
                El equilibrio perfecto entre proyección y duración. Ideal para la oficina, citas nocturnas y eventos importantes.
              </p>
            </div>

            <div className="bg-[#fcfaf7] p-5 border border-[#1a1a1a]/15 space-y-2">
              <div className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">Elixir / Extrait</div>
              <div className="text-2xl font-serif italic font-bold text-[#1a1a1a]">20% - 40%</div>
              <div className="text-xs text-[#555] font-serif italic">Duración: 12 a 24 horas</div>
              <p className="text-xs text-[#555] font-light leading-relaxed pt-2 border-t border-[#1a1a1a]/10">
                La máxima concentración de lujo. Oleoso, denso y extremadamente duradero en ropa y piel. Requiere pocas atomizaciones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Proyección y Estela */}
      {activeTab === 'sillage' && (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#c5a059]" />
              Proyección vs. Estela (Sillage)
            </h3>
            <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
              A menudo se confunden, pero miden dos comportamientos aromáticos diferentes:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#fcfaf7] p-5 border border-[#1a1a1a]/15 space-y-2">
              <div className="flex items-center gap-2 text-[#1a1a1a] font-bold text-base font-serif italic">
                <Wind className="w-5 h-5 text-[#c5a059]" />
                <span>Proyección</span>
              </div>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Es la distancia a la que el perfume irradia desde tu cuerpo mientras estás detenido. Un perfume de alta proyección se percibe a 1.5 o 2 metros de distancia, mientras que uno íntimo requiere estar a centímetros.
              </p>
            </div>

            <div className="bg-[#fcfaf7] p-5 border border-[#1a1a1a]/15 space-y-2">
              <div className="flex items-center gap-2 text-[#1a1a1a] font-bold text-base font-serif italic">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
                <span>Estela (Sillage)</span>
              </div>
              <p className="text-xs text-[#555] font-light leading-relaxed">
                Es la huella aromática que dejas suspendida en el aire cuando caminas por un pasillo o entras a una habitación. Una buena estela provoca que las personas se pregunten "¿quién huele tan increíble?".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Tips de Duración */}
      {activeTab === 'tips' && (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          <div className="space-y-2">
            <h3 className="text-xl font-serif italic text-[#1a1a1a] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#c5a059]" />
              Secretos de Giobot para que tu perfume dure todo el día
            </h3>
            <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
              Sigue estas recomendaciones de perfumería para maximizar la fijación de tus fragancias:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 flex gap-3 items-start">
              <span className="text-xl">🧴</span>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-[#1a1a1a]">1. Hidrata tu piel antes</h4>
                <p className="text-xs text-[#555] font-light mt-1">
                  La piel seca absorbe los aceites aromáticos rápidamente. Aplica crema humectante neutra o vaselina ligera en los puntos de pulso antes del perfume.
                </p>
              </div>
            </div>

            <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 flex gap-3 items-start">
              <span className="text-xl">🛑</span>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-[#1a1a1a]">2. ¡NUNCA frotes las muñecas!</h4>
                <p className="text-xs text-[#555] font-light mt-1">
                  Frotar las muñecas genera fricción y calor excesivo que rompe las moléculas de las notas de salida, arruinando la evolución del perfume.
                </p>
              </div>
            </div>

            <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 flex gap-3 items-start">
              <span className="text-xl">📍</span>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-[#1a1a1a]">3. Aplica en puntos de pulso</h4>
                <p className="text-xs text-[#555] font-light mt-1">
                  Cuello, detrás de las orejas, pliegue interno de los codos y pecho. El calor sanguíneo en estas zonas proyecta el aroma de forma continua.
                </p>
              </div>
            </div>

            <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 flex gap-3 items-start">
              <span className="text-xl">👔</span>
              <div>
                <h4 className="text-sm font-serif italic font-bold text-[#1a1a1a]">4. Un par de atomizaciones en la ropa</h4>
                <p className="text-xs text-[#555] font-light mt-1">
                  Las fibras de las telas retienen el perfume hasta por días. Aplica a 15 cm de distancia en camisas o sacos para crear un aura duradera.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
