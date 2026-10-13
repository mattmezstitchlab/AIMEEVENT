import { useSyncExternalStore } from "react";

/** Mini-store de sets persistés (cercle, solidarité…) — même pattern que les favoris. */
export function createSetStore(key: string) {
  let etat: string[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) etat = JSON.parse(raw) as string[];
  } catch { /* */ }
  const abonnes = new Set<() => void>();
  const ecrire = (ids: string[]) => {
    etat = ids;
    try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* */ }
    abonnes.forEach((fn) => fn());
  };
  const subscribe = (fn: () => void) => { abonnes.add(fn); return () => abonnes.delete(fn); };
  const has = (id: string) => etat.includes(id);
  const toggle = (id: string) => ecrire(etat.includes(id) ? etat.filter((x) => x !== id) : [...etat, id]);
  const add = (id: string) => { if (!etat.includes(id)) ecrire([...etat, id]); };
  return {
    has,
    toggle,
    add,
    useStore() {
      const ids = useSyncExternalStore(subscribe, () => etat, () => [] as string[]);
      return {
        ids,
        has: (id: string) => ids.includes(id),
        toggle,
        add,
      };
    },
  };
}

export const cercleStore = createSetStore("aime-cercle");
export const solidariteStore = createSetStore("aime-solidarite");
