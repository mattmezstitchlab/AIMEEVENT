import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  HandHeart,
  HeartHandshake,
  Minus,
  Plus,
  Ticket,
  Users,
  Volume2,
  Wallet,
  X,
} from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { NIVEAU, evenementsQuiSeChevauchent, sensorielDe, tailleCercle } from "../data/innovations";
import { useFavorites } from "../hooks/useFavorites";
import {
  reserverBillet,
  useEspaceStore,
  cercleStore,
  solidariteStore,
  type ModePaiement,
} from "../hooks/useEspaceStore";

export default function ModalReservation({
  event,
  onClose,
  onEspace,
}: {
  event: RendezVous | null;
  onClose: () => void;
  onEspace?: (onglet?: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState("camille.ravier@aime-event.com");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("carte");
  const [rejointCercle, setRejointCercle] = useState(false);
  const [inviteDuoNom, setInviteDuoNom] = useState("");
  const [voirDetailsSensoriels, setVoirDetailsSensoriels] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { ids: favoris } = useFavorites();
  const { solde, heuresDisponibles, passesActifs, billets } = useEspaceStore();
  const cercle = cercleStore.useStore();
  const solidarite = solidariteStore.useStore();

  useEffect(() => {
    if (event) {
      setQty(1);
      setDone(false);
      setErreur(null);
      setInviteDuoNom("");
      setRejointCercle(cercle.has(event.id));
      if (event.prix === 0) {
        setModePaiement("gratuit");
      } else if (passesActifs.length > 0) {
        setModePaiement("pass");
      } else if (solde >= event.prix) {
        setModePaiement("wallet");
      } else {
        setModePaiement("carte");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const conflits = useMemo(() => {
    if (!event) return [];
    const ensemble = Array.from(new Set([...favoris, ...billets.map((b) => b.id), event.id]));
    return evenementsQuiSeChevauchent(ensemble).filter(
      (c) => c.a === event.nom || c.b === event.nom,
    );
  }, [event, favoris, billets]);

  if (!event) return null;

  const univers = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
  const sensoriel = sensorielDe(event.id);
  const gratuit = event.prix === 0;
  const total = event.prix * qty;
  const maxQty = Math.min(6, Math.max(1, event.restantes));
  const nbCercle = tailleCercle(event.id) + (rejointCercle && !cercle.has(event.id) ? 1 : 0);
  const placeSolidaireDispo = solidarite.has(event.id) || event.restantes < 35;

  const totalAPayer =
    gratuit || modePaiement === "temps" || modePaiement === "solidaire" || modePaiement === "pass"
      ? 0
      : total;

  const confirmer = () => {
    if (!email.includes("@")) return;
    const res = reserverBillet({
      event,
      qty,
      modePaiement: gratuit ? "gratuit" : modePaiement,
      rejointCercle,
      inviteDuoNom,
    });
    if (!res.ok) {
      setErreur(res.erreur ?? "Impossible de finaliser la réservation.");
      return;
    }
    setErreur(null);
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Réserver ${event.nom}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/12 bg-[#0b0b0d] sm:rounded-3xl"
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
          <div className="absolute bottom-4 left-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/60 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md">
              {univers.nom}
            </span>
            <span className="rounded-full bg-black/60 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-white/80 backdrop-blur-md">
              {event.restantes} / {event.places} places
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {done ? (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-event-gradient shadow-[0_12px_40px_-10px_rgba(255,78,107,0.7)]">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                {gratuit ? "Inscription confirmée." : "Billet généré dans Mon Espace."}
              </h2>
              <p className="mx-auto mt-2 max-w-[340px] text-sm leading-relaxed text-white/55">
                {qty} place{qty > 1 ? "s" : ""} pour <strong className="text-white">{event.nom}</strong>,{" "}
                {event.jour.toLowerCase()} à {event.heure}.
                {inviteDuoNom.trim() ? ` Invité·e Duo : ${inviteDuoNom.trim()}.` : ""}
              </p>

              <div className="mt-5 space-y-2 text-left">
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-[11.5px] font-semibold text-emerald-200">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>
                    QR code actif dans <strong>Mes billets</strong> ·{" "}
                    {modePaiement === "temps"
                      ? "Réglé via Banque du temps (4 h)"
                      : modePaiement === "wallet"
                        ? `Débité sur AIME Wallet (${total} €)`
                        : modePaiement === "pass"
                          ? "Inclus dans votre Pass AIME"
                          : modePaiement === "solidaire"
                            ? "Place Solidaire attribuée (0 €)"
                            : gratuit
                              ? "Entrée libre sur inscription"
                              : `Réglé sans frais (${total} €)`}
                  </span>
                </div>

                {rejointCercle && (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-[#ff9c2e]/30 bg-[#ff9c2e]/[0.08] px-4 py-3 text-[11.5px] font-semibold text-[#ff9c2e]">
                    <HeartHandshake className="h-4 w-4 shrink-0" />
                    <span>
                      Salon <strong>« Cercle Solo — {event.nom} »</strong> ouvert dans votre Messagerie (RDV 20 min avant au Totem AIME).
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {onEspace && (
                  <button
                    onClick={() => {
                      onClose();
                      onEspace("billets");
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:brightness-110"
                  >
                    Voir mon billet QR dans Mon Espace <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {rejointCercle && onEspace && (
                  <button
                    onClick={() => {
                      onClose();
                      onEspace("messages");
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/60"
                  >
                    Ouvrir le salon du Cercle Solo
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  Continuer mes réservations
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hiérarchie : nom → quand → quoi */}
              <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {event.nom}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {event.jour}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {event.heure} · {event.duree}
                </span>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5">{event.format}</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/60">{event.resume}</p>

              {/* Alerte de chevauchement horaire */}
              {conflits.length > 0 && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#ff9c2e]/35 bg-[#ff9c2e]/[0.08] p-3.5 text-[12px] text-[#ff9c2e]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold uppercase tracking-[0.12em]">Chevauchement détecté</p>
                    <p className="mt-0.5 text-white/75">
                      Tombe le même jour que{" "}
                      <strong>
                        {conflits.map((c) => (c.a === event.nom ? c.b : c.a)).join(", ")}
                      </strong>{" "}
                      dans votre programme.
                    </p>
                  </div>
                </div>
              )}

              {/* Passeport Sensoriel en 1 ligne (dépliable au toucher pour zéro surcharge) */}
              <div className="mt-3.5 rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                <button
                  type="button"
                  onClick={() => setVoirDetailsSensoriels((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 text-left text-[11px] font-bold text-white/75"
                >
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="h-3.5 w-3.5 text-[#ff9c2e]" />
                    Bruit {NIVEAU[sensoriel.bruit]} · Lumière {NIVEAU[sensoriel.lumiere]}
                    {sensoriel.salleCalme ? " · Salle calme" : ""}
                    {sensoriel.assis ? " · Assis" : ""}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-white/40">
                    {voirDetailsSensoriels ? "Réduire" : "Détails"}
                  </span>
                </button>
                {voirDetailsSensoriels && (
                  <div className="mt-3 border-t border-white/10 pt-2.5">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { l: "Bruit", v: sensoriel.bruit },
                        { l: "Foule", v: sensoriel.foule },
                        { l: "Lumière", v: sensoriel.lumiere },
                      ].map((g) => (
                        <div key={g.l}>
                          <div className="flex justify-between text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/50">
                            <span>{g.l}</span>
                            <span className="text-white/75">{NIVEAU[g.v]}</span>
                          </div>
                          <div className="mt-1 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span
                                key={i}
                                className={`h-1.5 flex-1 rounded-full ${
                                  i <= g.v ? "bg-event-gradient" : "bg-white/10"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Opt-in Le Cercle : venir seul·e sans l'être */}
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-white">
                    <Users className="h-3.5 w-3.5 text-[#ff9c2e]" /> Je viens seul·e · Rejoindre Le Cercle
                  </p>
                  <p className="text-[11px] text-white/45">
                    {nbCercle} personnes y vont en solo · Point de rencontre 20 min avant + salon privé
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rejointCercle}
                  onClick={() => setRejointCercle(!rejointCercle)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    rejointCercle ? "bg-emerald-400" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      rejointCercle ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Quantité */}
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-[12px] font-semibold text-white/60">Nombre de places</span>
                <span className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Retirer une place"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center font-display text-lg font-extrabold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(maxQty, qty + 1))}
                    aria-label="Ajouter une place"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>

              {/* Invitation Duo nominative si qty >= 2 */}
              {qty >= 2 && (
                <label className="mt-2.5 block">
                  <input
                    type="text"
                    value={inviteDuoNom}
                    onChange={(e) => setInviteDuoNom(e.target.value)}
                    placeholder="Nom de votre invité·e Duo (optionnel — génère son billet dédié)"
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-xs text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                </label>
              )}

              {/* Sélecteur de mode de règlement circulaire (si événement payant) */}
              {!gratuit && (
                <div className="mt-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Choisir comment entrer (0 € de frais)
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModePaiement("wallet")}
                      disabled={solde < total}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        modePaiement === "wallet"
                          ? "border-transparent bg-white text-black"
                          : "border-white/12 bg-white/[0.02] text-white/75 hover:border-white/30 disabled:opacity-35"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]">
                        <Wallet className="h-3.5 w-3.5" /> AIME Wallet
                      </span>
                      <span className={`mt-1 text-[10.5px] ${modePaiement === "wallet" ? "text-black/70" : "text-white/45"}`}>
                        Solde : {solde} € · {total} €
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModePaiement("temps")}
                      disabled={heuresDisponibles < 4}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        modePaiement === "temps"
                          ? "border-transparent bg-emerald-400 text-black"
                          : "border-white/12 bg-white/[0.02] text-white/75 hover:border-white/30 disabled:opacity-35"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]">
                        <Clock className="h-3.5 w-3.5" /> Banque du temps
                      </span>
                      <span className={`mt-1 text-[10.5px] ${modePaiement === "temps" ? "text-black/75" : "text-white/45"}`}>
                        4 h mission → 0 € ({heuresDisponibles} h dispo)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModePaiement("carte")}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        modePaiement === "carte"
                          ? "border-transparent bg-white text-black"
                          : "border-white/12 bg-white/[0.02] text-white/75 hover:border-white/30"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]">
                        <CreditCard className="h-3.5 w-3.5" /> Carte · Direct
                      </span>
                      <span className={`mt-1 text-[10.5px] ${modePaiement === "carte" ? "text-black/70" : "text-white/45"}`}>
                        {total} € · 0 € frais service
                      </span>
                    </button>

                    {passesActifs.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setModePaiement("pass")}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                          modePaiement === "pass"
                            ? "border-transparent bg-event-gradient text-white"
                            : "border-white/12 bg-white/[0.02] text-white/75 hover:border-white/30"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]">
                          <Ticket className="h-3.5 w-3.5" /> {passesActifs[0].name}
                        </span>
                        <span className="mt-1 text-[10.5px] opacity-80">Inclus dans votre Pass → 0 €</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModePaiement("solidaire")}
                        disabled={!placeSolidaireDispo}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                          modePaiement === "solidaire"
                            ? "border-transparent bg-event-gradient text-white"
                            : "border-white/12 bg-white/[0.02] text-white/75 hover:border-white/30 disabled:opacity-35"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]">
                          <HandHeart className="h-3.5 w-3.5" /> Place Solidaire
                        </span>
                        <span className="mt-1 text-[10.5px] opacity-80">
                          Offert par la communauté → 0 €
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* E-mail */}
              <label className="mt-3 block">
                <span className="sr-only">Adresse e-mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre e-mail pour la confirmation"
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition focus:border-white/40 focus:outline-none"
                />
              </label>

              {erreur && (
                <p className="mt-2 text-xs font-semibold text-[#ff4e6b]">{erreur}</p>
              )}

              {/* Total */}
              <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3.5 text-sm">
                <div className="flex justify-between text-white/55">
                  <span>Frais de service AIME</span>
                  <span className="text-emerald-400">0 € — à jamais</span>
                </div>
                <div className="flex items-baseline justify-between pt-1 font-display text-xl font-extrabold">
                  <span>Total à régler</span>
                  <span>
                    {totalAPayer === 0 ? (
                      <span className="text-emerald-400">
                        0 €{" "}
                        {!gratuit && (
                          <span className="text-xs font-normal text-white/40 line-through">
                            {total} €
                          </span>
                        )}
                      </span>
                    ) : (
                      `${totalAPayer} €`
                    )}
                  </span>
                </div>
              </div>

              {/* CTA unique */}
              <button
                type="button"
                onClick={confirmer}
                disabled={!email.includes("@")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white transition enabled:hover:brightness-110 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {totalAPayer === 0 ? (
                  <>
                    <Check className="h-4 w-4" /> Confirmer à 0 € et générer mon QR
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" /> Confirmer ({totalAPayer} €) <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
