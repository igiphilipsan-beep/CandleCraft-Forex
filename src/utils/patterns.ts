import { Candle, CandlePatternType, DetectedPattern, PatternSignal } from '../types/forex';

export interface PatternDefinition {
  type: CandlePatternType;
  name: string;
  germanName: string;
  signal: PatternSignal;
  description: string;
  psychology: string;
  confirmation: string;
  reliability: 'Hoch' | 'Mittel' | 'Moderat';
  rules: string[];
}

export const PATTERN_DEFINITIONS: Record<CandlePatternType, PatternDefinition> = {
  hammer: {
    type: 'hammer',
    name: 'Hammer',
    germanName: 'Hammer (Bullische Umkehr)',
    signal: 'bullish',
    reliability: 'Hoch',
    description: 'Eine bullische Umkehrkerze mit einem kleinen Kerzenkörper am oberen Ende und einem langen unteren Schatten (Docht), der mindestens doppelt so lang wie der Körper ist.',
    psychology: 'Die Verkäufer drückten den Kurs massiv nach unten, doch die Käufer übernahmen entschlossen das Ruder und trieben den Preis fast bis zum Eröffnungsniveau zurück.',
    confirmation: 'Nächste Kerze schließt über dem Hoch des Hammers. Stop-Loss wird knapp unter das Tief des Schattens platziert.',
    rules: [
      'Tritt nach einem Abwärtstrend auf',
      'Unterer Schatten mind. 2x so lang wie der Körper',
      'Kaum bis gar kein oberer Schatten',
      'Körperfarbe kann grün oder rot sein (grün ist stärker)',
    ],
  },
  inverted_hammer: {
    type: 'inverted_hammer',
    name: 'Inverted Hammer',
    germanName: 'Invertierter Hammer',
    signal: 'bullish',
    reliability: 'Mittel',
    description: 'Ähnlich dem Hammer, jedoch zeigt der lange Schatten nach oben, während der Körper unten liegt. Signalisiert frühes Kaufinteresse.',
    psychology: 'Käufer testen höhere Preisniveaus. Auch wenn Bären den Kurs temporär drückten, zeigt der Docht den Versuch eines Stimmungsumschwungs.',
    confirmation: 'Erfordert eine bullische Folgekerze mit hohem Volumen als Bestätigung des Durchbruchs.',
    rules: [
      'Tritt nach einem Abwärtstrend auf',
      'Oberer Schatten mind. 2x so lang wie der Körper',
      'Kleiner Körper am unteren Ende',
      'Wenig bis kein unterer Schatten',
    ],
  },
  shooting_star: {
    type: 'shooting_star',
    name: 'Shooting Star',
    germanName: 'Sternschnuppe (Bärische Umkehr)',
    signal: 'bearish',
    reliability: 'Hoch',
    description: 'Eine bärische Umkehrkerze nach einem Aufwärtstrend mit langem oberen Docht und kleinem Körper am unteren Ende.',
    psychology: 'Bullen versuchten neue Höchststände zu etablieren, wurden jedoch von aggressivem Verkaufsdruck überwältigt. Das Momentum kippt zu den Bären.',
    confirmation: 'Folgekerze schließt unter dem Tief des Shooting Stars. Stop-Loss knapp über das Hoch der Sternschnuppe legen.',
    rules: [
      'Tritt nach einem Aufwärtstrend auf',
      'Langer oberer Docht (mindestens 2x die Körperlänge)',
      'Kleiner Körper nahe dem Tagestief',
      'Kaum unterer Schatten',
    ],
  },
  hanging_man: {
    type: 'hanging_man',
    name: 'Hanging Man',
    germanName: 'Hängender Mann',
    signal: 'bearish',
    reliability: 'Mittel',
    description: 'Sieht exakt aus wie ein Hammer, tritt aber nach einer Aufwärtsbewegung an Widerständen auf und warnt vor Erschöpfung der Käufer.',
    psychology: 'Obwohl die Käufer den Preis vorerst stützen konnten, zeigt der tiefe Schatten, dass Verkäufer bereits erfolgreich Liquidität abgrasen.',
    confirmation: 'Bärische Folgekerze, die unter dem Körper des Hanging Man schließt.',
    rules: [
      'Tritt am Ende eines Aufwärtstrends auf',
      'Langer unterer Schatten (2x Körpergröße)',
      'Kleiner Körper am oberen Ende',
    ],
  },
  doji: {
    type: 'doji',
    name: 'Doji',
    germanName: 'Klassisches Doji (Unentschlossenheit)',
    signal: 'neutral',
    reliability: 'Mittel',
    description: 'Eine Kerze, bei der Eröffnungs- und Schlusskurs nahezu identisch sind. Sie signalisiert ein vollkommenes Gleichgewicht zwischen Käufern und Verkäufern.',
    psychology: 'Weder Bullen noch Bären konnten die Kontrolle gewinnen. Häufig ein Vorbote einer bevorstehenden Trendwende oder Trendpause.',
    confirmation: 'Nicht isoliert handeln! Ausbruch aus der Doji-Spanne in Richtung der Folgekerze abwarten.',
    rules: [
      'Eröffnung und Schluss liegen extrem nah beieinander (< 10% der Kerzenspanne)',
      'Schatten nach oben und unten vorhanden',
    ],
  },
  dragonfly_doji: {
    type: 'dragonfly_doji',
    name: 'Dragonfly Doji',
    germanName: 'Libellen-Doji (Bullisch)',
    signal: 'bullish',
    reliability: 'Hoch',
    description: 'Doji mit langem unteren Schatten und Eröffnungs-/Schlusskurs direkt am Hoch der Kerze.',
    psychology: 'Extrem starkes Abweisen tieferer Preise durch aggressive Käufer.',
    confirmation: 'Bullische Folgekerze mit Gap oder starkem Momentum nach oben.',
    rules: [
      'Eröffnung, Hoch und Schluss sind fast identisch',
      'Sehr langer unterer Schatten',
    ],
  },
  gravestone_doji: {
    type: 'gravestone_doji',
    name: 'Gravestone Doji',
    germanName: 'Grabstein-Doji (Bärisch)',
    signal: 'bearish',
    reliability: 'Hoch',
    description: 'Doji mit langem oberen Schatten und Eröffnungs-/Schlusskurs direkt am Tief der Kerze.',
    psychology: 'Käufer trieben den Preis hoch, wurden aber bis zum Ende der Periode komplett liquidiert.',
    confirmation: 'Bärische Folgekerze, die neues Tief markiert.',
    rules: [
      'Eröffnung, Tief und Schluss sind fast identisch',
      'Sehr langer oberer Schatten',
    ],
  },
  bullish_engulfing: {
    type: 'bullish_engulfing',
    name: 'Bullish Engulfing',
    germanName: 'Bullische Übernahme',
    signal: 'bullish',
    reliability: 'Hoch',
    description: 'Eine 2-Kerzen-Formation: Eine kleine bärische Kerze wird vom größeren Körper einer folgenden bullischen Kerze vollständig umschlossen.',
    psychology: 'Käufer überrollen die Verkäufer mit überwältigender Macht. Das Abwärtsmomentum wird schlagartig ausgelöscht.',
    confirmation: 'Einstieg beim Schluss der grünen Kerze oder beim Retest. Stop-Loss unter das Tief beider Kerzen.',
    rules: [
      'Erste Kerze rot / bärisch',
      'Zweite Kerze grün / bullisch',
      'Der grüne Körper umschließt den roten Körper vollständig',
      'Tritt vorzugsweise an Unterstützungen auf',
    ],
  },
  bearish_engulfing: {
    type: 'bearish_engulfing',
    name: 'Bearish Engulfing',
    germanName: 'Bärische Übernahme',
    signal: 'bearish',
    reliability: 'Hoch',
    description: 'Eine 2-Kerzen-Formation: Eine vorangehende grüne Kerze wird vollständig vom Körper einer kräftigen roten Kerze verschlungen.',
    psychology: 'Käufer scheitern am Widerstand. Massive Verkäufe drücken den Preis weit unter die vorherige Eröffnung.',
    confirmation: 'Einstieg Short beim Schluss der roten Kerze. Stop-Loss knapp über das Hoch der Formation.',
    rules: [
      'Erste Kerze grün / bullisch',
      'Zweite Kerze rot / bärisch',
      'Der rote Körper verschlingt den vorherigen grünen Körper komplett',
    ],
  },
  morning_star: {
    type: 'morning_star',
    name: 'Morning Star',
    germanName: 'Morgenstern (3-Kerzen Umkehr)',
    signal: 'bullish',
    reliability: 'Hoch',
    description: 'Ein mächtiges 3-Kerzen-Muster: Lange rote Kerze, gefolgt von einer kleinen Kerze (Stern) mit Gap/Kompression, abgeschlossen durch eine starke grüne Kerze.',
    psychology: 'Bären dominieren Tag 1. Tag 2 zeigt Stillstand und Trenderschöpfung. Tag 3 bringt den dynamischen Sieg der Bullen.',
    confirmation: 'Dritte Kerze schließt mindestens über 50% des Körpers der ersten roten Kerze.',
    rules: [
      '1. Kerze: Groß und bärisch',
      '2. Kerze: Kleiner Körper (Doji oder Spinn-Top)',
      '3. Kerze: Groß und bullisch (dringt tief in 1. Kerze ein)',
    ],
  },
  evening_star: {
    type: 'evening_star',
    name: 'Evening Star',
    germanName: 'Abendstern (3-Kerzen Umkehr)',
    signal: 'bearish',
    reliability: 'Hoch',
    description: 'Das bärische Pendant zum Morning Star: Große grüne Kerze, kleine Stern-Kerze am Hoch, gefolgt von einer massiven roten Kerze.',
    psychology: 'Aufwärtstrend verliert abrupt an Kraft. Verkäufer übernehmen aggressiv die Kontrolle.',
    confirmation: 'Dritte rote Kerze schließt mindestens unter 50% der ersten grünen Kerze.',
    rules: [
      '1. Kerze: Groß und bullisch',
      '2. Kerze: Kleiner Körper am Hoch',
      '3. Kerze: Stark bärisch',
    ],
  },
  piercing_line: {
    type: 'piercing_line',
    name: 'Piercing Line',
    germanName: 'Durchstoßende Linie (Bullisch)',
    signal: 'bullish',
    reliability: 'Mittel',
    description: 'Zweiteilige Umkehr: Nach einer roten Kerze eröffnet die grüne Kerze tiefer, schließt aber über der Mitte des roten Körpers.',
    psychology: 'Anfangs setzen Bären die Verkäufe fort, doch Käufer fangen die Liquidität auf und drängen die Bären in die Defensive.',
    confirmation: 'Folgekerze schlägt weiteres Hoch an.',
    rules: [
      '1. Kerze: Rot / bärisch',
      '2. Kerze eröffnet unter Vorab-Tief, schließt aber > 50% in den vorherigen Körper',
    ],
  },
  dark_cloud_cover: {
    type: 'dark_cloud_cover',
    name: 'Dark Cloud Cover',
    germanName: 'Dunkle Wolkendecke (Bärisch)',
    signal: 'bearish',
    reliability: 'Mittel',
    description: 'Nach einer starken grünen Kerze eröffnet die nächste höher, schließt dann jedoch tief im Körper der ersten Kerze (> 50%).',
    psychology: 'Kaufwelle entpuppt sich als Bullenfalle (Bull Trap).',
    confirmation: 'Bärischer Durchbruch unter das Tief beider Kerzen.',
    rules: [
      '1. Kerze: Groß und grün',
      '2. Kerze eröffnet hoch, schließt aber unter 50% des grünen Körpers',
    ],
  },
  three_white_soldiers: {
    type: 'three_white_soldiers',
    name: 'Three White Soldiers',
    germanName: 'Drei weiße Soldaten',
    signal: 'bullish',
    reliability: 'Hoch',
    description: 'Drei aufeinanderfolgende lange grüne Kerzen mit jeweils höheren Hochs und Schlusspreisen nahe dem jeweiligen Hoch.',
    psychology: 'Anhaltender, unnachgiebiger Kaufdruck ohne wesentliche Korrekturen.',
    confirmation: 'Sehr starkes Fortsetzungssignal. Vorsicht vor kurzzeitiger Überdehnung (Pullback-Einstieg bevorzugen).',
    rules: [
      'Drei aufeinanderfolgende grüne Kerzen',
      'Jede Kerze schließt nahe ihrem Hoch',
      'Jede Eröffnung liegt im Körper der vorigen Kerze',
    ],
  },
  three_black_crows: {
    type: 'three_black_crows',
    name: 'Three Black Crows',
    germanName: 'Drei schwarze Krähen',
    signal: 'bearish',
    reliability: 'Hoch',
    description: 'Drei aufeinanderfolgende lange rote Kerzen mit fortlaufend tieferen Tiefs und Schlusspreisen nahe den Tagestiefs.',
    psychology: 'Panik- oder Institutional-Selloff ohne Kaufwiderstand.',
    confirmation: 'Starkes bärisches Signal; Stop über dem Hoch der ersten Krähe.',
    rules: [
      'Drei aufeinanderfolgende rote Kerzen',
      'Jede Kerze schließt nahe ihrem Tief',
    ],
  },
  tweezer_bottom: {
    type: 'tweezer_bottom',
    name: 'Tweezer Bottom',
    germanName: 'Pinzetten-Boden (Doppeltief)',
    signal: 'bullish',
    reliability: 'Mittel',
    description: 'Zwei aufeinanderfolgende Kerzen mit exakt oder nahezu gleichem Tiefstand an einer signifikanten Unterstützung.',
    psychology: 'Bären scheitern zweimal hintereinander daran, ein neues Tief zu durchbrechen. Ein stabiler Boden entsteht.',
    confirmation: 'Bullischer Ausbruch über das Zwischenhoch der beiden Kerzen.',
    rules: [
      'Tiefs beider Kerzen sind fast identisch (Abweichung < 2 Pips)',
      'Erste Kerze bärisch, zweite Kerze bullisch',
    ],
  },
  tweezer_top: {
    type: 'tweezer_top',
    name: 'Tweezer Top',
    germanName: 'Pinzetten-Dach (Doppelhoch)',
    signal: 'bearish',
    reliability: 'Mittel',
    description: 'Zwei Kerzen mit gleichem Hochstand, an dem der Kurs zweimal abprallt.',
    psychology: 'Starker Verkaufsauftrag blockiert die Rallye zuverlässig.',
    confirmation: 'Bruch unter das Zwischentief.',
    rules: [
      'Hochs beider Kerzen liegen auf gleicher Höhe',
      'Erste Kerze bullisch, zweite bärisch',
    ],
  },
};

