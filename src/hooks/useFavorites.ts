import { useSyncExternalStore } from "react";

const STORAGE_KEY = "aime-event-mon-programme";

function lire(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

let etat: string[] = typeof window !== "undefined" ? lire() : [];
const abonnes = new Set<() => void>();

function ecrire(ids: string[]) {
  etat = ids;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* stockage indisponible — on garde l'état en mémoire */
  }
  abonnes.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  abonnes.add(fn);
  return () => abonnes.delete(fn);
}

function getSnapshot() {
  return etat;
}

export function toggleFavori(id: string) {
  ecrire(etat.includes(id) ? etat.filter((x) => x !== id) : [...etat, id]);
}

export function estFavori(id: string) {
  return etat.includes(id);
}

/** Hook partagé : toute l'app voit la même liste de favoris, synchronisée via localStorage */
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => []);
  return { ids, toggle: toggleFavori, has: (id: string) => ids.includes(id) };
}
