import { Calendar, Download, Heart, X } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { UNIVERS_PAR_ID } from "../data/annee";
import { exporterEvenement, exporterProgramme } from "../utils/ics";
import { useEspaceStore } from "../hooks/useEspaceStore";

/**
 * Tiroir de sélection personnelle ("Mon programme") ouvert depuis le picto Cœur du Dock.
 * Zéro gros bouton flottant qui encombre le bas de l'écran.
 */
export default function FavoritesTray({
  open,
  onClose,
  onOpenMonth,
}: {
  open: boolean;
  onClose: () => void;
  onOpenMonth: (id: string) => void;
}) {
  const { ids, toggle } = useFavorites();
  const { tousLesEvenements } = useEspaceStore();

  if (!open) return null;

  const items = tousLesEvenements.filter(({ event }) => ids.includes(event.id));

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 pb-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apple-glass relative w-full max-w-sm overflow-hidden rounded-[26px]"
        style={{ animation: "heroUp 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="h-[1.5px] w-full bg-event-gradient" />

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="flex items-center gap-2 font-display text-sm font-bold tracking-[-0.015em] text-white">
            <Heart className="h-4 w-4 fill-[#ff375f] text-[#ff375f]" /> Ma sélection ({ids.length})
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-white/50">
            Touchez le picto cœur en haut à droite d'un rendez-vous pour l'ajouter à votre sélection.
          </div>
        ) : (
          <>
            <div className="max-h-[42vh] divide-y divide-white/[0.07] overflow-y-auto">
              {items.map(({ event, mois }) => (
                <div key={event.id} className="flex items-center gap-3 px-5 py-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMonth(mois.id);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate font-display text-[13px] font-bold tracking-tight text-white">
                      {event.nom}
                    </span>
                    <span className="block truncate text-[10.5px] text-white/45">
                      {mois.nom} · {UNIVERS_PAR_ID[event.univers].nom} · {event.jour}
                    </span>
                  </button>
                  <button
                    onClick={() => exporterEvenement(event, mois)}
                    title="Ajouter à mon calendrier"
                    aria-label={`Ajouter ${event.nom} au calendrier`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white hover:text-black"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toggle(event.id)}
                    title="Retirer"
                    aria-label={`Retirer ${event.nom}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white hover:text-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => exporterProgramme(items)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[12px] font-semibold text-black transition hover:bg-white/90"
              >
                <Download className="h-3.5 w-3.5" /> Exporter vers mon agenda ({items.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
