import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Check, Clock, Minus, Plus, Ticket, Users, X } from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { useFavorites } from "../hooks/useFavorites";

export default function ModalReservation({
  event,
  onClose,
  onEspace,
}: {
  event: RendezVous | null;
  onClose: () => void;
  onEspace?: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { has, toggle } = useFavorites();

  useEffect(() => {
    if (event) {
      setQty(1);
      setEmail("");
      setDone(false);
      /* La réservation crée automatiquement le billet dans Mon Espace */
      if (!has(event.id)) toggle(event.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!event) return null;

  const univers = UNIVERS_PAR_ID[event.univers];
  const gratuit = event.prix === 0;
  const total = event.prix * qty;
  const maxQty = Math.min(6, event.restantes);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Réserver ${event.nom}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/12 bg-[#0b0b0d] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "heroUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Visuel */}
        <div className="relative h-36 overflow-hidden">
          <img src={univers.image} alt={univers.alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-black/40 to-black/15" />
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute bottom-4 left-5 rounded-full bg-black/60 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            {univers.nom}
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {done ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-event-gradient shadow-[0_12px_40px_-10px_rgba(255,78,107,0.7)]">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                {gratuit ? "Inscription confirmée." : "Réservation confirmée."}
              </h2>
              <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-white/55">
                {qty} place{qty > 1 ? "s" : ""} pour <strong className="text-white">{event.nom}</strong>,
                {" "}{event.jour.toLowerCase()} à {event.heure}.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-[11.5px] font-semibold text-emerald-200">
                <Check className="h-4 w-4 shrink-0" /> Billet ajouté à Mon Espace
              </div>
              <div className="mt-5 space-y-2">
                {onEspace && (
                  <button
                    onClick={() => { onClose(); onEspace(); }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:brightness-110"
                  >
                    Voir mon billet dans Mon Espace <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 py-4 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-white/50"
                >
                  Continuer mes réservations
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hiérarchie : nom → quand → quoi → combien */}
              <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{event.nom}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/50">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {event.jour}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.heure} · {event.duree}</span>
                <span className="rounded-full border border-white/15 px-2.5 py-1">{event.format}</span>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-white/60">{event.resume}</p>

              {/* Disponibilité */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-white/60">
                  <Users className="h-4 w-4" /> Places restantes
                </span>
                <span className={`font-display text-sm font-extrabold tabular-nums ${event.restantes < 20 ? "text-[#ff9c2e]" : "text-emerald-400"}`}>
                  {event.restantes} / {event.places}
                </span>
              </div>

              {/* Quantité */}
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5">
                <span className="text-[12px] font-semibold text-white/60">Nombre de places</span>
                <span className="flex items-center gap-4">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Retirer une place" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-5 text-center font-display text-xl font-extrabold tabular-nums">{qty}</span>
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))} aria-label="Ajouter une place" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black">
                    <Plus className="h-4 w-4" />
                  </button>
                </span>
              </div>

              {/* E-mail */}
              <label className="mt-3 block">
                <span className="sr-only">Adresse e-mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre e-mail pour la confirmation"
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder:text-white/35 transition focus:border-white/40 focus:outline-none"
                />
              </label>

              {/* Total */}
              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                {gratuit ? (
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Entrée</span>
                    <span className="font-display text-xl font-extrabold text-emerald-400">Gratuit</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-white/55"><span>{event.prix} € × {qty}</span><span>{total} €</span></div>
                    <div className="flex justify-between text-white/55"><span>Frais de service</span><span>0 € — offerts</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-3 font-display text-xl font-extrabold"><span>Total</span><span>{total} €</span></div>
                  </>
                )}
              </div>

              {/* CTA unique */}
              <button
                onClick={() => email.includes("@") && setDone(true)}
                disabled={!email.includes("@")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white transition enabled:hover:brightness-110 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {gratuit ? <><Check className="h-4 w-4" /> Confirmer l'inscription</> : <><Ticket className="h-4 w-4" /> Payer {total} € <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-3 text-center text-[10.5px] uppercase tracking-[0.16em] text-white/35">
                {gratuit ? "Sans engagement · Annulation libre" : "Paiement sécurisé · Transfert gratuit · Billet instantané"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
