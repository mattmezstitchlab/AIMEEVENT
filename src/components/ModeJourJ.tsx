import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Check,
  Clock,
  Download,
  HeartHandshake,
  Map,
  MapPin,
  MessageCircle,
  QrCode,
  Radio,
  ScanLine,
  Shield,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";
import { AIME_ID } from "../data/espace";
import { UNIVERS_PAR_ID } from "../data/annee";
import { NIVEAU, sensorielDe } from "../data/innovations";
import {
  declencherAlerteSafeTeam,
  useEspaceStore,
  validerCheckinBenevole,
} from "../hooks/useEspaceStore";
import PlanInteractif from "./PlanInteractif";
import { telechargerBilletCollectorPng } from "../utils/billetCanvas";

function HighContrastQr({ seed }: { seed: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const N = 23;
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
      className="h-40 w-40 shrink-0 rounded-2xl bg-white p-2.5 shadow-[0_0_40px_rgba(255,255,255,0.22)]"
      aria-label="QR Code haute luminosité"
    />
  );
}

const ZONES_SITE = [
  "Grande salle",
  "Entrée · Totem AIME",
  "Cour & plein air",
  "Salle calme (Bât. B)",
  "Grandes tablées / Bar",
  "Espace familles",
];

const BESOINS_SAFE = [
  "Besoin d'écoute / Safe space calme",
  "Verre d'eau / Léger malaise",
  "Signaler un comportement inapproprié",
  "Raccompagnement sortie / transports",
];

