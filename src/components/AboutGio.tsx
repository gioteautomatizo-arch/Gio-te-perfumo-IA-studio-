import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Smile,
  Compass,
  Award,
  Users,
  Bot,
} from 'lucide-react';

export const AboutGio: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in text-[#1a1a1a]">
      {/* Hero Brand Section */}
      <div className="relative overflow-hidden border border-[#1a1a1a]/15 shadow-sm bg-[#1a1a1a] p-8 sm:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="bg-[#c5a059] text-[#1a1a1a] text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 inline-block">
            Sobre Nosotros
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif italic text-[#fcfaf7]">
            Gio te perfumo
          </h2>
          <p className="text-base sm:text-lg text-[#c5a059] font-serif italic font-light">
            "Encuentra la fragancia que habla de ti."
          </p>
        </div>
      </div>

      {/* Philosophy Banner (Editorial) */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <span className="text-[10px] uppercase text-[#c5a059] tracking-[0.2em] font-bold">
          Nuestra Filosofía de Trabajo
        </span>
        <blockquote className="text-xl sm:text-2xl font-serif italic font-bold text-[#1a1a1a]">
          "No buscamos vender el perfume más caro. Buscamos encontrar el perfume perfecto para cada persona."
        </blockquote>
      </div>

      {/* Story & Meaning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 border border-[#1a1a1a] bg-[#fcfaf7] text-[#1a1a1a]">
              <Compass className="w-5 h-5 text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-serif italic font-bold text-[#1a1a1a]">
              Historia de la Marca
            </h3>
          </div>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            Gio te perfumo nació de una pasión genuina por el mundo de las fragancias. Todo comenzó con mis primeros tres perfumes de diseñador que marcaron mi inicio en este apasionante arte: <strong>One Million de Rabanne</strong>, <strong>Legend Spirit de Montblanc</strong> y <strong>Nautica Voyage</strong>.
          </p>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            A partir de esa trilogía personal, amigos y conocidos comenzaron a pedirme consejos para elegir sus propias fragancias. Con el tiempo descubrí que muchas personas querían una orientación transparente antes de comprar. Así nació Gio te perfumo, combinando el gusto por la perfumería con Inteligencia Artificial.
          </p>
        </div>

        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border border-[#1a1a1a] bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-6 h-6 text-[#c5a059]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">Asesor Sommelier</span>
              <h3 className="text-xl font-serif italic font-bold text-[#1a1a1a]">
                Personalidad de Giobot
              </h3>
            </div>
          </div>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            Giobot es el asesor inteligente de fragancias de Gio te perfumo. Su forma de comunicarse es cercana, amable, profesional y honesta. Nunca recomienda un perfume solo por venderlo.
          </p>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            Además de la perfumería, Giobot comparte la esencia de la marca: el gusto por la música, la cocina y la conexión entre los aromas y las emociones. Cree que una canción, un platillo y un perfume pueden despertar recuerdos y contar una historia única.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-3 shadow-sm">
          <h4 className="text-xs uppercase text-[#1a1a1a] tracking-widest font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-[#c5a059]" />
            Misión
          </h4>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            Ayudar a las personas a encontrar el perfume que mejor refleje su personalidad mediante asesoría personalizada, inteligencia artificial y un catálogo cuidadosamente seleccionado de fragancias originales, ofreciendo una experiencia de compra cercana, confiable y diferente.
          </p>
        </div>

        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-3 shadow-sm">
          <h4 className="text-xs uppercase text-[#1a1a1a] tracking-widest font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-[#c5a059]" />
            Visión
          </h4>
          <p className="text-[#555] text-xs sm:text-sm font-light leading-relaxed">
            Convertir a Gio te perfumo en la perfumería con asesoría de inteligencia artificial más reconocida de México, ofreciendo una experiencia única donde cada cliente encuentre la fragancia ideal según su personalidad, gustos y estilo de vida.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase text-[#c5a059] tracking-[0.2em] font-bold">Nuestros Principios</span>
          <h3 className="text-2xl font-serif italic font-bold text-[#1a1a1a]">Valores de Gio te perfumo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">🤝 Honestidad</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Siempre recomendar el perfume que realmente se adapte al cliente, sin importar si es el más barato o el más caro.
            </p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">🔥 Pasión por la perfumería</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Compartimos el gusto por las fragancias y buscamos transmitir ese entusiasmo en cada recomendación.
            </p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">🤖 Innovación</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Utilizamos inteligencia artificial para ofrecer una experiencia moderna, rápida y personalizada.
            </p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">🛡️ Confianza</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Vendemos únicamente productos 100% originales y brindamos información clara y transparente.
            </p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">✨ Atención personalizada</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Cada cliente es único y merece recomendaciones basadas en sus gustos, personalidad y necesidades.
            </p>
          </div>

          <div className="bg-[#fcfaf7] p-4 border border-[#1a1a1a]/15 space-y-1">
            <div className="font-serif italic font-bold text-sm text-[#1a1a1a]">📚 Aprendizaje continuo</div>
            <p className="text-xs text-[#555] font-light leading-relaxed">
              Nos mantenemos actualizados sobre nuevos lanzamientos, tendencias y conocimientos del mundo olfativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
