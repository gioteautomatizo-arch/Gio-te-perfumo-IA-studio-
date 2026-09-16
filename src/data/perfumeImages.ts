// Fixed, immutable 1:1 mapping between PERFUME_ID and its dedicated local IMAGE_ASSET
// Direct module imports of the authentic perfume image files located at root

import afnan9pm from '../../9 PM afnan.optimized.webp';
import azzaroTheMostWanted from '../../Azzaro the most wanted.optimized.webp';
import amorAmorCacharel from '../../amor amor carcharel.optimized.webp';
import armaniMyWay from '../../my way Giorgio armani.optimized.webp';
import armaniSi from '../../Si Giorgio armani.optimized.webp';
import acquaDiGioProfondo from '../../acqua di Gio profondo.optimized.webp';
import asadLattafa from '../../asad lattafa.optimized.webp';
import badeeAlOudHonorGlory from "../../bade'e al oud honor & glory lattafa.png";
import blackOpiumYSL from '../../black opium Yves Saint laurent.optimized.webp';
import bleuDeChanel from '../../Bleu de Chanel edp.optimized.webp';
import chanelChance from '../../chanel chance.optimized.webp';
import clubDeNuitIntenseMan from '../../club de nuit intense armaf.optimized.webp';
import coachForMen from '../../Coach for Men EDT.optimized.webp';
import cocoMademoiselleChanel from '../../coco mademoiselle Chanel.optimized.webp';
import diorSauvage from '../../Dior Sauvage edt.optimized.webp';
import dolceGabbanaLightBlue from '../../dolce & gabanna ligth blue.png';
import fakharBlackLattafa from '../../fakhar black lattafa.optimized.webp';
import fakharRoseLattafa from '../../falkar rose lattafa.optimized.webp';
import flowerbombViktorRolf from '../../flowerbomb Viktor rolf.optimized.webp';
import gentlemanGivenchy from '../../Gentleman Givenchy.optimized.webp';
import goodGirlCarolinaHerrera from '../../good girl Carolina herrera.optimized.webp';
import hawasForHim from '../../hawas for him.optimized.webp';
import hugoBossBottled from '../../Hugo Boss Bottled.optimized.webp';
import idoleLancome from '../../idôle lancôme.optimized.webp';
import invictus from '../../Invictus edt.optimized.webp';
import jeanLoweImmortel from '../../jean lowe immortel.optimized.webp';
import jeanPaulGaultierLeMaleElixir from '../../Jean Paul Gaultier Le Male Elixir.optimized.webp';
import khamrahLattafa from '../../khamrah lattafa.optimized.webp';
import khamrahQahwa from '../../khamrah qahwa.optimized.webp';
import lacosteBlanc from '../../Lacoste Blanc.optimized.webp';
import laVieEstBelleLancome from '../../la viest belle Lancome.optimized.webp';
import libreYSL from '../../libre Yves Saint Laurent.optimized.webp';
import manceraCedratBoise from '../../mancera cedrat boise.optimized.webp';
import lattafaMayar from '../../mayar lattafa.optimized.webp';
import missDior from '../../miss dior.optimized.webp';
import montblancLegendSpirit from '../../Monblanc Legend Spirit.optimized.webp';
import montblancExplorer from '../../Montblanc Explorer.optimized.webp';
import nauticaVoyage from '../../Nautica Voyage.optimized.webp';
import oneMillion from '../../One million edt.optimized.webp';
import pradaLunaRossaCarbon from '../../Prada Luna Rossa Carbon.optimized.webp';
import lattafaQaedAlFursan from '../../qaed fursan lattafa.optimized.webp';
import strongerWithYouIntensely from '../../stronger with you intensely emporio armani.optimized.webp';
import valentinoDonnaBornInRoma from '../../Valentino donna born in roma.optimized.webp';
import valentinoUomoBornInRoma from '../../Valentino Uomo Born in Roma.optimized.webp';
import versaceBrightCrystal from '../../versace brigth crystal.optimized.webp';
import versaceDylanBlue from '../../Versace Dylan Blue.optimized.webp';
import versaceEros from '../../Versace Eros edp.optimized.webp';
import yaraCandyLattafa from '../../yara candy lattafa.optimized.webp';
import yaraLattafa from '../../yara lattafa.optimized.webp';
import yaraMoiLattafa from '../../yara moi lattafa.optimized.webp';
import yaraTousLattafa from '../../yara tous lattafa.optimized.webp';
import yslY from '../../Ysl Y edp.optimized.webp';
import zaraRich from '../../zara rich.optimized.webp';

