import { useMemo, useRef, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Heart,
  HeartHandshake,
  MessageCircle,
  Plus,
  Ticket,
  UserPlus,
  X,
} from "lucide-react";
import Messagerie from "./Messagerie";
import Creer from "./Creer";
import CockpitOrganisateur from "./CockpitOrganisateur";
import { useFavorites } from "../hooks/useFavorites";
import { AIME_ID, MISSIONS } from "../data/espace";
import { UNIVERS_PAR_ID } from "../data/annee";
import { sensorielDe } from "../data/innovations";
import { exporterEvenement } from "../utils/ics";
import { telechargerBilletCollectorPng } from "../utils/billetCanvas";
import {
  acheterPass,
  basculerMissionEspace,
  basculerPlaceSolidaireBillet,
  changerRoleEspace,
  convertirHeuresEnEuros,
  definirInviteDuo,
  envoyerArgentPortefeuille,
  rechargerPortefeuille,
  useEspaceStore,
} from "../hooks/useEspaceStore";

/* ————— Pseudo-QR déterministe pour les billets ————— */
function QrCanvas({ seed }: { seed: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const N = 21;
    const S = 8;
    canvas.width = N * S;
    canvas.height = N * S;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, N * S, N * S);
    let h = 2166136261;
    const bits: boolean[] = [];
    for (let i = 0; i < N * N; i++) {
      h ^= seed.charCodeAt(i % seed.length) + i * 31;
      h = Math.imul(h, 16777619);
      bits.push(((h >>> 9) & 1) === 1);
    }
    ctx.fillStyle = "#000000";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const inFinder = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
        if (!inFinder && bits[y * N + x]) ctx.fillRect(x * S, y * S, S, S);
      }
    }
    const finder = (fx: number, fy: number) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(fx * S, fy * S, 7 * S, 7 * S);
      ctx.fillStyle = "#fff";
      ctx.fillRect((fx + 1) * S, (fy + 1) * S, 5 * S, 5 * S);
      ctx.fillStyle = "#000";
      ctx.fillRect((fx + 2) * S, (fy + 2) * S, 3 * S, 3 * S);
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
  }, [seed]);
  return (
    <canvas
      ref={ref}
      className="h-16 w-16 shrink-0 rounded-xl border border-black/15 bg-white p-1.5 shadow-sm"
      aria-label="Code du billet"
    />
  );
}

type RoleId = "participe" | "organise" | "aide";
type TiroirId = "messages" | "portefeuille" | null;

const ROLES: {
  id: RoleId;
  label: string;
  labelMobile: string;
  icone: typeof Ticket;
  baseline: string;
}[] = [
  {
    id: "participe",
    label: "Je participe",
    labelMobile: "Participer",
    icone: Ticket,
    baseline: "Vos billets QR, votre Cercle Solo et vos favoris.",
  },
  {
    id: "organise",
    label: "J'organise",
    labelMobile: "Organiser",
    icone: ClipboardList,
    baseline: "Vos tickets organisés : 3 visuels prêts (Story, Carré, Bandeau), émargement et messagerie.",
  },
  {
    id: "aide",
    label: "J'aide",
    labelMobile: "Aider",
    icone: Heart,
    baseline: "Vos missions bénévoles, votre Banque du temps (4 h = 1 place) et attestation.",
  },
];

const COMPETENCES_FILTRE = [
  "Toutes",
  "Sourire",
  "Orientation",
  "Technique",
  "Animation",
  "Photo",
  "Cuisine",
  "Lecture",
];

function interpreterInitialTab(initial: string, storedRole: string): {
  role: RoleId;
  tiroir: TiroirId;
  ouvrirCreer: boolean;
} {
  const fallback: RoleId =
    storedRole === "organise" || storedRole === "aide"
      ? storedRole
      : "participe";

  if (initial === "messages")
    return { role: fallback, tiroir: "messages", ouvrirCreer: false };
  if (initial === "portefeuille")
    return { role: fallback, tiroir: "portefeuille", ouvrirCreer: false };
  if (initial === "organise" || initial === "cockpit" || initial === "cree" || initial === "creations")
    return { role: "organise", tiroir: null, ouvrirCreer: false };
  if (initial === "creer")
    return { role: "organise", tiroir: null, ouvrirCreer: true };
  if (initial === "aide" || initial === "missions")
    return { role: "aide", tiroir: null, ouvrirCreer: false };
  return { role: "participe", tiroir: null, ouvrirCreer: false };
}

