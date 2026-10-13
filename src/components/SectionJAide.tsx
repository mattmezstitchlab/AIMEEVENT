import { useMemo, useState } from "react";
import { Check, FileText } from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { AIME_ID, MISSIONS } from "../data/espace";
import {
  basculerMissionEspace,
  convertirHeuresEnEuros,
  useEspaceStore,
} from "../hooks/useEspaceStore";

const COMPETENCES_FILTRE = [
  "Liées à l'événement",
  "Toutes",
  "Sourire",
  "Orientation",
  "Technique",
  "Animation",
  "Photo",
  "Cuisine",
  "Lecture",
];

export default function SectionJAide({
  activeEvent,
  activeMoisNom,
}: {
  activeEvent?: RendezVous;
  activeMoisNom?: string;
}) {
  const {
    missionsRejointes,
    heuresDisponibles,
    heuresValidees,
  } = useEspaceStore();

  const [filtreCompetence, setFiltreCompetence] = useState("Toutes");

  const universEvent = activeEvent ? UNIVERS_PAR_ID[activeEvent.univers] : undefined;

  // Trie les missions pour afficher en premier celles liées à l'univers de l'événement actif du Hero
  const missionsFiltrees = useMemo(() => {
    let base = [...MISSIONS];
    if (activeEvent) {
      base.sort((a, b) => {
        const aMatch = a.univers === activeEvent.univers ? 0 : 1;
        const bMatch = b.univers === activeEvent.univers ? 0 : 1;
        return aMatch - bMatch;
      });
    }
    if (filtreCompetence === "Liées à l'événement" && activeEvent) {
      const liees = base.filter((m) => m.univers === activeEvent.univers);
      return liees.length > 0 ? liees : base;
    }
    if (filtreCompetence === "Toutes" || filtreCompetence === "Liées à l'événement") {
      return base;
    }
    return base.filter((m) => m.competences.includes(filtreCompetence));
  }, [filtreCompetence, activeEvent]);

  const telechargerAttestationBenevole = () => {
    const contenu = `ATTESTATION OFFICIELLE DE BÉNÉVOLAT — AIME EVENT 2027
═══════════════════════════════════════════════════════════
Titulaire : Camille Ravier (${AIME_ID})
Heures validées : ${heuresValidees} h
Missions engagées : ${missionsRejointes.length}
Statut : Membre actif Banque du Temps AIME EVENT
Date d'émission : ${new Date().toLocaleDateString("fr-FR")}
`;
    const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attestation-benevolat-${AIME_ID.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="j-aide"
      className="relative scroll-mt-16 bg-black px-[5vw] py-16 md:px-10 md:py-24"
      aria-label="J'aide — Missions à adopter"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ——— EN-TÊTE : J'AIDE + SYNCHRONISATION AVEC L'ÉVÉNEMENT DU HERO ——— */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
              J'AIDE · BANQUE DU TEMPS
            </p>
            <h2 className="mt-1.5 font-display text-[clamp(1.85rem,3.8vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white">
              Adopter une mission.{" "}
              <span className="text-white/45">4 h = 1 place offerte.</span>
            </h2>
            {activeEvent && (
              <p className="mt-2 text-sm text-white/60">
                En lien avec l'événement affiché :{" "}
                <strong className="text-white">« {activeEvent.nom} »</strong>
                {activeMoisNom ? ` (${activeEvent.jour} ${activeMoisNom.toLowerCase()})` : ""}
                {universEvent ? ` · Univers ${universEvent.nom}` : ""}
              </p>
            )}
          </div>

          {/* Compteur Banque du temps + Conversion 1 clic */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/12 bg-[#0b0b0e] p-3 sm:px-4">
            <div className="pr-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {heuresDisponibles} h dispo ({heuresValidees} h validées)
              </p>
            </div>
            <button
              onClick={() => convertirHeuresEnEuros()}
              disabled={heuresDisponibles < 4}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition enabled:hover:bg-white/90 disabled:opacity-35"
            >
              Convertir 4 h → +18 €
            </button>
            <button
              onClick={telechargerAttestationBenevole}
              title="Télécharger mon attestation officielle de bénévolat"
              aria-label="Télécharger mon attestation de bénévolat"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ——— FILTRES DE COMPÉTENCES ——— */}
        <div className="flex flex-wrap items-center gap-1.5">
          {COMPETENCES_FILTRE.map((c) => (
            <button
              key={c}
              onClick={() => setFiltreCompetence(c)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                filtreCompetence === c
                  ? "bg-white font-semibold text-black shadow-sm"
                  : "border border-white/12 bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ——— MISSIONS À ADOPTER SOUS FORME DE VRAIS TICKETS BLANCS HORIZONTAUX ——— */}
        <div className="space-y-4">
          {missionsFiltrees.map((m, idx) => {
            const rejointe = missionsRejointes.includes(m.id);
            const complet = m.prises >= m.places;
            const nbInscrits = m.prises + (rejointe ? 1 : 0);
            const ratioRemplissage = Math.min(
              100,
              Math.round((nbInscrits / Math.max(1, m.places)) * 100),
            );
            const numMission = String(idx + 1).padStart(2, "0");
            const lieeEventActif = activeEvent && m.univers === activeEvent.univers;

            return (
              <article
                key={m.id}
                className="relative overflow-hidden rounded-[26px] bg-white text-[#0a0a0c]"
              >
                {/* Filet supérieur Aurore */}
                <div className="h-[4px] w-full bg-event-gradient" />

                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  {/* Partie gauche du Ticket Blanc Horizontal */}
                  <div className="flex-1 p-5 sm:px-7 sm:py-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0a0a0c]/45">
                        AIME EVENT · MISSION #{numMission}
                      </span>
                      {lieeEventActif && (
                        <span className="rounded-full bg-[#0a0a0c] px-3 py-0.5 text-[10px] font-bold text-white">
                          En lien avec « {activeEvent.nom} »
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-display text-[15px] font-bold tracking-[-0.02em] text-[#0a0a0c]">
                      {m.quand} · {m.lieu}
                    </p>

                    <h3 className="mt-0.5 font-display text-xl font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c] sm:text-2xl">
                      {m.titre}
                    </h3>

                    <p className="mt-2 text-[12.5px] font-semibold text-[#0a0a0c]/70">
                      {UNIVERS_PAR_ID[m.univers]?.nom} · Compétences :{" "}
                      {m.competences.join(", ")}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#0a0a0c]/55">
                      {m.description}
                    </p>

                    <div className="mt-3.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a0a0c]/40">
                        ÉQUIPE BÉNÉVOLE · {nbInscrits}/{m.places} INSCRITS
                      </p>
                      <div className="mt-1 h-[3px] w-40 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full bg-event-gradient"
                          style={{ width: `${ratioRemplissage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ——— DÉCOUPE PERFORÉE MOBILE ——— */}
                  <div className="relative flex items-center sm:hidden" aria-hidden="true">
                    <span className="-ml-[1px] h-6 w-3 shrink-0 rounded-r-full bg-black" />
                    <div className="mx-2 flex-1 border-t border-dashed border-black/15" />
                    <span className="-mr-[1px] h-6 w-3 shrink-0 rounded-l-full bg-black" />
                  </div>

                  {/* ——— DÉCOUPE PERFORÉE DESKTOP ——— */}
                  <div
                    className="relative hidden flex-col items-center sm:flex"
                    aria-hidden="true"
                  >
                    <span className="-mt-[1px] h-3 w-6 shrink-0 rounded-b-full bg-black" />
                    <div className="my-2 flex-1 border-l border-dashed border-black/15" />
                    <span className="-mb-[1px] h-3 w-6 shrink-0 rounded-t-full bg-black" />
                  </div>

                  {/* ——— TALON DROIT DU TICKET BLANC HORIZONTAL ——— */}
                  <div className="flex shrink-0 flex-row items-center justify-between gap-4 px-5 py-4 sm:w-64 sm:flex-col sm:justify-center sm:px-6 sm:py-5 sm:text-center">
                    <p className="font-mono text-[9.5px] font-semibold tracking-[0.12em] text-[#0a0a0c]/45">
                      ID · TIMEBANK-2027-M{numMission}
                    </p>

                    <button
                      onClick={() => basculerMissionEspace(m.id)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-[12.5px] font-bold transition sm:w-full ${
                        rejointe
                          ? "bg-emerald-400 text-black shadow-sm"
                          : complet
                            ? "border border-black/15 text-[#0a0a0c]/40"
                            : "bg-[#0a0a0c] text-white shadow-sm hover:opacity-90"
                      }`}
                    >
                      {rejointe ? (
                        <>
                          <Check className="h-4 w-4" /> Mission adoptée · +4 h
                        </>
                      ) : complet ? (
                        "Complet"
                      ) : (
                        "Adopter la mission · +4 h"
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
