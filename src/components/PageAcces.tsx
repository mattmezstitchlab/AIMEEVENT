import { useState } from "react";
import { ArrowRight, Check, CreditCard, Minus, Plus, Wallet, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { PASSES } from "../data/annee";
import { acheterPass, useEspaceStore } from "../hooks/useEspaceStore";

interface AccesProps {
  onRetour: () => void;
  onEspace?: (onglet?: string) => void;
  modal: { name: string; price: number; note: string } | null;
  setModal: (m: AccesProps["modal"]) => void;
}

export default function PageAcces({ onRetour, onEspace, modal, setModal }: AccesProps) {
  const [qty, setQty] = useState(1);
  const [utiliserWallet, setUtiliserWallet] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { solde, passesActifs } = useEspaceStore();

  const prixUnitaire = modal?.price ?? 0;
  const total = prixUnitaire * qty;

  const validerAchat = () => {
    if (!modal) return;
    const res = acheterPass({
      name: modal.name,
      price: prixUnitaire,
      note: modal.note,
      qty,
      utiliserWallet,
    });
    if (!res.ok) {
      setErreur(res.erreur ?? "Impossible de valider ce Pass.");
      return;
    }
    setErreur(null);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-black pt-[68px] md:pt-[76px]">
      {/* En-tête */}
      <div className="relative overflow-hidden px-[5vw] py-16 md:px-[2.6vw] md:py-24">
        <div className="pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-[#ff4e6b]/10 blur-[150px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#c05cd4]/10 blur-[150px]" />

        <div className="relative">
          <button
            onClick={onRetour}
            className="group inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.18em] text-white/50 transition hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-transparent group-hover:bg-event-gradient">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </span>
            Retour au programme
          </button>

          <Reveal>
            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              Accès
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.035em]">
              TROIS FAÇONS
              <br />
              <span className="text-event-gradient">D'ENTRER.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/55">
              Un passeport pour toute la programmation, pas pour un lieu. Spectacles, cinéma, sport,
              école, ateliers, sorties et célébrations. Les 0–12 ans et les 55+ sont nos invités.
            </p>
          </Reveal>

          {passesActifs.length > 0 && (
            <Reveal delay={70}>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-black">
                    <Check className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-emerald-300">
                      Pass actif sur votre identité AIME
                    </p>
                    <p className="text-xs text-white/70">
                      {passesActifs.map((p) => `${p.name} (×${p.qty})`).join(" · ")} — Réservation à 0 € débloquée sur tout le calendrier.
                    </p>
                  </div>
                </div>
                {onEspace && (
                  <button
                    onClick={() => onEspace("billets")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.13em] text-black transition hover:bg-event-gradient hover:text-white"
                  >
                    Voir dans Mon Espace <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Les passes */}
      <div className="px-[5vw] pb-24 md:px-[2.6vw] md:pb-32">
        <div className="grid gap-5 lg:grid-cols-3">
          {PASSES.map((p, i) => (
            <Reveal key={p.name} delay={i * 90} scale>
              <article
                className={`group relative flex h-full flex-col rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                  p.star
                    ? "border-event-gradient ticket-featured bg-[#0b0b0d]"
                    : "border border-white/10 bg-[#08080a] hover:border-white/25"
                }`}
              >
                {p.star && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-event-gradient px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] shadow-lg">
                    Le plus choisi
                  </span>
                )}
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/45">
                  {p.note}
                </p>
                <h2
                  className={`mt-1 font-display text-3xl font-extrabold tracking-tight ${
                    p.star ? "text-event-gradient" : ""
                  }`}
                >
                  {p.name}
                </h2>
                <p className="mt-5 font-display text-5xl font-extrabold tracking-tight">
                  {p.price}
                </p>
                <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-white/70">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          p.star ? "bg-event-gradient" : "bg-white/10"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const parsedPrice = p.name.includes("ÂGES")
                      ? 19
                      : parseInt(p.price.replace(/[^0-9]/g, ""), 10) || 0;
                    setModal({ name: p.name, price: parsedPrice, note: p.note });
                    setQty(1);
                    setUtiliserWallet( false );
                    setErreur(null);
                    setDone(false);
                  }}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-[12px] font-bold uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98] ${
                    p.star
                      ? "bg-event-gradient text-white shadow-[0_12px_40px_-10px_rgba(255,78,107,0.6)] hover:brightness-110"
                      : "bg-white text-black hover:bg-event-gradient hover:text-white"
                  }`}
                >
                  Choisir <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { t: "0–12 ans", d: "Dimanche gratuit, toute catégorie" },
              { t: "Ados & 55+", d: "19 € par rendez-vous, tarif unique" },
              { t: "Duo", d: "Un 55+ et un –25 ans : −30 %" },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-white/10 bg-[#08080a] p-6 text-center"
              >
                <p className="font-display text-xl font-extrabold tracking-tight">{x.t}</p>
                <p className="mt-1.5 text-[12.5px] text-white/50">{x.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:gap-8">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" /> Transfert gratuit
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" /> Revente officielle
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" /> 1 billet solidaire / 100
            </span>
          </div>
        </Reveal>
      </div>

      {/* Modale */}
      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Commande"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/12 bg-[#0b0b0d] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "heroUp 0.45s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <div className="h-1.5 bg-event-gradient" />
            <div className="p-7">
              {done ? (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-event-gradient shadow-[0_12px_40px_-10px_rgba(255,78,107,0.7)]">
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                    Pass activé sur votre espace.
                  </h2>
                  <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-white/55">
                    {qty} × {modal.name} associé{qty > 1 ? "s" : ""} à votre identité universelle AIME. Vous pouvez désormais réserver vos créneaux à 0 €.
                  </p>
                  <div className="mt-6 space-y-2">
                    {onEspace && (
                      <button
                        onClick={() => {
                          setModal(null);
                          onEspace("billets");
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:brightness-110"
                      >
                        Ouvrir Mon Espace <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setModal(null)}
                      className="inline-flex w-full items-center justify-center rounded-full bg-white py-3.5 text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
                    >
                      Terminer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-white/40">
                        {modal.note}
                      </p>
                      <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
                        {modal.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setModal(null)}
                      aria-label="Fermer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                    <span className="text-sm font-semibold text-white/60">Quantité</span>
                    <span className="flex items-center gap-4">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        aria-label="Diminuer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-5 text-center font-display text-xl font-extrabold tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(8, qty + 1))}
                        aria-label="Augmenter"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </span>
                  </div>

                  {/* Mode de paiement */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUtiliserWallet(false)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold transition ${
                        !utiliserWallet
                          ? "border-transparent bg-white text-black"
                          : "border-white/12 text-white/60 hover:border-white/30"
                      }`}
                    >
                      <CreditCard className="h-4 w-4 shrink-0" /> Carte (0 € frais)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUtiliserWallet(true)}
                      disabled={solde < total}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold transition ${
                        utiliserWallet
                          ? "border-transparent bg-white text-black"
                          : "border-white/12 text-white/60 hover:border-white/30 disabled:opacity-35"
                      }`}
                    >
                      <Wallet className="h-4 w-4 shrink-0" /> Wallet ({solde} €)
                    </button>
                  </div>

                  {erreur && <p className="mt-2 text-xs font-semibold text-[#ff4e6b]">{erreur}</p>}

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-white/55">
                      <span>
                        {prixUnitaire} € × {qty}
                      </span>
                      <span>{total.toLocaleString("fr-FR")} €</span>
                    </div>
                    <div className="flex justify-between text-white/55">
                      <span>Frais de service</span>
                      <span className="text-emerald-400">0 € — offerts</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3 font-display text-xl font-extrabold">
                      <span>Total</span>
                      <span>{total.toLocaleString("fr-FR")} €</span>
                    </div>
                  </div>
                  <button
                    onClick={validerAchat}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] transition hover:brightness-110 active:scale-[0.98]"
                  >
                    Activer mon Pass <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
                    Transfert gratuit · Paiement sécurisé · Activation instantanée
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
