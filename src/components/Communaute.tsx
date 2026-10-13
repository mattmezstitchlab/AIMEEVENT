import { useMemo } from "react";
import { Check, HandHeart, HeartHandshake, Shield, Volume2, Users } from "lucide-react";
import { TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID } from "../data/annee";
import { NIVEAU, evenementsQuiSeChevauchent, sensorielDe, tailleCercle } from "../data/innovations";
import { useFavorites } from "../hooks/useFavorites";
import { cercleStore, solidariteStore } from "../hooks/useSetStore";

function Jauge({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/40">
        <span>{label}</span>
        <span>{NIVEAU[n]}</span>
      </div>
      <div className="mt-1 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= n ? "bg-event-gradient" : "bg-white/10"}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Trois innovations inédites dans l'histoire de la billetterie :
 * 1. Passeport sensoriel — bruit, foule, lumière, salle calme
 * 2. Le Cercle — venir seul·e sans l'être
 * 3. La place offerte — un billet inutilisé nourrit quelqu'un, jamais un scalper
 */
export default function Communaute() {
  const { ids: favoris } = useFavorites();
  const cercle = cercleStore.useStore();
  const solidarite = solidariteStore.useStore();
  const conflits = useMemo(() => evenementsQuiSeChevauchent(favoris), [favoris]);

  const mesEvents = TOUS_LES_EVENEMENTS.filter(
    ({ event }) => favoris.includes(event.id) || cercle.has(event.id) || solidarite.has(event.id),
  );
  const catalogue = mesEvents.length ? mesEvents : TOUS_LES_EVENEMENTS.slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#ff9c2e]/25 bg-[#ff9c2e]/[0.06] p-5">
        <p className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight">
          <HeartHandshake className="h-4 w-4 text-[#ff9c2e]" /> Trois choses qu'aucune billetterie au monde ne fait
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/60">
          Dire la vérité sensorielle d'un événement. Permettre de venir seul·e sans l'être.
          Faire qu'une place inutilisée nourrisse quelqu'un — jamais un revendeur.
        </p>
      </div>

      {conflits.length > 0 && (
        <div className="rounded-2xl border border-[#ff9c2e]/30 bg-[#ff9c2e]/[0.08] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff9c2e]">Chevauchement détecté</p>
          {conflits.map((c) => (
            <p key={c.a + c.b} className="mt-2 text-[13px] text-white/70">
              « {c.a} » et « {c.b} » tombent le même jour. Personne d'autre ne vous prévient avant d'acheter.
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {catalogue.map(({ event, mois }) => {
          const s = sensorielDe(event.id);
          const dansCercle = cercle.has(event.id);
          const cedee = solidarite.has(event.id);
          const nCercle = tailleCercle(event.id) + (dansCercle ? 1 : 0);
          const u = UNIVERS_PAR_ID[event.univers];
          return (
            <article key={event.id} className="flex flex-col rounded-2xl border border-white/10 bg-[#09090b] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{mois.nom} · {u.nom}</p>
              <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight">{event.nom}</h3>
              <p className="mt-0.5 text-[11px] text-white/45">{event.jour} · {event.heure}</p>

              {/* Passeport sensoriel */}
              <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/40">
                  <Volume2 className="h-3 w-3" /> Passeport sensoriel
                </p>
                <Jauge n={s.bruit} label="Bruit" />
                <Jauge n={s.foule} label="Foule" />
                <Jauge n={s.lumiere} label="Lumière" />
                <div className="flex flex-wrap gap-1 pt-1">
                  {s.assis && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white/50">Places assises</span>}
                  {s.salleCalme && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white/50">Salle calme</span>}
                  {s.access.map((a) => (
                    <span key={a} className="rounded-full border border-white/10 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white/40">{a}</span>
                  ))}
                </div>
              </div>

              {/* Le Cercle */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Users className="h-3.5 w-3.5" /> {nCercle} personnes y vont seul·es
                </p>
                <button
                  onClick={() => cercle.toggle(event.id)}
                  aria-pressed={dansCercle}
                  className={`rounded-full px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] transition ${dansCercle ? "bg-emerald-400 text-black" : "border border-white/20 text-white/70 hover:border-white/50"}`}
                >
                  {dansCercle ? <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Dans le cercle</span> : "Rejoindre"}
                </button>
              </div>

              {/* Place offerte */}
              <button
                onClick={() => solidarite.toggle(event.id)}
                aria-pressed={cedee}
                className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] transition ${
                  cedee ? "bg-event-gradient text-white" : "border border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                }`}
              >
                {cedee ? <><Check className="h-3.5 w-3.5" /> Place offerte — un·e autre ira</> : <><HandHeart className="h-3.5 w-3.5" /> Je ne peux plus y aller · offrir</>}
              </button>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5">
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
            <Shield className="h-3.5 w-3.5" /> Safe team · 18+
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">
            Sur La Nuit et Le Feu, une équipe identifiable, formée, joignable depuis l'espace.
            Un bouton d'urgence en bas de l'écran le soir J — sans app tierce.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5">
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
            <HandHeart className="h-3.5 w-3.5" /> Banque du temps
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/55">
            4 heures de mission = 1 rendez-vous payant offert. Pas des points décoratifs :
            du temps réel converti en accès réel. Les 55+ et les 0–12 ans n'ont jamais à « mériter » l'entrée.
          </p>
        </div>
      </div>
    </div>
  );
}
