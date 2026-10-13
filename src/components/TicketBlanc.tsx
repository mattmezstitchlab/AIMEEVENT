import { Check, Heart } from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { sensorielDe } from "../data/innovations";
import { useFavorites } from "../hooks/useFavorites";
import { useEspaceStore } from "../hooks/useEspaceStore";

interface TicketBlancProps {
  event: RendezVous;
  moisNom: string;
  onReserve: (e: RendezVous) => void;
  actif?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

/**
 * Le Ticket Officiel AIME EVENT — Format Carré compact (285×285 / 305×305),
 * tous de la même taille, 100 % blanc opaque avec vraies encoches transparentes.
 */
export default function TicketBlanc({
  event,
  moisNom,
  onReserve,
  actif = true,
  onSelect,
}: TicketBlancProps) {
  const univers = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
  const gratuit = event.prix === 0;
  const { has, toggle } = useFavorites();
  const { billets } = useEspaceStore();
  const aime = has(event.id);
  const dejaReserve = billets.some((b) => b.id === event.id);
  const sensoriel = sensorielDe(event.id);
  const ratioSensoriel = Math.min(
    100,
    Math.round(((sensoriel.bruit + sensoriel.foule + sensoriel.lumiere) / 15) * 100),
  );

  // Vraies encoches perforées transparentes à 58px du bas du carré compact
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "radial-gradient(circle at 0 calc(100% - 58px), transparent 9.5px, black 10px), radial-gradient(circle at 100% calc(100% - 58px), transparent 9.5px, black 10px)",
    WebkitMaskPosition: "left top, right top",
    WebkitMaskSize: "51% 100%, 51% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskImage:
      "radial-gradient(circle at 0 calc(100% - 58px), transparent 9.5px, black 10px), radial-gradient(circle at 100% calc(100% - 58px), transparent 9.5px, black 10px)",
    maskPosition: "left top, right top",
    maskSize: "51% 100%, 51% 100%",
    maskRepeat: "no-repeat",
  };

  return (
    <article
      onClick={onSelect}
      style={maskStyle}
      className={`relative flex aspect-square h-[280px] w-[280px] flex-col justify-between overflow-hidden rounded-[24px] bg-white text-[#0a0a0c] transition-transform duration-500 sm:h-[300px] sm:w-[300px] ${
        onSelect ? "cursor-pointer" : ""
      } ${actif ? "scale-100" : "scale-[0.95] hover:scale-[0.98]"}`}
    >
      {/* Filet supérieur Aurore */}
      <div className="h-[3.5px] w-full shrink-0 bg-event-gradient" />

      {/* ——— PARTIE HAUTE DU CARRÉ COMPACT ——— */}
      <div className="flex flex-1 flex-col justify-between px-5 pb-2.5 pt-3.5 sm:px-5 sm:pt-4">
        <div>
          {/* Ligne 1 : AIME EVENT · #ID à gauche + Picto Cœur à droite */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#0a0a0c]/45">
              AIME EVENT · #{event.id}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(event.id);
              }}
              title={aime ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
              aria-label={aime ? "Retirer de mes favoris" : "Ajouter à mes favoris"}
              aria-pressed={aime}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                aime
                  ? "border-[#ff375f]/30 bg-[#ff375f]/10 text-[#ff375f]"
                  : "border-black/10 bg-black/[0.03] text-[#0a0a0c]/55 hover:bg-black/[0.08] hover:text-[#0a0a0c]"
              }`}
            >
              <Heart className={`h-3 w-3 ${aime ? "fill-current text-[#ff375f]" : ""}`} />
            </button>
          </div>

          {/* Ligne 2 : Date & Horaire */}
          <p className="mt-1 font-display text-[13.5px] font-bold leading-tight tracking-[-0.02em] text-[#0a0a0c] sm:text-[14.5px]">
            {event.jour} {moisNom.toLowerCase()} · {event.heure}
          </p>

          {/* Ligne 3 : Grand Titre */}
          <h3 className="mt-0.5 line-clamp-2 font-display text-[20px] font-extrabold leading-[1.04] tracking-[-0.035em] text-[#0a0a0c] sm:text-[22px]">
            {event.nom}
          </h3>

          {/* Ligne 4 : Univers · Format (Durée) + Résumé */}
          <p className="mt-1.5 truncate text-[11px] font-semibold text-[#0a0a0c]/70">
            {univers.nom} · {event.format} ({event.duree})
          </p>
          <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-[#0a0a0c]/55">
            {event.resume}
          </p>
        </div>

        {/* Ligne 5 : Confort Sensoriel + Jauge Aurore fine */}
        <div className="pt-1.5">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#0a0a0c]/40">
            CONFORT SENSORIEL ·{" "}
            {sensoriel.access.includes("PMR") ? "ACCÈS PMR" : "TOUS PUBLICS"}
          </p>
          <div className="mt-1 h-[2.5px] w-32 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full bg-event-gradient"
              style={{ width: `${ratioSensoriel}%` }}
            />
          </div>
        </div>
      </div>

      {/* ——— LIGNE POINTILLÉE ALIGNÉE PILE SUR LES ENCOCHES TRANSPARENTES (58px du bas) ——— */}
      <div className="mx-4 border-t border-dashed border-black/15" aria-hidden="true" />

      {/* ——— TALON DU CARRÉ (h-[58px] fixe) : ID seul à gauche + Bouton à droite ——— */}
      <div className="flex h-[58px] shrink-0 items-center justify-between gap-2 px-5">
        <p className="font-mono text-[9px] font-semibold tracking-[0.1em] text-[#0a0a0c]/45">
          ID · AIME-2027-{event.id}48
        </p>

        {dejaReserve ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReserve(event);
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-400 px-3.5 py-2 text-[11px] font-bold text-black transition hover:brightness-105"
          >
            <Check className="h-3 w-3" /> Réservé
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReserve(event);
            }}
            data-cursor="Réserver"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0a0a0c] px-3.5 py-2 text-[11px] font-bold tracking-[-0.01em] text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {gratuit ? "Entrée libre" : `Réserver · ${event.prix} €`}
          </button>
        )}
      </div>
    </article>
  );
}