export default function PageEspace({
  onRetour,
  onOpenMonth,
  initialTab = "participe",
}: {
  onRetour: () => void;
  onAcces?: () => void;
  onOpenMonth?: (moisId: string) => void;
  onOpenJourJ?: () => void;
  onSearch?: () => void;
  initialTab?: string;
}) {
  const {
    role: storedRole,
    billets,
    missionsRejointes,
    transactions,
    passesActifs,
    solde,
    heuresValidees,
    heuresDisponibles,
    points,
    niveau,
    totalNonLus,
    tousLesEvenements,
  } = useEspaceStore();

  const init = interpreterInitialTab(initialTab, storedRole);
  const [roleActuel, setRoleActuel] = useState<RoleId>(init.role);
  const [tiroir, setTiroir] = useState<TiroirId>(init.tiroir);
  const [creerOuvert, setCreerOuvert] = useState<boolean>(init.ouvrirCreer);

  useEffect(() => {
    const r = interpreterInitialTab(initialTab, roleActuel);
    setRoleActuel(r.role);
    setTiroir(r.tiroir);
    setCreerOuvert(r.ouvrirCreer);
    changerRoleEspace(r.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  const selectionnerRole = (nouveauRole: RoleId) => {
    setRoleActuel(nouveauRole);
    setTiroir(null);
    changerRoleEspace(nouveauRole);
  };

  const [destinataire, setDestinataire] = useState("");
  const [montantEnvoi, setMontantEnvoi] = useState("");
  const [editionDuoId, setEditionDuoId] = useState<string | null>(null);
  const [nomDuoDraft, setNomDuoDraft] = useState("");
  const [filtreCompetence, setFiltreCompetence] = useState("Toutes");
  const [ticketIndex, setTicketIndex] = useState(0);

  const { ids: favoris, has: hasFav, toggle: toggleFav } = useFavorites();

  const mesBilletsEnrichis = useMemo(
    () =>
      billets
        .map((billet) => {
          const item = tousLesEvenements.find((x) => x.event.id === billet.id);
          return item ? { billet, ...item } : null;
        })
        .filter(Boolean) as {
        billet: (typeof billets)[number];
        event: (typeof tousLesEvenements)[number]["event"];
        mois: (typeof tousLesEvenements)[number]["mois"];
      }[],
    [billets, tousLesEvenements],
  );

  const missionsFiltrees = useMemo(() => {
    if (filtreCompetence === "Toutes") return MISSIONS;
    return MISSIONS.filter((m) => m.competences.includes(filtreCompetence));
  }, [filtreCompetence]);

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

  const envoyer = () => {
    const m = parseFloat(montantEnvoi.replace(",", "."));
    if (envoyerArgentPortefeuille(destinataire, m)) {
      setDestinataire("");
      setMontantEnvoi("");
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-white md:pb-12">
      {/* ——— 1. BARRE SUPÉRIEURE ULTRA-SOBRE ——— */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="flex h-[64px] items-center justify-between px-[4vw] md:px-[2.6vw]">
          <div className="flex items-center gap-3">
            <button
              onClick={onRetour}
              aria-label="Retour à l'accueil"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              {/* Anneau Aurore chirurgical de 1.5px autour de l'avatar noir */}
              <span className="rounded-full bg-event-gradient p-[1.5px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black font-display text-[11px] font-bold text-white">
                  CR
                </span>
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-none text-white">Camille Ravier</p>
                <p className="mt-0.5 text-[10.5px] font-medium text-white/45">
                  {points} pts · {niveau}
                </p>
              </div>
            </div>
          </div>

          {/* Utilitaires en icônes épurées : Portefeuille & Messages */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTiroir(tiroir === "portefeuille" ? null : "portefeuille")}
              title="Portefeuille AIME & Banque du temps"
              aria-label="Portefeuille AIME"
              aria-pressed={tiroir === "portefeuille"}
              className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold tracking-tight transition ${
                tiroir === "portefeuille"
                  ? "bg-white text-black shadow-md"
                  : "border border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/[0.12]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{solde} €</span>
            </button>

            <button
              onClick={() => setTiroir(tiroir === "messages" ? null : "messages")}
              title="Messagerie"
              aria-label="Messagerie"
              aria-pressed={tiroir === "messages"}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                tiroir === "messages"
                  ? "bg-white text-black shadow-md"
                  : "border border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/[0.12]"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              {totalNonLus > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-event-gradient px-1 text-[9px] font-bold text-white shadow-sm">
                  {totalNonLus}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ——— 2. LE SÉLECTEUR UNIQUE DES 3 RÔLES FAÇON IOS SEGMENTED CONTROL ——— */}
        <div className="border-t border-white/[0.06] px-[4vw] py-2.5 md:px-[2.6vw]">
          <div
            className="apple-segment mx-auto grid max-w-2xl grid-cols-3 gap-1 rounded-full p-1"
            role="tablist"
            aria-label="Choisir votre rôle"
          >
            {ROLES.map((r) => {
              const actif = roleActuel === r.id && tiroir === null;
              const Icon = r.icone;
              return (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={actif}
                  onClick={() => selectionnerRole(r.id)}
                  className={`flex items-center justify-center gap-2 rounded-full py-2 px-2.5 text-center transition-all duration-300 ${
                    actif
                      ? "apple-pill-active font-semibold"
                      : "font-medium text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-display text-[11.5px] tracking-[-0.01em] sm:hidden">
                    {r.labelMobile}
                  </span>
                  <span className="hidden font-display text-[13px] tracking-[-0.01em] sm:inline">
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ——— CONTENU PRINCIPAL : 1 SEUL ÉCRAN CLAIR PAR RÔLE ——— */}
      <div className="mx-auto max-w-6xl px-[4vw] pt-6 md:px-[2.6vw] md:pt-8">
        {/* ═══════════ TIROIR TRANSVERSAL : MESSAGES ═══════════ */}
        {tiroir === "messages" && (
          <div className="space-y-4" style={{ animation: "fadeIn 0.25s ease both" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-white">
                Messagerie
              </h2>
              <button
                onClick={() => setTiroir(null)}
                title="Fermer"
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Messagerie />
          </div>
        )}

        {/* ═══════════ TIROIR TRANSVERSAL : PORTEFEUILLE ═══════════ */}
        {tiroir === "portefeuille" && (
          <div className="space-y-4" style={{ animation: "fadeIn 0.25s ease both" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-white">
                Portefeuille & Banque du temps
              </h2>
              <button
                onClick={() => setTiroir(null)}
                title="Fermer"
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <div className="apple-card rounded-[26px] p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-white/50">Solde disponible</p>
                    <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/80">
                      {heuresDisponibles} h Banque du temps
                    </span>
                  </div>
                  <p className="mt-2 font-display text-5xl font-bold tracking-[-0.04em] text-white">
                    {solde.toLocaleString("fr-FR")} €
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => rechargerPortefeuille(50)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[12.5px] font-semibold text-black transition hover:bg-white/90"
                    >
                      <Plus className="h-3.5 w-3.5" /> 50 €
                    </button>
                    <button
                      onClick={() => convertirHeuresEnEuros()}
                      disabled={heuresDisponibles < 4}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-[12.5px] font-medium text-white transition enabled:hover:bg-white/10 disabled:opacity-35"
                    >
                      4 h → +18 €
                    </button>
                  </div>
                </div>

                <div className="apple-card rounded-[26px] p-6">
                  <p className="text-[12px] font-medium text-white/50">
                    Pass & Carnets (0 € de frais)
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        acheterPass({
                          name: "Carnet 4 RDV",
                          price: 48,
                          note: "4 places au choix · partageable",
                          qty: 1,
                          utiliserWallet: solde >= 48,
                        })
                      }
                      className="flex flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.08]"
                    >
                      <span className="font-display text-xs font-bold text-white">
                        Carnet 4 RDV
                      </span>
                      <span className="mt-1 text-[11px] text-white/45">4 places au choix</span>
                      <span className="mt-2 font-display text-lg font-bold text-white">48 €</span>
                    </button>
                    <button
                      onClick={() =>
                        acheterPass({
                          name: "Pass Saison 2027",
                          price: 120,
                          note: "Accès illimité 36 RDV",
                          qty: 1,
                          utiliserWallet: solde >= 120,
                        })
                      }
                      className="flex flex-col justify-between rounded-2xl border border-white/25 bg-white/[0.08] p-4 text-left transition hover:border-white/45 hover:bg-white/[0.12]"
                    >
                      <span className="font-display text-xs font-bold text-white">
                        Pass Saison 2027
                      </span>
                      <span className="mt-1 text-[11px] text-white/55">Accès illimité</span>
                      <span className="mt-2 font-display text-lg font-bold text-white">
                        120 €
                      </span>
                    </button>
                  </div>
                </div>

                <div className="apple-card rounded-[26px] p-6">
                  <p className="text-[12px] font-medium text-white/50">Envoyer à un proche</p>
                  <input
                    value={destinataire}
                    onChange={(e) => setDestinataire(e.target.value)}
                    placeholder="Nom ou identifiant AIME"
                    className="mt-3 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      value={montantEnvoi}
                      onChange={(e) => setMontantEnvoi(e.target.value)}
                      placeholder="Montant €"
                      inputMode="decimal"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
                    />
                    <button
                      onClick={envoyer}
                      className="shrink-0 rounded-xl bg-white px-5 text-xs font-semibold text-black transition hover:bg-white/90"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>

              <div className="apple-card overflow-hidden rounded-[26px]">
                <p className="border-b border-white/[0.08] px-5 py-4 font-display text-sm font-bold text-white">
                  Historique ({transactions.length})
                </p>
                <div className="max-h-[420px] divide-y divide-white/[0.06] overflow-y-auto">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-white">{t.libelle}</p>
                        <p className="text-[11px] text-white/40">{t.date}</p>
                      </div>
                      <span
                        className={`shrink-0 font-display text-sm font-bold tabular-nums ${
                          t.montant > 0 ? "text-white" : "text-white/55"
                        }`}
                      >
                        {t.montant > 0 ? "+" : ""}
                        {t.montant.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 1 : JE PARTICIPE (Apple Wallet Billets + Accordéons Cercle & Passeport)
           ══════════════════════════════════════════════════════════════════ */}
        {tiroir === null && roleActuel === "participe" && (
          <div className="space-y-6" style={{ animation: "fadeIn 0.3s ease both" }}>
            {passesActifs.length > 0 && (
              <div className="apple-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
                <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Pass actif : {passesActifs.map((p) => `${p.name} (×${p.qty})`).join(" · ")}
                </span>
                <span className="text-xs text-white/55">Réservations à 0 € sur toute la saison</span>
              </div>
            )}

            {/* UN SEUL TICKET PERFORÉ 100 % OPAQUE + NAVIGATION SLIDE POUR LES FAIRE DÉFILER */}
            {mesBilletsEnrichis.length > 0 &&
              (() => {
                const totalTickets = mesBilletsEnrichis.length;
                const safeIdx = ((ticketIndex % totalTickets) + totalTickets) % totalTickets;
                const { billet, event, mois } = mesBilletsEnrichis[safeIdx];
                const u = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
                const sensoriel = sensorielDe(event.id);
                const ratioSensoriel = Math.min(
                  100,
                  Math.round(
                    ((sensoriel.bruit + sensoriel.foule + sensoriel.lumiere) / 15) * 100,
                  ),
                );
                const aime = hasFav(event.id);

                return (
                  <div className="mx-auto w-full max-w-xl space-y-3">
                    {/* Barre de navigation slide discrète au-dessus de l'unique ticket */}
                    <div className="flex items-center justify-between px-1">
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                        Mes billets · {String(safeIdx + 1).padStart(2, "0")} /{" "}
                        {String(totalTickets).padStart(2, "0")}
                      </span>

                      <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#0b0b0e] p-1">
                        <button
                          onClick={() => setTicketIndex((i) => i - 1)}
                          title="Billet précédent"
                          aria-label="Billet précédent"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1 px-1.5">
                          {mesBilletsEnrichis.map((b, idx) => (
                            <button
                              key={b.event.id}
                              onClick={() => setTicketIndex(idx)}
                              aria-label={`Billet ${idx + 1}`}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === safeIdx
                                  ? "w-4 bg-white"
                                  : "w-1.5 bg-white/25 hover:bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setTicketIndex((i) => i + 1)}
                          title="Billet suivant"
                          aria-label="Billet suivant"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* LE VRAI TICKET BLANC PERFORÉ 100 % OPAQUE (Comme sur l'accueil et le Studio) */}
                    <article
                      key={event.id}
                      style={{
                        WebkitMaskImage:
                          "radial-gradient(circle at 0 calc(100% - 88px), transparent 11px, black 11.5px), radial-gradient(circle at 100% calc(100% - 88px), transparent 11px, black 11.5px)",
                        WebkitMaskPosition: "left top, right top",
                        WebkitMaskSize: "51% 100%, 51% 100%",
                        WebkitMaskRepeat: "no-repeat",
                        maskImage:
                          "radial-gradient(circle at 0 calc(100% - 88px), transparent 11px, black 11.5px), radial-gradient(circle at 100% calc(100% - 88px), transparent 11px, black 11.5px)",
                        maskPosition: "left top, right top",
                        maskSize: "51% 100%, 51% 100%",
                        maskRepeat: "no-repeat",
                      }}
                      className="relative overflow-hidden rounded-[28px] bg-white text-[#0a0a0c]"
                    >
                      {/* Filet supérieur Aurore */}
                      <div className="h-[4px] w-full bg-event-gradient" />

                      {/* Partie haute du Ticket Blanc */}
                      <div className="px-6 pb-5 pt-5 sm:px-7 sm:pt-6">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a0a0c]/45">
                            AIME EVENT · #{event.id}
                          </span>
                          <button
                            onClick={() => toggleFav(event.id)}
                            title={aime ? "Retirer des favoris" : "Ajouter aux favoris"}
                            aria-label={aime ? "Retirer des favoris" : "Ajouter aux favoris"}
                            aria-pressed={aime}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                              aime
                                ? "border-[#ff375f]/30 bg-[#ff375f]/10 text-[#ff375f]"
                                : "border-black/10 bg-black/[0.03] text-[#0a0a0c]/55 hover:bg-black/[0.08] hover:text-[#0a0a0c]"
                            }`}
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${
                                aime ? "fill-current text-[#ff375f]" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Date & Heure */}
                        <p className="mt-2 font-display text-[clamp(1.25rem,2.4vw,1.6rem)] font-bold leading-tight tracking-[-0.025em] text-[#0a0a0c]">
                          {event.jour} {mois.nom.toLowerCase()} · {event.heure}
                        </p>

                        {/* Grand Titre */}
                        <h2 className="mt-1 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#0a0a0c]">
                          {event.nom}
                        </h2>

                        {/* Univers · Format (Durée) + Résumé */}
                        <p className="mt-3 text-[13px] font-semibold text-[#0a0a0c]/70">
                          {u.nom} · {event.format} ({event.duree})
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#0a0a0c]/55">
                          {event.resume}
                        </p>

                        {/* Confort Sensoriel + Jauge Aurore fine */}
                        <div className="mt-4">
                          <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#0a0a0c]/40">
                            CONFORT SENSORIEL ·{" "}
                            {sensoriel.access.includes("PMR") ? "ACCÈS PMR" : "TOUS PUBLICS"}
                          </p>
                          <div className="mt-1.5 h-[3px] w-44 overflow-hidden rounded-full bg-black/10">
                            <div
                              className="h-full bg-event-gradient"
                              style={{ width: `${ratioSensoriel}%` }}
                            />
                          </div>
                        </div>

                        {editionDuoId === event.id && (
                          <div className="mt-4 flex gap-1.5">
                            <input
                              value={nomDuoDraft}
                              onChange={(e) => setNomDuoDraft(e.target.value)}
                              placeholder="Nom de votre invité·e Duo"
                              className="flex-1 rounded-xl border border-black/15 bg-black/[0.04] px-3 py-2 text-xs text-[#0a0a0c] focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                definirInviteDuo(event.id, nomDuoDraft);
                                setEditionDuoId(null);
                              }}
                              className="rounded-xl bg-[#0a0a0c] px-3 py-2 text-[10px] font-extrabold uppercase text-white"
                            >
                              OK
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ——— LIGNE POINTILLÉE ALIGNÉE SUR LES ENCOCHES TRANSPARENTES (88px du bas) ——— */}
                      <div className="mx-5 border-t border-dashed border-black/15" aria-hidden="true" />

                      {/* ——— TALON DÉTACHABLE (h-[88px] fixe) : ID + Pictos à gauche / QR Code à droite ——— */}
                      <div className="flex h-[88px] items-center justify-between gap-4 px-6 sm:px-7">
                        <div className="min-w-0 space-y-1.5">
                          <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#0a0a0c]/45">
                            ID · {AIME_ID}-{event.id}
                          </p>

                          {/* Barre d'actions par pictogrammes uniquement */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => exporterEvenement(event, mois)}
                              title="Ajouter à l'agenda (.ics)"
                              aria-label="Ajouter à l'agenda"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0c] text-white transition hover:scale-105"
                            >
                              <CalendarPlus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => telechargerBilletCollectorPng(event, mois, billet)}
                              title="Télécharger le ticket (PNG)"
                              aria-label="Télécharger le ticket PNG"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-[#0a0a0c] transition hover:bg-black/10"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditionDuoId(editionDuoId === event.id ? null : event.id);
                                setNomDuoDraft(billet.inviteDuoNom ?? "");
                              }}
                              title="Inviter en Duo"
                              aria-label="Inviter en Duo"
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                billet.inviteDuoNom
                                  ? "border-emerald-500 bg-emerald-400 text-black"
                                  : "border-black/15 bg-black/[0.04] text-[#0a0a0c] hover:bg-black/10"
                              }`}
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </button>
                            {billet.rejointCercle && (
                              <button
                                onClick={() => setTiroir("messages")}
                                title="Ouvrir le salon Cercle Solo"
                                aria-label="Salon Cercle Solo"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-400 text-black transition"
                              >
                                <HeartHandshake className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => basculerPlaceSolidaireBillet(event.id)}
                              title={
                                billet.cedeSolidaire
                                  ? "Retirer du pot solidaire"
                                  : "Céder au pot solidaire"
                              }
                              className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition ${
                                billet.cedeSolidaire
                                  ? "bg-emerald-400 text-black"
                                  : "border border-black/10 bg-black/[0.03] text-[#0a0a0c]/60 hover:bg-black/[0.08] hover:text-[#0a0a0c]"
                              }`}
                            >
                              {billet.cedeSolidaire ? "Solidaire ✓" : "Céder"}
                            </button>
                          </div>
                        </div>

                        <QrCanvas seed={`${event.id}-${AIME_ID}-${billet.qty}`} />
                      </div>
                    </article>
                  </div>
                );
              })()}

            {/* Missions adoptées par l'utilisateur (liées à J'AIDE) */}
            {missionsRejointes.length > 0 && (
              <div className="mx-auto max-w-xl rounded-[24px] border border-white/12 bg-[#0b0b0e] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Mes missions adoptées ({missionsRejointes.length})</span>
                  </p>
                  <button
                    onClick={telechargerAttestationBenevole}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-white hover:text-black"
                  >
                    <FileText className="h-3 w-3" /> Attestation ({heuresValidees} h)
                  </button>
                </div>
                <div className="mt-3 divide-y divide-white/[0.07]">
                  {MISSIONS.filter((m) => missionsRejointes.includes(m.id)).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold text-white">
                          {m.titre}
                        </p>
                        <p className="text-[11px] text-white/45">
                          {m.quand} · {m.lieu} (+4 h Banque du temps)
                        </p>
                      </div>
                      <button
                        onClick={() => basculerMissionEspace(m.id)}
                        aria-label={`Se désinscrire de ${m.titre}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/55 hover:bg-white hover:text-black"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection de favoris (♥) si l'utilisateur a aimé des événements */}
            {favoris.length > 0 && (
              <div className="mx-auto max-w-xl rounded-[24px] border border-white/12 bg-[#0b0b0e] p-5">
                <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                  <Heart className="h-3.5 w-3.5 fill-[#ff375f] text-[#ff375f]" />
                  <span>Mes favoris ({favoris.length})</span>
                </p>
                <div className="mt-3 divide-y divide-white/[0.07]">
                  {tousLesEvenements
                    .filter(({ event }) => favoris.includes(event.id))
                    .map(({ event, mois }) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-bold text-white">
                            {event.nom}
                          </p>
                          <p className="text-[11px] text-white/45">
                            {event.jour} {mois.nom.toLowerCase()} · {event.heure}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFav(event.id)}
                          aria-label={`Retirer ${event.nom}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/55 hover:bg-white hover:text-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 2 : J'ORGANISE (Uniquement le Cockpit d'Émargement + Publication directe)
           ══════════════════════════════════════════════════════════════════ */}
        {tiroir === null && roleActuel === "organise" && (
          <div className="space-y-5" style={{ animation: "fadeIn 0.3s ease both" }}>
            {creerOuvert ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-white">
                    Publier un rendez-vous
                  </h2>
                  <button
                    onClick={() => setCreerOuvert(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white hover:bg-white hover:text-black"
                  >
                    ← Retour
                  </button>
                </div>
                <Creer
                  onNavigateTab={() => {
                    setCreerOuvert(false);
                  }}
                  onOpenMonth={onOpenMonth}
                />
              </div>
            ) : (
              <CockpitOrganisateur
                onGoCreer={() => setCreerOuvert(true)}
                onGoMessages={() => setTiroir("messages")}
              />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 3 : J'AIDE (Sobriété 95/4/1 : Verre Noir + Émeraude de validation + Filet Aurore)
           ══════════════════════════════════════════════════════════════════ */}
        {tiroir === null && roleActuel === "aide" && (
          <div className="space-y-5" style={{ animation: "fadeIn 0.3s ease both" }}>
            {/* Barre Banque du temps avec filet Aurore 1px et point émeraude */}
            <div className="apple-card relative overflow-hidden rounded-[26px] p-5">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-event-gradient" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-[12px] font-medium text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Banque du temps · {heuresDisponibles} h disponibles ({heuresValidees} h validées)
                  </p>
                  <p className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-white">
                    4 h d'entraide = 1 place offerte (ou +18 €)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => convertirHeuresEnEuros()}
                    disabled={heuresDisponibles < 4}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-sm transition enabled:hover:bg-white/90 disabled:opacity-35"
                  >
                    Convertir 4 h → +18 €
                  </button>
                  <button
                    onClick={telechargerAttestationBenevole}
                    title="Télécharger mon attestation de bénévolat (.txt)"
                    aria-label="Télécharger mon attestation de bénévolat"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/15 hover:text-white"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtre compétences en pilules sobres (zéro débordement horizontal) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {COMPETENCES_FILTRE.map((c) => (
                <button
                  key={c}
                  onClick={() => setFiltreCompetence(c)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                    filtreCompetence === c
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "border border-white/10 bg-white/[0.04] text-white/55 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* MISSIONS SOUS FORME DE VRAIS TICKETS BLANCS PERFORÉS À L'HORIZONTAL */}
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
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0a0a0c]/45">
                            AIME EVENT · MISSION #{numMission}
                          </span>
                        </div>

                        <p className="mt-2 font-display text-[15px] font-bold tracking-[-0.02em] text-[#0a0a0c]">
                          {m.quand} · {m.lieu}
                        </p>

                        <h2 className="mt-0.5 font-display text-xl font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c] sm:text-2xl">
                          {m.titre}
                        </h2>

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
                      <div className="flex shrink-0 flex-row items-center justify-between gap-4 px-5 py-4 sm:w-60 sm:flex-col sm:justify-center sm:px-6 sm:py-5 sm:text-center">
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
                              <Check className="h-4 w-4" /> Engagée · +4 h
                            </>
                          ) : complet ? (
                            "Complet"
                          ) : (
                            "Rejoindre · +4 h"
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