/**
 * Detect all candlestick patterns in a given array of candles
 */
export function detectPatterns(candles: Candle[]): DetectedPattern[] {
  const detected: DetectedPattern[] = [];
  if (candles.length < 2) return detected;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const prev = i > 0 ? candles[i - 1] : null;
    const prev2 = i > 1 ? candles[i - 2] : null;

    const range = c.high - c.low;
    if (range <= 0) continue;

    const body = Math.abs(c.close - c.open);
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const isBullish = c.close >= c.open;
    const isBearish = c.close < c.open;

    // Approximate prior trend by examining last 3-5 candles
    let priorTrend: 'down' | 'up' | 'flat' = 'flat';
    if (i >= 3) {
      const avgPrior = (candles[i - 3].close + candles[i - 2].close + candles[i - 1].close) / 3;
      if (avgPrior > c.close) priorTrend = 'down';
      else if (avgPrior < c.close) priorTrend = 'up';
    }

    // 1. DOJI check
    if (body <= range * 0.1) {
      if (lowerWick >= range * 0.65 && upperWick <= range * 0.15) {
        addPattern(detected, c, i, 'dragonfly_doji', c.low);
        continue;
      } else if (upperWick >= range * 0.65 && lowerWick <= range * 0.15) {
        addPattern(detected, c, i, 'gravestone_doji', c.high);
        continue;
      } else if (upperWick >= range * 0.25 && lowerWick >= range * 0.25) {
        addPattern(detected, c, i, 'doji', c.close);
        continue;
      }
    }

    // 2. HAMMER (in downtrend, long lower wick, small body at top)
    if (
      lowerWick >= body * 2 &&
      upperWick <= body * 0.4 &&
      body >= range * 0.15 &&
      body <= range * 0.45 &&
      priorTrend === 'down'
    ) {
      addPattern(detected, c, i, 'hammer', c.low);
      continue;
    }

    // 3. SHOOTING STAR (in uptrend, long upper wick, small body at bottom)
    if (
      upperWick >= body * 2 &&
      lowerWick <= body * 0.4 &&
      body >= range * 0.15 &&
      body <= range * 0.45 &&
      priorTrend === 'up'
    ) {
      addPattern(detected, c, i, 'shooting_star', c.high);
      continue;
    }

    // 4. INVERTED HAMMER (downtrend, long upper wick, small body at bottom)
    if (
      upperWick >= body * 2 &&
      lowerWick <= body * 0.4 &&
      body >= range * 0.15 &&
      body <= range * 0.45 &&
      priorTrend === 'down'
    ) {
      addPattern(detected, c, i, 'inverted_hammer', c.low);
      continue;
    }

    // 5. HANGING MAN (uptrend, long lower wick, small body at top)
    if (
      lowerWick >= body * 2 &&
      upperWick <= body * 0.4 &&
      body >= range * 0.15 &&
      body <= range * 0.45 &&
      priorTrend === 'up'
    ) {
      addPattern(detected, c, i, 'hanging_man', c.high);
      continue;
    }

    // TWO-CANDLE PATTERNS (requires prev)
    if (prev) {
      const prevBody = Math.abs(prev.close - prev.open);
      const prevIsBullish = prev.close >= prev.open;
      const prevIsBearish = prev.close < prev.open;

      // BULLISH ENGULFING
      if (
        prevIsBearish &&
        isBullish &&
        c.open <= prev.close &&
        c.close >= prev.open &&
        body > prevBody * 1.1
      ) {
        addPattern(detected, c, i, 'bullish_engulfing', c.low);
        continue;
      }

      // BEARISH ENGULFING
      if (
        prevIsBullish &&
        isBearish &&
        c.open >= prev.close &&
        c.close <= prev.open &&
        body > prevBody * 1.1
      ) {
        addPattern(detected, c, i, 'bearish_engulfing', c.high);
        continue;
      }

      // PIERCING LINE (Bullish: opens below prev low, closes > 50% into prev red body)
      if (
        prevIsBearish &&
        isBullish &&
        c.open < prev.low &&
        c.close > (prev.open + prev.close) / 2 &&
        c.close < prev.open
      ) {
        addPattern(detected, c, i, 'piercing_line', c.low);
        continue;
      }

      // DARK CLOUD COVER (Bearish: opens above prev high, closes > 50% into prev green body)
      if (
        prevIsBullish &&
        isBearish &&
        c.open > prev.high &&
        c.close < (prev.open + prev.close) / 2 &&
        c.close > prev.open
      ) {
        addPattern(detected, c, i, 'dark_cloud_cover', c.high);
        continue;
      }

      // TWEEZER BOTTOM (similar lows)
      const lowDiff = Math.abs(c.low - prev.low);
      if (lowDiff <= range * 0.05 && prevIsBearish && isBullish) {
        addPattern(detected, c, i, 'tweezer_bottom', c.low);
        continue;
      }

      // TWEEZER TOP (similar highs)
      const highDiff = Math.abs(c.high - prev.high);
      if (highDiff <= range * 0.05 && prevIsBullish && isBearish) {
        addPattern(detected, c, i, 'tweezer_top', c.high);
        continue;
      }
    }

    // THREE-CANDLE PATTERNS (requires prev and prev2)
    if (prev && prev2) {
      const prev2IsBearish = prev2.close < prev2.open;
      const prev2IsBullish = prev2.close > prev2.open;
      const prevBody = Math.abs(prev.close - prev.open);
      const prev2Body = Math.abs(prev2.close - prev2.open);

      // MORNING STAR
      if (
        prev2IsBearish &&
        prevBody < prev2Body * 0.4 &&
        isBullish &&
        c.close > (prev2.open + prev2.close) / 2 &&
        body > prevBody * 1.5
      ) {
        addPattern(detected, c, i, 'morning_star', Math.min(c.low, prev.low));
        continue;
      }

      // EVENING STAR
      if (
        prev2IsBullish &&
        prevBody < prev2Body * 0.4 &&
        isBearish &&
        c.close < (prev2.open + prev2.close) / 2 &&
        body > prevBody * 1.5
      ) {
        addPattern(detected, c, i, 'evening_star', Math.max(c.high, prev.high));
        continue;
      }

      // THREE WHITE SOLDIERS
      if (
        isBullish &&
        prev.close > prev.open &&
        prev2.close > prev2.open &&
        c.close > prev.close &&
        prev.close > prev2.close &&
        c.open > prev.open &&
        prev.open > prev2.open
      ) {
        addPattern(detected, c, i, 'three_white_soldiers', c.high);
        continue;
      }

      // THREE BLACK CROWS
      if (
        isBearish &&
        prev.close < prev.open &&
        prev2.close < prev2.open &&
        c.close < prev.close &&
        prev.close < prev2.close &&
        c.open < prev.open &&
        prev.open < prev2.open
      ) {
        addPattern(detected, c, i, 'three_black_crows', c.low);
        continue;
      }
    }
  }

  return detected;
}

