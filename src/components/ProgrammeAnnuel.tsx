import { useMemo } from "react";
import { ArrowUpDown, Volume2, X } from "lucide-react";
import { PROFILS, UNIVERS_PAR_ID, type PublicId, type RendezVous } from "../data/annee";
import { sensorielDe } from "../data/innovations";
import { Reveal } from "./Reveal";
import TicketBlanc from "./TicketBlanc";
import { useEspaceStore } from "../hooks/useEspaceStore";

export default function ProgrammeAnnuel({
  onReserve,
  moisFiltre = "tous",
  onChangeMoisFiltre,
  publicFiltre = "tous",
  onChangePublicFiltre,
  gratuitUniquement = false,
  onToggleGratuit,
  calmeUniquement = false,
  onToggleCalme,
  ordreDate = "asc",
  onToggleOrdreDate,
}: {
  onOpenMonth?: (id: string) => void;
  onAcces?: () => void;
  onReserve: (e: RendezVous) => void;
  moisFiltre?: string;
  onChangeMoisFiltre?: (m: string) => void;
  publicFiltre?: PublicId | "tous";
  onChangePublicFiltre?: (p: PublicId | "tous") => void;
  gratuitUniquement?: boolean;
  onToggleGratuit?: () => void;
  calmeUniquement?: boolean;
  onToggleCalme?: () => void;
  ordreDate?: "asc" | "desc";
  onToggleOrdreDate?: () => void;
}) {
  const { calendrierComplet } = useEspaceStore();

  const filtresActifs =
    moisFiltre !== "tous" ||
    publicFiltre !== "tous" ||
    gratuitUniquement ||
    calmeUniquement;

  // Aplatit tous les événements (1 ticket unique par événement) et les trie par date
  const evenementsTries = useMemo(() => {
    const liste: {
      event: RendezVous;
      moisId: string;
      moisNom: string;
      moisIndex: number;
      ordreGlobal: number;
    }[] = [];

    let compteur = 0;
    calendrierComplet.forEach((m, mIdx) => {
      if (moisFiltre !== "tous" && m.id !== moisFiltre) return;
      m.rendezVous.forEach((ev) => {
        compteur++;
        if (publicFiltre !== "tous" && !ev.publics.includes(publicFiltre)) return;
        if (gratuitUniquement && ev.prix !== 0) return;
        if (calmeUniquement) {
          const s = sensorielDe(ev.id);
          if (s.bruit > 2 && !s.salleCalme) return;
        }
        liste.push({
          event: ev,
          moisId: m.id,
          moisNom: m.nom,
          moisIndex: mIdx,
          ordreGlobal: compteur,
        });
      });
    });

    liste.sort((a, b) =>
      ordreDate === "asc"
        ? a.ordreGlobal - b.ordreGlobal
        : b.ordreGlobal - a.ordreGlobal,
    );

    return liste;
  }, [
    calendrierComplet,
    moisFiltre,
    publicFiltre,
    gratuitUniquement,
    calmeUniquement,
    ordreDate,
  ]);

  // Découpe les tickets en sections en bande (3 tickets par bande visuelle panoramique)
  const bandesVisuelles = useMemo(() => {
    const bandes: {
      id: string;
      image: string;
      alt: string;
      items: typeof evenementsTries;
    }[] = [];

    for (let i = 0; i < evenementsTries.length; i += 3) {
      const tranche = evenementsTries.slice(i, i + 3);
      const premier = tranche[0];
      const univers =
        UNIVERS_PAR_ID[premier.event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
      bandes.push({
        id: `bande-${premier.event.id}-${ordreDate}-${i}`,
        image: univers.image,
        alt: univers.alt,
        items: tranche,
      });
    }
    return bandes;
  }, [evenementsTries, ordreDate]);

  const reinitialiser = () => {
    onChangeMoisFiltre?.("tous");
    onChangePublicFiltre?.("tous");
    if (gratuitUniquement) onToggleGratuit?.();
    if (calmeUniquement) onToggleCalme?.();
  };

  return (
    <section
      id="programme"
      className="relative scroll-mt-20 bg-black px-[5vw] py-20 md:px-10 md:py-28"
      aria-label="Tous les rendez-vous en tickets"
    >
      <div className="mx-auto max-w-7xl">
        {/* ——— En-tête + Pictos publics & Tri par date synchronisés avec le Hero ——— */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal>
            <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
              Les Tickets 2027.{" "}
              <span className="text-white/40">{evenementsTries.length} rendez-vous.</span>
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#0b0b0e] p-1">
                {PROFILS.map(({ id, label }) => {
                  const actif = publicFiltre === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        onChangePublicFiltre?.(actif ? "tous" : id)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        actif
                          ? "bg-white text-black shadow"
                          : "text-white/65 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Tri par Date */}
              <button
                type="button"
                onClick={onToggleOrdreDate}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-[#0b0b0e] px-4 text-[12px] font-semibold text-white transition hover:border-white/35"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-white/70" />
                <span>{ordreDate === "asc" ? "Date ↑" : "Date ↓"}</span>
              </button>

              {/* Entrée libre */}
              <button
                type="button"
                onClick={onToggleGratuit}
                className={`inline-flex h-10 items-center rounded-full border px-4 text-[12px] font-semibold transition ${
                  gratuitUniquement
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-[#0b0b0e] text-white/80 hover:border-white/35 hover:text-white"
                }`}
              >
                Entrée libre
              </button>

              {/* Calme */}
              <button
                type="button"
                onClick={onToggleCalme}
                title="Ambiance calme"
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-semibold transition ${
                  calmeUniquement
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-[#0b0b0e] text-white/80 hover:border-white/35 hover:text-white"
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>

              {filtresActifs && (
                <button
                  type="button"
                  onClick={reinitialiser}
                  title="Réinitialiser les filtres"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {/* ——— SECTIONS EN BANDE : VISUEL PANORAMIQUE EN FOND + 1 TICKET BLANC UNIQUE PAR ÉVÉNEMENT ——— */}
        <div className="mt-10 space-y-8">
          {bandesVisuelles.map((bande) => (
            <div
              key={bande.id}
              className="relative overflow-hidden rounded-[34px] border border-white/12 p-5 sm:p-7 md:p-8"
            >
              {/* Visuel en bande panoramique en fond d'écran */}
              <img
                src={bande.image}
                alt={bande.alt}
                loading="lazy"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-black/45"
                aria-hidden="true"
              />

              {/* Grille des tickets blancs 100 % opaques (1 ticket unique par événement) */}
              <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {bande.items.map(({ event, moisNom }) => (
                  <TicketBlanc
                    key={event.id}
                    event={event}
                    moisNom={moisNom}
                    onReserve={onReserve}
                    compact
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
