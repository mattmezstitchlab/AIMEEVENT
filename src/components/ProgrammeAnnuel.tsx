import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { CALENDRIER, PROFILS, UNIVERS_PAR_ID, type PublicId } from "../data/annee";

export default function ProgrammeAnnuel({
  onOpenMonth,
  onAcces,
}: {
  onOpenMonth: (monthId: string) => void;
  onAcces: () => void;
}) {
  const [profil, setProfil] = useState<PublicId | null>(null);

  const moisFiltres = useMemo(
    () =>
      CALENDRIER.map((mois) => ({
        ...mois,
        rendezVousVisibles: profil
          ? mois.rendezVous.filter((r) => r.publics.includes(profil))
          : mois.rendezVous,
      })),
    [profil],
  );

  return (
    <section id="programme" className="relative scroll-mt-20 overflow-hidden bg-[#050506] py-16 md:py-24" aria-label="Calendrier annuel">
      <div className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#ff4e6b]/8 blur-[150px]" />
      <div className="relative px-[5vw] md:px-[2.6vw]">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Le programme · Saison 2027</p></Reveal>
            <Reveal delay={60}>
              <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.94] tracking-[-0.03em]">
                12 MOIS.<br className="sm:hidden" /> <span className="text-event-gradient">DES MONDES QUI CIRCULENT.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              Choisissez un profil, puis ouvrez un mois pour entrer dans son programme.
            </p>
          </Reveal>
        </div>

        {/* Une seule rangée de filtre */}
        <Reveal delay={120}>
          <nav className="sticky top-[68px] z-30 -mx-[5vw] mt-8 border-y border-white/10 bg-black/90 px-[5vw] py-3 backdrop-blur-xl md:top-[76px] md:-mx-[2.6vw] md:px-[2.6vw]" aria-label="Filtrer le calendrier par public">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setProfil(null)}
                aria-pressed={!profil}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.13em] transition-all ${!profil ? "bg-white text-black" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
              >Tout le monde</button>
              {PROFILS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfil(profil === p.id ? null : p.id)}
                  aria-pressed={profil === p.id}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.13em] transition-all ${profil === p.id ? "bg-event-gradient text-white" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
                >{p.label}</button>
              ))}
            </div>
          </nav>
        </Reveal>

        {/* Grille calendrier — cases carrées, programme à l'intérieur, clic = page du mois */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4">
          {moisFiltres.map((mois, index) => (
            <Reveal key={mois.id} delay={(index % 4) * 45} scale>
              <button
                onClick={() => onOpenMonth(mois.id)}
                aria-label={`Ouvrir le programme de ${mois.nom}`}
                data-cursor="Ouvrir"
                className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#09090b] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-[#0e0e11] sm:p-5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{String(index + 1).padStart(2, "0")} / 2027</span>
                  <span className="h-2 w-2 rounded-full bg-white/20 transition-colors group-hover:bg-event-gradient" />
                </span>
                <span className="mt-1 font-display text-[clamp(1.3rem,2.6vw,2.1rem)] font-extrabold leading-none tracking-[-0.035em] transition-colors group-hover:text-white">{mois.nom}</span>
                <span className="mt-1 line-clamp-1 text-[10px] font-medium text-white/40 sm:text-[11px]">{mois.edition}</span>

                <span className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
                  {mois.rendezVousVisibles.length > 0 ? (
                    mois.rendezVousVisibles.slice(0, 2).map((r) => (
                      <span key={r.id} className="flex min-w-0 items-start gap-2 border-t border-white/[0.07] pt-1.5">
                        <span className="shrink-0 pt-px font-display text-[9px] font-bold tabular-nums text-white/40 sm:text-[10px]">{r.heure}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold leading-tight text-white/85 sm:text-[11px]">{r.nom}</span>
                          <span className="mt-0.5 block truncate text-[8px] font-bold uppercase tracking-[0.12em] text-white/35 sm:text-[9px]">{UNIVERS_PAR_ID[r.univers]?.nom}</span>
                        </span>
                        <span className={`shrink-0 pt-px text-[8.5px] font-extrabold uppercase tracking-[0.08em] ${r.prix === 0 ? "text-emerald-400" : "text-white/60"}`}>
                          {r.prix === 0 ? "Gratuit" : `${r.prix} €`}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="mt-2 text-[10px] leading-relaxed text-white/35">Aucun rendez-vous pour ce profil.</span>
                  )}
                  {mois.rendezVousVisibles.length > 2 && (
                    <span className="mt-auto pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">+ {mois.rendezVousVisibles.length - 2} autres</span>
                  )}
                </span>
                <span className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                  <span>{mois.rendezVousVisibles.length} rendez-vous</span>
                  <span className="flex items-center gap-1 text-white/55 transition-colors group-hover:text-white">
                    Ouvrir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <button onClick={onAcces} className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-event-gradient hover:text-white">
              Voir les accès <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Les tarifs sont réunis sur la page Accès</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