function addPattern(
  list: DetectedPattern[],
  c: Candle,
  index: number,
  type: CandlePatternType,
  price: number
) {
  const def = PATTERN_DEFINITIONS[type];
  list.push({
    id: `${type}-${c.time}`,
    time: c.time,
    candleIndex: index,
    type,
    name: def.name,
    germanName: def.germanName,
    signal: def.signal,
    description: def.description,
    psychology: def.psychology,
    confirmation: def.confirmation,
    reliability: def.reliability,
    price,
  });
}

export interface PatternCategory {
  id: string;
  name: string;
  description: string;
  types: CandlePatternType[];
}

export const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: 'hammer',
    name: 'Hammer & Inverted Hammer',
    description: 'Bullische Umkehr nach Abwärtsbewegungen',
    types: ['hammer', 'inverted_hammer'],
  },
  {
    id: 'engulfing',
    name: 'Engulfing (Bullish / Bearish)',
    description: 'Starke Übernahmekerzen',
    types: ['bullish_engulfing', 'bearish_engulfing'],
  },
  {
    id: 'doji',
    name: 'Doji (Standard, Libelle, Grabstein)',
    description: 'Unentschlossenheit & Gleichgewicht',
    types: ['doji', 'dragonfly_doji', 'gravestone_doji'],
  },
  {
    id: 'shooting_star',
    name: 'Shooting Star & Hanging Man',
    description: 'Bärische Erschöpfung an Hochs',
    types: ['shooting_star', 'hanging_man'],
  },
  {
    id: 'stars',
    name: 'Morning & Evening Star',
    description: 'Klassische 3-Kerzen-Trendwenden',
    types: ['morning_star', 'evening_star'],
  },
  {
    id: 'soldiers_crows',
    name: 'Three Soldiers & Crows',
    description: 'Starke Impuls- und Fortsetzungsmuster',
    types: ['three_white_soldiers', 'three_black_crows'],
  },
  {
    id: 'tweezers',
    name: 'Tweezer Tops & Bottoms',
    description: 'Doppelhoch / Doppeltief an Marken',
    types: ['tweezer_top', 'tweezer_bottom'],
  },
  {
    id: 'piercing_dark',
    name: 'Piercing Line & Dark Cloud',
    description: 'Tief eindringende Umkehrkerzen',
    types: ['piercing_line', 'dark_cloud_cover'],
  },
];

export const ALL_PATTERN_TYPES: CandlePatternType[] = Object.keys(PATTERN_DEFINITIONS) as CandlePatternType[];