export const PERFUME_IMAGE_MAP: Record<string, string> = {
  // Diseñador Hombre con imágenes reales existentes
  'dior-sauvage-edt': diorSauvage,
  'dior-sauvage': diorSauvage,

  'bleu-de-chanel-edp': bleuDeChanel,
  'bleu-de-chanel': bleuDeChanel,

  'paco-rabanne-one-million': oneMillion,
  'one-million': oneMillion,
  'one-million-edt': oneMillion,
  '1-million': oneMillion,

  'paco-rabanne-invictus': invictus,
  'invictus': invictus,
  'invictus-edt': invictus,

  'armani-acqua-di-gio-profondo': acquaDiGioProfondo,
  'acqua-di-gio-profondo': acquaDiGioProfondo,
  'acqua-di-gio': acquaDiGioProfondo,
  'giorgio-armani-acqua-di-gio-profondo': acquaDiGioProfondo,

  'ysl-y-edp': yslY,
  'ysl-y': yslY,

  'versace-eros-edp': versaceEros,
  'versace-eros': versaceEros,

  'montblanc-legend-spirit': montblancLegendSpirit,
  'legend-spirit': montblancLegendSpirit,

  'nautica-voyage': nauticaVoyage,
  'nautica-voyage-edt': nauticaVoyage,
  'voyage': nauticaVoyage,

  'lacoste-l1212-blanc': lacosteBlanc,
  'lacoste-blanc': lacosteBlanc,
  'lacoste-l-12-12-blanc': lacosteBlanc,

  'azzaro-the-most-wanted': azzaroTheMostWanted,
  'the-most-wanted': azzaroTheMostWanted,
  'azzaro-most-wanted': azzaroTheMostWanted,

  'jpg-le-male-elixir': jeanPaulGaultierLeMaleElixir,
  'le-male-elixir': jeanPaulGaultierLeMaleElixir,
  'jean-paul-gaultier-le-male-elixir': jeanPaulGaultierLeMaleElixir,

  'montblanc-explorer': montblancExplorer,
  'explorer': montblancExplorer,

  'valentino-uomo-born-in-roma': valentinoUomoBornInRoma,
  'valentino-uomo': valentinoUomoBornInRoma,

  'hugo-boss-bottled': hugoBossBottled,
  'boss-bottled': hugoBossBottled,

  'versace-dylan-blue': versaceDylanBlue,
  'dylan-blue': versaceDylanBlue,

  'coach-for-men': coachForMen,
  'coach-for-men-edt': coachForMen,

  'prada-luna-rossa-carbon': pradaLunaRossaCarbon,
  'luna-rossa-carbon': pradaLunaRossaCarbon,

  'givenchy-gentleman-reserve-privee': gentlemanGivenchy,
  'gentleman-reserve-privee': gentlemanGivenchy,
  'givenchy-gentleman': gentlemanGivenchy,

  'armani-stronger-with-you-intensely': strongerWithYouIntensely,
  'stronger-with-you-intensely': strongerWithYouIntensely,
  'stronger-with-you': strongerWithYouIntensely,

  // Diseñador Mujer
  'cacharel-amor-amor': amorAmorCacharel,
  'amor-amor': amorAmorCacharel,

  'chanel-chance-eau-tendre': chanelChance,
  'chance-eau-tendre': chanelChance,

  'chanel-coco-mademoiselle': cocoMademoiselleChanel,
  'coco-mademoiselle': cocoMademoiselleChanel,

  'carolina-herrera-good-girl': goodGirlCarolinaHerrera,
  'good-girl': goodGirlCarolinaHerrera,

  'versace-bright-crystal': versaceBrightCrystal,
  'bright-crystal': versaceBrightCrystal,

  'ysl-libre-edp': libreYSL,
  'libre-edp': libreYSL,
  'ysl-libre': libreYSL,
  'libre': libreYSL,

  'lancome-la-vie-est-belle': laVieEstBelleLancome,
  'la-vie-est-belle': laVieEstBelleLancome,

  'dior-miss-dior': missDior,
  'miss-dior': missDior,

  'armani-my-way': armaniMyWay,
  'my-way': armaniMyWay,
  'my-way-edp': armaniMyWay,
  'giorgio-armani-my-way': armaniMyWay,

  'armani-si-edp': armaniSi,
  'armani-si': armaniSi,
  'si-edp': armaniSi,
  'si': armaniSi,
  'giorgio-armani-si': armaniSi,

  'ysl-black-opium': blackOpiumYSL,
  'black-opium': blackOpiumYSL,
  'black-opium-edp': blackOpiumYSL,
  'ysl-black-opium-edp': blackOpiumYSL,

  'lancome-idole': idoleLancome,
  'idole': idoleLancome,
  'idole-edp': idoleLancome,
  'lancome-idole-edp': idoleLancome,

  'valentino-donna-born-in-roma': valentinoDonnaBornInRoma,
  'donna-born-in-roma': valentinoDonnaBornInRoma,
  'valentino-donna': valentinoDonnaBornInRoma,

  'viktor-rolf-flowerbomb': flowerbombViktorRolf,
  'flowerbomb': flowerbombViktorRolf,
  'flowerbomb-edp': flowerbombViktorRolf,
  'viktor-and-rolf-flowerbomb': flowerbombViktorRolf,

  'dolce-gabbana-light-blue': dolceGabbanaLightBlue,
  'light-blue': dolceGabbanaLightBlue,
  'dolce-and-gabbana-light-blue': dolceGabbanaLightBlue,

  // Árabe
  'maison-alhambra-jean-lowe-immortel': jeanLoweImmortel,
  'jean-lowe-immortel': jeanLoweImmortel,
  'jean-lowe': jeanLoweImmortel,
  'maison-alhambra-jean-lowe': jeanLoweImmortel,

  'lattafa-khamrah': khamrahLattafa,
  'khamrah': khamrahLattafa,
  'khamrah-edp': khamrahLattafa,
  'lattafa-khamrah-edp': khamrahLattafa,

  'lattafa-khamrah-qahwa': khamrahQahwa,
  'khamrah-qahwa': khamrahQahwa,

  'lattafa-asad': asadLattafa,
  'asad': asadLattafa,
  'asad-edp': asadLattafa,
  'lattafa-asad-edp': asadLattafa,

  'lattafa-fakhar-black': fakharBlackLattafa,
  'fakhar-black': fakharBlackLattafa,
  'fakhar-black-edp': fakharBlackLattafa,
  'lattafa-fakhar-black-edp': fakharBlackLattafa,

  'lattafa-yara-candy': yaraCandyLattafa,
  'yara-candy': yaraCandyLattafa,
  'yara-candy-lattafa': yaraCandyLattafa,

  'rasasi-hawas': hawasForHim,
  'hawas': hawasForHim,
  'hawas-for-him': hawasForHim,
  'rasasi-hawas-for-him': hawasForHim,

  'afnan-9pm': afnan9pm,
  'afnan-9-pm': afnan9pm,
  '9pm': afnan9pm,
  '9-pm': afnan9pm,

  'club-de-nuit-intense-man': clubDeNuitIntenseMan,
  'club-de-nuit': clubDeNuitIntenseMan,
  'armaf-club-de-nuit-intense-man': clubDeNuitIntenseMan,
  'club-de-nuit-intense': clubDeNuitIntenseMan,

  'lattafa-fakhar-rose': fakharRoseLattafa,
  'fakhar-rose': fakharRoseLattafa,
  'fakhar-rose-edp': fakharRoseLattafa,
  'lattafa-fakhar-rose-edp': fakharRoseLattafa,

  'lattafa-yara': yaraLattafa,
  'yara': yaraLattafa,
  'yara-edp': yaraLattafa,
  'lattafa-yara-edp': yaraLattafa,

  'lattafa-yara-moi': yaraMoiLattafa,
  'yara-moi': yaraMoiLattafa,
  'yara-moi-white': yaraMoiLattafa,
  'lattafa-yara-moi-white': yaraMoiLattafa,

  'lattafa-yara-tous': yaraTousLattafa,
  'yara-tous': yaraTousLattafa,
  'yara-tous-yellow': yaraTousLattafa,
  'lattafa-yara-tous-yellow': yaraTousLattafa,

  'zara-rich-warm-addictive': zaraRich,
  'rich-warm-addictive': zaraRich,
  'zara-rich': zaraRich,
  'tobacco-collection-rich-warm-addictive': zaraRich,

  'mancera-cedrat-boise': manceraCedratBoise,
  'cedrat-boise': manceraCedratBoise,
  'mancera-cedrat-boise-edp': manceraCedratBoise,
  'cedrat-boise-edp': manceraCedratBoise,

  'lattafa-honor-and-glory': badeeAlOudHonorGlory,
  'honor-and-glory': badeeAlOudHonorGlory,
  'badee-al-oud-honor-and-glory': badeeAlOudHonorGlory,
  'lattafa-badee-al-oud-honor-and-glory': badeeAlOudHonorGlory,

  'lattafa-qaed-al-fursan': lattafaQaedAlFursan,
  'qaed-al-fursan': lattafaQaedAlFursan,
  'qaed-fursan': lattafaQaedAlFursan,
  'lattafa-qaed-fursan': lattafaQaedAlFursan,

  'lattafa-mayar': lattafaMayar,
  'mayar': lattafaMayar,
  'mayar-edp': lattafaMayar,
  'lattafa-mayar-edp': lattafaMayar,
};
