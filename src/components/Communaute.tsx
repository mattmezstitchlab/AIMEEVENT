import { useMemo } from "react";
import {
  Check,
  HandHeart,
  MessageCircle,
  Users,
  Volume2,
} from "lucide-react";
import { UNIVERS_PAR_ID } from "../data/annee";
import { NIVEAU, evenementsQuiSeChevauchent, sensorielDe, tailleCercle } from "../data/innovations";
import { useFavorites } from "../hooks/useFavorites";
import {
  basculerCercleAvecMessagerie,
  cercleStore,
  solidariteStore,
  useEspaceStore,
} from "../hooks/useEspaceStore";

function Jauge({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-medium text-white/45">
        <span>{label}</span>
        <span>{NIVEAU[n]}</span>
      </div>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= n ? "bg-event-gradient" : "bg-white/12"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Communaute({
  onOpenMessages,
}: {
  onOpenMessages?: () => void;
  onOpenJourJ?: () => void;
}) {
  const { ids: favoris } = useFavorites();
  const { tousLesEvenements, billets } = useEspaceStore();
  const cercle = cercleStore.useStore();
  const solidarite = solidariteStore.useStore();

  const tousIds = useMemo(
    () => Array.from(new Set([...favoris, ...billets.map((b) => b.id)])),
    [favoris, billets],
  );
  const conflits = useMemo(() => evenementsQuiSeChevauchent(tousIds), [tousIds]);

  const mesEvents = tousLesEvenements.filter(
    ({ event }) =>
      tousIds.includes(event.id) || cercle.has(event.id) || solidarite.has(event.id),
  );
  const catalogue = mesEvents.length ? mesEvents : tousLesEvenements.slice(0, 6);

  return (
    <div className="space-y-4">
      {conflits.length > 0 && (
        <div className="apple-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-white">Chevauchement horaire détecté</p>
          {conflits.map((c) => (
            <p key={c.a + c.b} className="mt-1 text-xs text-white/60">
              « {c.a} » et « {c.b} » ont lieu sur le même créneau.
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-3.5 lg:grid-cols-3">
        {catalogue.map(({ event, mois }) => {
          const s = sensorielDe(event.id);
          const dansCercle = cercle.has(event.id);
          const cedee = solidarite.has(event.id);
          const nCercle = tailleCercle(event.id) + (dansCercle ? 1 : 0);
          const u = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
          return (
            <article
              key={event.id}
              className="apple-card flex flex-col justify-between rounded-2xl p-5"
            >
              <div>
                <p className="text-[11px] font-medium text-white/45">
                  {mois.nom} · {u.nom}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-white">
                  {event.nom}
                </h3>
                <p className="mt-0.5 text-xs text-white/50">
                  {event.jour} · {event.heure}
                </p>

                {/* Passeport sensoriel monochrome */}
                <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium text-white/50">
                    <Volume2 className="h-3 w-3" /> Passeport sensoriel
                  </p>
                  <Jauge n={s.bruit} label="Bruit" />
                  <Jauge n={s.foule} label="Foule" />
                  <Jauge n={s.lumiere} label="Lumière" />
                </div>
              </div>

              {/* Actions Cercle & Place Solidaire par icônes / pilules sobres */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => basculerCercleAvecMessagerie(event.id)}
                    aria-pressed={dansCercle}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      dansCercle
                        ? "bg-emerald-400 text-black shadow-sm"
                        : "border border-white/15 bg-white/[0.05] text-white/75 hover:text-white"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>{dansCercle ? `Cercle (${nCercle}) ✓` : `Cercle (${nCercle})`}</span>
                  </button>

                  {dansCercle && onOpenMessages && (
                    <button
                      onClick={onOpenMessages}
                      title="Salon Cercle Solo"
                      aria-label="Salon Cercle Solo"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-black"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => solidarite.toggle(event.id)}
                  title={cedee ? "Place offerte au pot solidaire" : "Offrir au pot solidaire"}
                  aria-label="Offrir au pot solidaire"
                  aria-pressed={cedee}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    cedee
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-white/[0.05] text-white/65 hover:text-white"
                  }`}
                >
                  {cedee ? <Check className="h-3.5 w-3.5" /> : <HandHeart className="h-3.5 w-3.5" />}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
