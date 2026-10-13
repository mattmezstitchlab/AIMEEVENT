import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Command, CornerDownLeft, Search, Sparkles, Ticket, X } from "lucide-react";
import { CALENDRIER, TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID } from "../data/annee";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenMonth: (id: string) => void;
  onAcces: () => void;
}

export default function CommandPalette({ open, onClose, onOpenMonth, onAcces }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const resultats = useMemo(() => {
    const q = query.trim().toLowerCase();
    const evenements = TOUS_LES_EVENEMENTS.map(({ event, mois }) => ({
      type: "evenement" as const,
      id: event.id,
      titre: event.nom,
      sous: `${mois.nom} · ${UNIVERS_PAR_ID[event.univers].nom} · ${event.jour} ${event.heure}`,
      prix: event.prix,
      action: () => onOpenMonth(mois.id),
    }));
    const mois = CALENDRIER.map((m) => ({
      type: "mois" as const,
      id: m.id,
      titre: m.nom,
      sous: m.edition,
      prix: null as number | null,
      action: () => onOpenMonth(m.id),
    }));
    const raccourcis = [
      { type: "action" as const, id: "acces", titre: "Voir les accès & tarifs", sous: "Pass Saison, Carnet, Pass Âges", prix: null, action: onAcces },
    ];

    const all = [...evenements, ...mois, ...raccourcis];
    if (!q) return all.slice(0, 7);
    return all.filter((r) => `${r.titre} ${r.sous}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query, onOpenMonth, onAcces]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, resultats.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); const r = resultats[active]; if (r) { r.action(); onClose(); } }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resultats, active, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Recherche rapide" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0d] shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ animation: "heroUp 0.25s ease both" }}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Chercher un rendez-vous, un mois, une catégorie…"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          <button onClick={onClose} aria-label="Fermer la recherche" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:bg-white hover:text-black">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {resultats.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-white/40">Aucun résultat pour « {query} ».</p>
          )}
          {resultats.map((r, i) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => { r.action(); onClose(); }}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${i === active ? "bg-white/[0.07]" : ""}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                {r.type === "evenement" ? <Ticket className="h-3.5 w-3.5" /> : r.type === "mois" ? <Calendar className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold tracking-tight">{r.titre}</span>
                <span className="block truncate text-[11px] text-white/40">{r.sous}</span>
              </span>
              {r.prix !== null && (
                <span className={`shrink-0 text-[10px] font-extrabold uppercase tracking-[0.1em] ${r.prix === 0 ? "text-emerald-400" : "text-white/50"}`}>
                  {r.prix === 0 ? "Gratuit" : `${r.prix} €`}
                </span>
              )}
              {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-white/30" />}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          <span className="flex items-center gap-1.5"><Command className="h-3 w-3" /> K pour rouvrir, à tout moment</span>
          <span>↑↓ naviguer · ↵ ouvrir · Échap fermer</span>
        </div>
      </div>
    </div>
  );
}
