/* Innovations inédites — issues des plaintes mondiales (scalping, solitude,
   tickets gaspillés, surcharge sensorielle, heures bénévoles non convertibles). */

import { TOUS_LES_EVENEMENTS } from "./annee";

export interface Sensoriel {
  bruit: 1 | 2 | 3 | 4 | 5;   // 1 = silence, 5 = rave
  foule: 1 | 2 | 3 | 4 | 5;
  lumiere: 1 | 2 | 3 | 4 | 5; // 1 = tamisé, 5 = stroboscope
  assis: boolean;
  salleCalme: boolean;
  access: string[];
}

/** Profils sensoriels — ce que DICE, Eventbrite, Fever n'affichent jamais. */
export const SENSORIEL: Record<string, Sensoriel> = {
  "01": { bruit: 1, foule: 2, lumiere: 1, assis: true,  salleCalme: true,  access: ["PMR", "boucle inductive", "places assises"] },
  "02": { bruit: 2, foule: 2, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "places assises"] },
  "03": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: false, access: ["PMR", "familles"] },
  "04": { bruit: 3, foule: 3, lumiere: 3, assis: false, salleCalme: false, access: ["PMR"] },
  "05": { bruit: 4, foule: 4, lumiere: 3, assis: false, salleCalme: false, access: ["PMR", "enfants"] },
  "06": { bruit: 3, foule: 3, lumiere: 3, assis: false, salleCalme: false, access: ["PMR"] },
  "07": { bruit: 4, foule: 5, lumiere: 4, assis: false, salleCalme: false, access: ["PMR", "espace calme"] },
  "08": { bruit: 4, foule: 4, lumiere: 4, assis: false, salleCalme: false, access: ["PMR"] },
  "09": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "places assises", "sous-titrage"] },
  "10": { bruit: 3, foule: 4, lumiere: 3, assis: true,  salleCalme: false, access: ["PMR", "menus allergènes"] },
  "11": { bruit: 2, foule: 2, lumiere: 2, assis: false, salleCalme: true,  access: ["PMR", "enfants"] },
  "12": { bruit: 5, foule: 4, lumiere: 5, assis: false, salleCalme: false, access: ["18+", "espace calme"] },
  "13": { bruit: 3, foule: 2, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "familles"] },
  "14": { bruit: 2, foule: 3, lumiere: 1, assis: false, salleCalme: true,  access: ["PMR"] },
  "15": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: false, access: ["PMR", "familles"] },
  "16": { bruit: 5, foule: 5, lumiere: 5, assis: false, salleCalme: false, access: ["18+", "espace calme", "safe team"] },
  "17": { bruit: 3, foule: 3, lumiere: 2, assis: false, salleCalme: false, access: ["PMR", "tout âge"] },
  "18": { bruit: 3, foule: 4, lumiere: 3, assis: false, salleCalme: false, access: ["PMR"] },
  "19": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "places assises"] },
  "20": { bruit: 3, foule: 3, lumiere: 2, assis: false, salleCalme: true,  access: ["18+"] },
  "21": { bruit: 3, foule: 3, lumiere: 3, assis: false, salleCalme: false, access: ["enfants", "PMR"] },
  "22": { bruit: 3, foule: 3, lumiere: 3, assis: true,  salleCalme: false, access: ["PMR", "menus allergènes"] },
  "23": { bruit: 4, foule: 5, lumiere: 4, assis: false, salleCalme: false, access: ["PMR", "enfants"] },
  "24": { bruit: 4, foule: 3, lumiere: 3, assis: false, salleCalme: false, access: ["PMR"] },
  "25": { bruit: 4, foule: 4, lumiere: 3, assis: false, salleCalme: false, access: ["PMR"] },
  "26": { bruit: 3, foule: 3, lumiere: 3, assis: true,  salleCalme: false, access: ["PMR"] },
  "27": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "places assises"] },
  "28": { bruit: 2, foule: 3, lumiere: 2, assis: true,  salleCalme: true,  access: ["PMR", "places assises"] },
  "29": { bruit: 4, foule: 4, lumiere: 3, assis: false, salleCalme: false, access: ["PMR", "tout âge"] },
  "30": { bruit: 4, foule: 5, lumiere: 4, assis: false, salleCalme: false, access: ["PMR"] },
  "31": { bruit: 5, foule: 5, lumiere: 5, assis: false, salleCalme: false, access: ["18+", "espace calme", "safe team"] },
  "32": { bruit: 3, foule: 4, lumiere: 2, assis: false, salleCalme: false, access: ["PMR", "tout âge"] },
};

export const NIVEAU = ["", "très bas", "bas", "modéré", "élevé", "très élevé"];

export function sensorielDe(id: string): Sensoriel {
  return SENSORIEL[id] ?? { bruit: 3, foule: 3, lumiere: 3, assis: false, salleCalme: false, access: [] };
}

/** Combien de personnes dans le cercle (opt-in « je viens seul·e ») — simulation stable. */
export function tailleCercle(eventId: string): number {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) h = (h * 31 + eventId.charCodeAt(i)) >>> 0;
  return 3 + (h % 14);
}

export function evenementsQuiSeChevauchent(ids: string[]): { a: string; b: string }[] {
  const items = ids
    .map((id) => TOUS_LES_EVENEMENTS.find((x) => x.event.id === id))
    .filter(Boolean) as typeof TOUS_LES_EVENEMENTS;
  const pairs: { a: string; b: string }[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].mois.id === items[j].mois.id && items[i].event.jour === items[j].event.jour) {
        pairs.push({ a: items[i].event.nom, b: items[j].event.nom });
      }
    }
  }
  return pairs;
}
