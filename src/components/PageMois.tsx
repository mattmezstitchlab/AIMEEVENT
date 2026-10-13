import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Heart, Ticket, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import HeroVideo from "./HeroVideo";
import ModalReservation from "./ModalReservation";
import { CALENDRIER, PROFILS, UNIVERS_PAR_ID, type MoisProgramme, type RendezVous } from "../data/annee";
import { NIVEAU, sensorielDe } from "../data/innovations";
import { useFavorites } from "../hooks/useFavorites";

export default function PageMois({
  moisId,
  onRetour,
  onAcces,
  onEspace,
}: {
  moisId: string;
  onRetour: () => void;
  onAcces: () => void;
  onEspace?: () => void;
}) {
  const mois: MoisProgramme = CALENDRIER.find((m) => m.id === moisId) ?? CALENDRIER[0];
  const [reserve, setReserve] = useState<RendezVous | null>(null);
  const { has, toggle } = useFavorites();

  const slides = useMemo(
    () => mois.rendezVous.map((event) => ({
      event,
      surtitre: `${mois.nom} 2027 · ${UNIVERS_PAR_ID[event.univers].nom}`,
    })),
    [mois],
  );

  const publics = Array.from(new Set(mois.rendezVous.flatMap((r) => r.publics)));
  const categories = Array.from(new Set(mois.rendezVous.map((r) => r.univers)));
  const gratuits = mois.rendezVous.filter((r) => r.prix === 0).length;
  const prixMin = Math.min(...mois.rendezVous.filter((r) => r.prix > 0).map((r) => r.prix));
  const prixMax = Math.max(...mois.rendezVous.map((r) => r.prix));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ——— Hero vidéo : les rendez-vous du mois tournent ——— */}
      <HeroVideo
        slides={slides}
        compteurLabel={mois.nom}
        onReserve={setReserve}
        topLeft={
          <button onClick={onRetour} className="group inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] transition hover:opacity-80">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Calendrier
          </button>
        }
        topRight={
          <span className="rounded-full bg-black/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            {mois.edition}
          </span>
        }
      />

      {/* ——— Ce qu'il faut savoir ——— */}
      <section className="bg-[#050506] px-[5vw] py-16 md:px-[2.6vw] md:py-24" aria-label="Ce qu'il faut savoir">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Ce qu'il faut savoir</p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.4rem)] font-bold tracking-[-0.03em]">
            {mois.nom.toUpperCase()} EN BREF
          </h2>
        </Reveal>

        {/* Les faits du mois */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {[
            { n: String(mois.rendezVous.length), l: "Rendez-vous ce mois-ci" },
            { n: String(categories.length), l: "Catégories représentées" },
            { n: String(gratuits), l: gratuits > 1 ? "Rendez-vous gratuits" : "Rendez-vous gratuit" },
            { n: prixMax === 0 ? "Gratuit" : `${prixMin}–${prixMax} €`, l: "Fourchette de prix" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 60} className="bg-[#09090b]">
              <div className="group px-5 py-6 transition-colors duration-500 hover:bg-[#0e0e12]">
                <p className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{s.n}</p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.16em] text-white/40 transition-colors group-hover:text-white/65">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Programme en liste compacte — tout sur le même écran, réservation en place */}
        <Reveal delay={80}>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0c] px-5 py-4 sm:px-6">
              <h3 className="font-display text-base font-extrabold tracking-tight">Le programme en détail</h3>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Réservation sans quitter la page</span>
            </div>
            <div className="divide-y divide-white/[0.08]">
              {mois.rendezVous.map((r) => {
                const u = UNIVERS_PAR_ID[r.univers];
                const gratuit = r.prix === 0;
                const presque = r.restantes < 20;
                return (
                  <div key={r.id} className="grid gap-4 bg-[#09090b] px-5 py-5 transition-colors hover:bg-[#0e0e12] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:px-6">
                    {/* Quand */}
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45 sm:w-32 sm:flex-col sm:items-start sm:gap-1">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {r.jour}</span>
                      <span className="flex items-center gap-1.5 text-white/70"><Clock className="h-3.5 w-3.5" /> {r.heure}</span>
                    </div>
                    {/* Quoi */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-lg font-bold tracking-tight">{r.nom}</h4>
                        <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">{u.nom}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{r.resume}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">{r.format} · {r.duree}</span>
                        {r.publics.map((p) => (
                          <span key={p} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
                            {PROFILS.find((x) => x.id === p)?.label}
                          </span>
                        ))}
                        {(() => {
                          const s = sensorielDe(r.id);
                          return (
                            <>
                              <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">Bruit {NIVEAU[s.bruit]}</span>
                              {s.salleCalme && <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">Salle calme</span>}
                              {s.access.includes("safe team") && <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">Safe team</span>}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Combien + action */}
                    <div className="flex items-center justify-between gap-3 sm:w-44 sm:flex-col sm:items-end sm:justify-center">
                      <div className="text-right">
                        <p className={`font-display text-xl font-extrabold tracking-tight ${gratuit ? "text-emerald-400" : "text-white"}`}>
                          {gratuit ? "Gratuit" : `${r.prix} €`}
                        </p>
                        <p className={`mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] ${presque ? "text-[#ff9c2e]" : "text-white/35"}`}>
                          {r.restantes} places restantes
                        </p>
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <button
                          onClick={() => setReserve(r)}
                          className={`group inline-flex flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.13em] transition active:scale-[0.98] ${
                            gratuit ? "border border-white/25 text-white hover:border-transparent hover:bg-white hover:text-black" : "bg-white text-black hover:bg-event-gradient hover:text-white"
                          }`}
                        >
                          {gratuit ? <Check className="h-3.5 w-3.5" /> : <Ticket className="h-3.5 w-3.5" />}
                          {gratuit ? "S'inscrire" : "Réserver"}
                        </button>
                        <button
                          onClick={() => toggle(r.id)}
                          aria-label={has(r.id) ? "Retirer de mon programme" : "Ajouter à mon programme"}
                          aria-pressed={has(r.id)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${has(r.id) ? "border-transparent bg-[#ff4e6b] text-white" : "border-white/20 text-white/50 hover:border-white/50 hover:text-white"}`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${has(r.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Pour qui + pratique */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Reveal delay={60}>
            <div className="h-full rounded-2xl border border-white/10 bg-[#09090b] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"><Users className="h-[18px] w-[18px]" /></span>
              <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Pour qui ce mois-ci</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {publics.map((p) => (
                  <span key={p} className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                    {PROFILS.find((x) => x.id === p)?.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">
                Chaque rendez-vous indique son public : personne n'est invité au mauvais moment,
                et les horaires ne se chevauchent jamais entre deux générations.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-white/10 bg-[#09090b] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"><Ticket className="h-[18px] w-[18px]" /></span>
              <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Avant de venir</p>
              <ul className="mt-3 space-y-2 text-[13.5px] text-white/60">
                <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={3} /> On réserve le créneau, pas la journée entière.</li>
                <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={3} /> Les rendez-vous gratuits demandent quand même une inscription.</li>
                <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={3} /> Transfert de place gratuit jusqu'à la veille.</li>
              </ul>
              <button onClick={onAcces} className="group mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 transition hover:text-white">
                Voir les pass saison <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={onRetour} className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Retour au calendrier
            </button>
          </div>
        </Reveal>
      </section>

      <ModalReservation event={reserve} onClose={() => setReserve(null)} onEspace={onEspace} />
    </div>
  );
}
