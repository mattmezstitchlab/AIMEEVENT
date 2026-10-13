import { useState } from "react";
import { Calendar, ChevronUp, Download, Heart, X } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID } from "../data/annee";
import { exporterEvenement, exporterProgramme } from "../utils/ics";

/**
 * Programme personnel flottant : on "aime" des rendez-vous partout sur le site,
 * ils se retrouvent ici, exportables en un clic vers Google/Apple/Outlook.
 */
export default function FavoritesTray({ onOpenMonth }: { onOpenMonth: (id: string) => void }) {
  const { ids, toggle } = useFavorites();
  const [open, setOpen] = useState(false);

  if (ids.length === 0) return null;

  const items = TOUS_LES_EVENEMENTS.filter(({ event }) => ids.includes(event.id));

  return (
    <div className="fixed bottom-5 right-5 z-[95] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open && (
        <div
          className="w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0d] shadow-2xl"
          style={{ animation: "heroUp 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight">
              <Heart className="h-4 w-4 fill-[#ff4e6b] text-[#ff4e6b]" /> Mon programme
            </span>
            <button onClick={() => setOpen(false)} aria-label="Réduire" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:bg-white hover:text-black">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="max-h-[42vh] divide-y divide-white/[0.07] overflow-y-auto">
            {items.map(({ event, mois }) => (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3">
                <button onClick={() => onOpenMonth(mois.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-display text-[13px] font-bold tracking-tight">{event.nom}</span>
                  <span className="block truncate text-[10.5px] text-white/40">{mois.nom} · {UNIVERS_PAR_ID[event.univers].nom} · {event.jour}</span>
                </button>
                <button onClick={() => exporterEvenement(event, mois)} aria-label={`Ajouter ${event.nom} au calendrier`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-transparent hover:bg-white hover:text-black">
                  <Calendar className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toggle(event.id)} aria-label={`Retirer ${event.nom}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-transparent hover:bg-white hover:text-black">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => exporterProgramme(items)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-3 text-[11px] font-extrabold uppercase tracking-[0.13em] text-white transition hover:brightness-110"
            >
              <Download className="h-4 w-4" /> Exporter les {items.length} rendez-vous
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor={open ? "Fermer" : "Ouvrir"}
        className="group flex items-center gap-2.5 rounded-full bg-white px-5 py-3.5 text-[11.5px] font-extrabold uppercase tracking-[0.13em] text-black shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] transition hover:bg-event-gradient hover:text-white"
      >
        <Heart className="h-4 w-4 fill-current" />
        Mon programme ({ids.length})
        <ChevronUp className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