export default function ModeJourJ({
  open,
  onClose,
  onOpenMessages,
}: {
  open: boolean;
  onClose: () => void;
  onOpenMessages?: () => void;
}) {
  const { billets, tousLesEvenements, heuresDisponibles } = useEspaceStore();
  const [section, setSection] = useState<"billet" | "plan" | "safe" | "scanner">("billet");
  const [billetIdx, setBilletIdx] = useState(0);

  /* Safe Team state */
  const [zone, setZone] = useState(ZONES_SITE[0]);
  const [besoin, setBesoin] = useState(BESOINS_SAFE[0]);
  const [noteSafe, setNoteSafe] = useState("");
  const [alerteEnvoyee, setAlerteEnvoyee] = useState(false);

  /* Scanner Bénévole state + Caméra réelle */
  const [codeScan, setCodeScan] = useState("AIME-2027-8914-LP");
  const [dernierScan, setDernierScan] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraErreur, setCameraErreur] = useState<string | null>(null);
  const videoScanRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const arreterCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const demarrerCamera = async () => {
    setCameraErreur(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErreur("Caméra non détectée sur cet appareil — utilisez la validation directe ci-dessous.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoScanRef.current) {
          videoScanRef.current.srcObject = stream;
          videoScanRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraErreur("Accès caméra refusé ou indisponible — mode validation rapide actif.");
    }
  };

  useEffect(() => {
    if (!open || section !== "scanner") {
      arreterCamera();
    }
    return () => arreterCamera();
  }, [open, section]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const billetsEnrichis = billets
    .map((b) => {
      const found = tousLesEvenements.find((x) => x.event.id === b.id);
      return found ? { billet: b, ...found } : null;
    })
    .filter(Boolean) as {
    billet: (typeof billets)[number];
    event: (typeof tousLesEvenements)[number]["event"];
    mois: (typeof tousLesEvenements)[number]["mois"];
  }[];

  const actif = billetsEnrichis[billetIdx % Math.max(1, billetsEnrichis.length)] ?? {
    billet: {
      id: "07",
      qty: 1,
      dateReservation: "Aujourd'hui",
      modePaiement: "wallet" as const,
      montantPaye: 45,
      rejointCercle: true,
    },
    event: tousLesEvenements[6].event,
    mois: tousLesEvenements[6].mois,
  };

  const s = sensorielDe(actif.event.id);
  const univers = UNIVERS_PAR_ID[actif.event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];

  const envoyerSafeTeam = () => {
    declencherAlerteSafeTeam(zone, besoin, noteSafe.trim() || undefined);
    setAlerteEnvoyee(true);
  };

  const simulerScan = () => {
    const code = codeScan.trim() || `AIME-2027-${Math.floor(1000 + Math.random() * 9000)}`;
    validerCheckinBenevole(code);
    setDernierScan(code);
    setCodeScan(`AIME-2027-${Math.floor(1000 + Math.random() * 9000)}-OK`);
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Mode Jour J — Compagnon sur place"
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/15 bg-[#09090b] text-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "heroUp 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="h-1.5 bg-event-gradient" />

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="font-display text-xs font-extrabold uppercase tracking-[0.2em]">
              Mode Jour J · Compagnon sur place & Safe Team
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le mode Jour J"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation interne en 4 pôles */}
        <div className="grid grid-cols-2 gap-1.5 border-b border-white/10 bg-black/50 px-6 py-3 sm:grid-cols-4">
          <button
            onClick={() => setSection("billet")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              section === "billet"
                ? "bg-white text-black"
                : "border border-white/12 text-white/55 hover:text-white"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> Billet QR
          </button>
          <button
            onClick={() => setSection("plan")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              section === "plan"
                ? "bg-white text-black"
                : "border border-white/12 text-white/55 hover:text-white"
            }`}
          >
            <Map className="h-3.5 w-3.5" /> Plan & Capteurs
          </button>
          <button
            onClick={() => {
              setSection("safe");
              setAlerteEnvoyee(false);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              section === "safe"
                ? "bg-[#ff4e6b] text-white"
                : "border border-[#ff4e6b]/30 text-[#ff4e6b] hover:bg-[#ff4e6b]/15"
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Safe Team 18+
          </button>
          <button
            onClick={() => setSection("scanner")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              section === "scanner"
                ? "bg-event-gradient text-white"
                : "border border-white/12 text-white/55 hover:text-white"
            }`}
          >
            <ScanLine className="h-3.5 w-3.5" /> Scanner QR
          </button>
        </div>

        <div className="p-6">
          {/* ═══════════ 1. BILLET EXPRESS & MÉTÉO SENSORIELLE ═══════════ */}
          {section === "billet" && (
            <div className="space-y-5">
              {billetsEnrichis.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {billetsEnrichis.map((b, i) => (
                    <button
                      key={b.event.id}
                      onClick={() => setBilletIdx(i)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                        i === billetIdx
                          ? "bg-event-gradient text-white"
                          : "border border-white/15 text-white/55 hover:text-white"
                      }`}
                    >
                      {b.event.nom} (×{b.billet.qty})
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent p-6 sm:flex-row">
                <HighContrastQr seed={`${actif.event.id}-${AIME_ID}-${actif.billet.qty}`} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-emerald-300">
                    <WifiOff className="h-3 w-3" /> Prêt hors-ligne · Luminosité max
                  </div>
                  <h2 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight">
                    {actif.event.nom}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {actif.mois.nom} 2027 · {actif.event.jour} · {actif.event.heure} ({univers.nom})
                  </p>
                  <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                    {actif.billet.qty} place{actif.billet.qty > 1 ? "s" : ""} · ID {AIME_ID}-
                    {actif.event.id}
                    {actif.billet.inviteDuoNom ? ` · Duo : ${actif.billet.inviteDuoNom}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <button
                      onClick={() =>
                        telechargerBilletCollectorPng(actif.event, actif.mois, actif.billet)
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black transition hover:bg-event-gradient hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" /> Télécharger Billet Collector PNG
                    </button>
                    {actif.billet.rejointCercle && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff9c2e]/30 bg-[#ff9c2e]/10 px-3 py-1.5 text-[10px] font-semibold text-[#ff9c2e]">
                        <HeartHandshake className="h-3.5 w-3.5" /> RDV Cercle : Totem -20 min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Météo sensorielle en direct */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/50">
                    <Radio className="h-3.5 w-3.5 text-emerald-400" /> Météo sensorielle en direct
                    sur site
                  </p>
                  <button
                    onClick={() => setSection("plan")}
                    className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-400 underline underline-offset-2"
                  >
                    Ouvrir le plan des 6 zones →
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#0b0b0d] p-3.5">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                      <Volume2 className="h-3 w-3 text-[#ff9c2e]" /> Niveau sonore
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold">
                      {45 + s.bruit * 9} dB · {NIVEAU[s.bruit]}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-white/45">
                      Bouchons d'oreilles gratuits à l'entrée
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0d] p-3.5">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                      <MapPin className="h-3 w-3 text-emerald-400" /> Refuge sensoriel
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold">
                      {s.salleCalme ? "Salle calme ouverte" : "Salon Bât. B (34 dB)"}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-white/45">
                      Lumière tamisée, eau fraîche & fauteuils
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0b0b0d] p-3.5">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                      <Shield className="h-3 w-3 text-[#ff4e6b]" /> Veille & Safe Team
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold">
                      Intervention &lt; 2 min
                    </p>
                    <button
                      onClick={() => setSection("safe")}
                      className="mt-1 text-[10.5px] font-bold text-[#ff4e6b] underline underline-offset-2"
                    >
                      Signaler un besoin →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ 2. PLAN INTERACTIF DES 6 ESPACES ═══════════ */}
          {section === "plan" && (
            <PlanInteractif
              onOpenMessages={
                onOpenMessages
                  ? () => {
                      onClose();
                      onOpenMessages();
                    }
                  : undefined
              }
            />
          )}

          {/* ═══════════ 3. SAFE TEAM 18+ · BOUTON D'INTERVENTION ═══════════ */}
          {section === "safe" && (
            <div className="space-y-4">
              {alerteEnvoyee ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] p-6 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-black">
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
                    La Safe Team est en route vers « {zone} ».
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/70">
                    Deux référent·es formé·es (gilet dégradé AIME) arrivent en moins de 2 minutes.
                    Un canal direct vient de s'ouvrir dans votre Messagerie.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    {onOpenMessages && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenMessages();
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-event-gradient hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4" /> Ouvrir le fil Safe Team
                      </button>
                    )}
                    <button
                      onClick={() => setAlerteEnvoyee(false)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Nouveau signalement
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#ff4e6b]/30 bg-[#ff4e6b]/[0.08] p-4">
                    <p className="flex items-center gap-2 font-display text-sm font-extrabold text-white">
                      <Shield className="h-4 w-4 text-[#ff4e6b]" /> Signalement discret en 2
                      secondes
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">
                      Aucun appel vocal requis. Indiquez votre zone et votre besoin : l'équipe sur
                      place reçoit votre position et vous rejoint immédiatement.
                    </p>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/45">
                      1. Où êtes-vous ?
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ZONES_SITE.map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setZone(z)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                            zone === z
                              ? "border-transparent bg-white text-black"
                              : "border-white/12 bg-white/[0.02] text-white/70 hover:border-white/30"
                          }`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/45">
                      2. De quoi avez-vous besoin ?
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {BESOINS_SAFE.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBesoin(b)}
                          className={`rounded-xl border px-3.5 py-3 text-left text-xs font-bold transition ${
                            besoin === b
                              ? "border-transparent bg-[#ff4e6b] text-white"
                              : "border-white/12 bg-white/[0.02] text-white/70 hover:border-white/30"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    value={noteSafe}
                    onChange={(e) => setNoteSafe(e.target.value)}
                    placeholder="Détail optionnel (ex. veste bleue, près du pilier gauche…)"
                    className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-xs text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={envoyerSafeTeam}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff4e6b] py-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_12px_36px_-8px_rgba(255,78,107,0.7)] transition hover:brightness-110 active:scale-[0.99]"
                  >
                    <Shield className="h-4 w-4" /> Demander la Safe Team maintenant
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═══════════ 4. SCANNER CAMÉRA & CHECK-IN BÉNÉVOLE ═══════════ */}
          {section === "scanner" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#ff9c2e]">
                      Terminal Bénévole & Organisateur
                    </p>
                    <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight">
                      Scanner un billet par caméra ou référence
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[11px] font-bold text-white/80">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> {heuresDisponibles} h en
                    Banque du temps
                  </span>
                </div>

                {/* Viseur Caméra optique */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black">
                  {cameraActive ? (
                    <div className="relative flex h-52 items-center justify-center">
                      <video
                        ref={videoScanRef}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                      {/* Cible laser de scan */}
                      <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-emerald-400/70 shadow-[0_0_30px_rgba(52,211,153,0.3)]" />
                      <button
                        type="button"
                        onClick={arreterCamera}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-bold uppercase text-white"
                      >
                        <CameraOff className="h-3.5 w-3.5" /> Fermer caméra
                      </button>
                      <button
                        type="button"
                        onClick={simulerScan}
                        className="absolute bottom-3 rounded-full bg-emerald-400 px-5 py-2 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-black shadow-lg"
                      >
                        Capturer ce QR
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center">
                      <Camera className="h-7 w-7 text-white/35" />
                      <p className="text-xs text-white/55">
                        Activez l'optique de votre appareil pour scanner un QR code en direct, ou
                        validez par référence ci-dessous.
                      </p>
                      <button
                        type="button"
                        onClick={demarrerCamera}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-[10.5px] font-extrabold uppercase tracking-[0.13em] text-white transition hover:bg-white hover:text-black"
                      >
                        <Camera className="h-3.5 w-3.5" /> Activer la caméra QR
                      </button>
                      {cameraErreur && (
                        <p className="text-[11px] text-[#ff9c2e]">{cameraErreur}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={codeScan}
                    onChange={(e) => setCodeScan(e.target.value)}
                    placeholder="Référence billet (ex. AIME-2027-8914-LP)"
                    className="flex-1 rounded-xl border border-white/15 bg-[#09090b] px-4 py-3 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={simulerScan}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-event-gradient px-6 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
                  >
                    <ScanLine className="h-4 w-4" /> Valider l'entrée
                  </button>
                </div>

                {dernierScan && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
                    <span className="flex items-center gap-2 font-semibold">
                      <Check className="h-4 w-4 text-emerald-400" /> Billet {dernierScan} validé !
                    </span>
                    <span className="font-display font-extrabold text-emerald-300">
                      +2 h · +10 pts · +5 € Wallet
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
