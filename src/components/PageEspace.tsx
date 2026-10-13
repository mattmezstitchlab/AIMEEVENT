import { useMemo, useRef, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Award, CalendarPlus, Check, Clock, Download, FileText, Heart,
  HeartHandshake, ImagePlus, LayoutGrid, Lightbulb, MessageCircle, Plus, Sparkles, Ticket, User, Wallet,
} from "lucide-react";
import { Reveal } from "./Reveal";
import KitsVisuels from "./KitsVisuels";
import Messagerie from "./Messagerie";
import Documents from "./Documents";
import Creer from "./Creer";
import Communaute from "./Communaute";
import { useFavorites } from "../hooks/useFavorites";
import { AIME_ID, MISSIONS, TRANSACTIONS_INITIALES, type Transaction } from "../data/espace";
import { TOUS_LES_EVENEMENTS, UNIVERS, UNIVERS_PAR_ID } from "../data/annee";
import { exporterEvenement } from "../utils/ics";

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
  return <canvas ref={ref} className="h-24 w-24 shrink-0 rounded-lg bg-white p-1" aria-label="Code du billet" />;
}

const ROLES = [
  { id: "participe", label: "Je participe", baseline: "Vos billets, votre programme, vos rendez-vous." },
  { id: "organise", label: "J'organise", baseline: "Vos événements, vos équipes, vos documents." },
  { id: "aide", label: "J'aide", baseline: "Vos missions, vos points, votre communauté." },
  { id: "cree", label: "Je crée", baseline: "Vos visuels, vos contenus, votre audience." },
] as const;

const ONGLETS = [
  { id: "apercu", label: "Vue d'ensemble", icon: LayoutGrid },
  { id: "billets", label: "Mes billets", icon: Ticket },
  { id: "missions", label: "Missions", icon: Heart },
  { id: "cercle", label: "Le Cercle", icon: HeartHandshake },
  { id: "creer", label: "Proposer", icon: Lightbulb },
  { id: "creations", label: "Créations", icon: ImagePlus },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "portefeuille", label: "Portefeuille", icon: Wallet },
] as const;

type OngletId = (typeof ONGLETS)[number]["id"];

const MES_BILLETS = ["07", "01", "17"]
  .map((id) => TOUS_LES_EVENEMENTS.find((x) => x.event.id === id))
  .filter(Boolean) as typeof TOUS_LES_EVENEMENTS;

export default function PageEspace({
  onRetour,
  onAcces,
  initialTab = "apercu",
}: {
  onRetour: () => void;
  onAcces: () => void;
  initialTab?: string;
}) {
  const isOnglet = (id: string): id is OngletId => ONGLETS.some((o) => o.id === id);
  const [onglet, setOnglet] = useState<OngletId>(isOnglet(initialTab) ? initialTab : "apercu");

  useEffect(() => {
    if (isOnglet(initialTab)) setOnglet(initialTab);
  }, [initialTab]);
  const [role, setRole] = useState<string>(() => localStorage.getItem("aime-role") ?? "participe");
  const [missionsRejointes, setMissionsRejointes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("aime-missions") ?? "[]"); } catch { return []; }
  });
  const [creations, setCreations] = useState<number>(() => parseInt(localStorage.getItem("aime-creations") ?? "0", 10) || 0);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS_INITIALES);
  const [destinataire, setDestinataire] = useState("");
  const [montantEnvoi, setMontantEnvoi] = useState("");
  const [transfere, setTransfere] = useState<string | null>(null);

  const { ids: favoris } = useFavorites();

  const changerRole = (r: string) => {
    setRole(r);
    localStorage.setItem("aime-role", r);
  };
  const basculerMission = (id: string) => {
    setMissionsRejointes((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem("aime-missions", JSON.stringify(next));
      return next;
    });
  };
  const ajouterCreation = () => {
    setCreations((c) => {
      const n = c + 1;
      localStorage.setItem("aime-creations", String(n));
      return n;
    });
  };

  const points = useMemo(
    () => 180 + MISSIONS.filter((m) => missionsRejointes.includes(m.id)).reduce((s, m) => s + m.points, 0) + creations * 15,
    [missionsRejointes, creations],
  );
  const niveau = points < 260 ? "Découverte" : points < 420 ? "Exploratrice" : points < 600 ? "Passeuse" : "Ambassadrice";

  const solde = useMemo(() => transactions.reduce((s, t) => s + t.montant, 0), [transactions]);
  /* Heures validées : 4 h par mission engagée (vérifiées par le référent après l'événement) */
  const heuresValidees = missionsRejointes.length * 4;

  const universCouverts = useMemo(() => {
    const s = new Set<string>();
    MES_BILLETS.forEach(({ event }) => s.add(event.univers));
    favoris.forEach((id) => {
      const it = TOUS_LES_EVENEMENTS.find((x) => x.event.id === id);
      if (it) s.add(it.event.univers);
    });
    return s;
  }, [favoris]);

  const roleActif = ROLES.find((r) => r.id === role) ?? ROLES[0];

  const recharger = () => {
    setTransactions((t) => [{ id: `t${Date.now()}`, libelle: "Recharge portefeuille", date: "Aujourd'hui", montant: 50 }, ...t]);
  };
  const envoyer = () => {
    const m = parseFloat(montantEnvoi.replace(",", "."));
    if (!destinataire.trim() || isNaN(m) || m <= 0 || m > solde) return;
    setTransactions((t) => [{ id: `t${Date.now()}`, libelle: `Envoi à ${destinataire}`, date: "Aujourd'hui", montant: -m }, ...t]);
    setDestinataire("");
    setMontantEnvoi("");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Barre supérieure propre à l'espace */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between px-[5vw] md:px-[2.6vw]">
          <button onClick={onRetour} className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition hover:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition group-hover:border-white/40">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Retour au site</span>
          </button>
          <span className="font-display text-[15px] font-extrabold tracking-tight">
            MON <span className="text-event-gradient">ESPACE</span>
          </span>
          <span className="hidden items-center gap-2 rounded-full border border-white/12 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-white/60 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-[#ff9c2e]" /> {points} pts · {niveau}
          </span>
        </div>
      </div>

      <div className="px-[5vw] py-10 md:px-[2.6vw] md:py-14">
        {/* ——— Identité universelle ——— */}
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-event-gradient font-display text-2xl font-extrabold shadow-[0_16px_48px_-14px_rgba(255,78,107,0.7)]">
                CR
              </span>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Camille Ravier</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
                  <span className="tabular-nums">{AIME_ID}</span>
                  <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em]">Identité universelle</span>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em]">Depuis 2025</span>
                </p>
                <p className="mt-2 text-[13.5px] text-white/55">{roleActif.baseline}</p>
              </div>
            </div>
            {/* Bascule de rôle */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Votre rôle">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={role === r.id}
                  onClick={() => changerRole(r.id)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${role === r.id ? "bg-white text-black" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ——— Onglets ——— */}
        <nav className="sticky top-[68px] z-30 -mx-[5vw] mt-8 border-y border-white/10 bg-black/90 px-[5vw] py-3 backdrop-blur-xl md:-mx-[2.6vw] md:px-[2.6vw]" aria-label="Sections de l'espace">
          <div className="flex items-center gap-2 overflow-x-auto">
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                aria-pressed={onglet === o.id}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${onglet === o.id ? "bg-event-gradient text-white" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
              >
                <o.icon className="h-3.5 w-3.5" /> {o.label}
                {o.id === "messages" && <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4e6b] px-1 text-[9px] font-extrabold text-white">3</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-8" style={{ animation: "fadeIn 0.4s ease both" }} key={onglet}>
          {/* ═══════════ VUE D'ENSEMBLE ═══════════ */}
          {onglet === "apercu" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { n: String(MES_BILLETS.length), l: "Billets actifs", action: () => setOnglet("billets") },
                  { n: String(favoris.length), l: "Dans mon programme", action: () => setOnglet("billets") },
                  { n: String(missionsRejointes.length), l: "Missions en cours", action: () => setOnglet("missions") },
                  { n: `${heuresValidees} h`, l: "Heures validées", action: () => setOnglet("missions") },
                  { n: `${solde} €`, l: "Portefeuille AIME", action: () => setOnglet("portefeuille") },
                ].map((s) => (
                  <button key={s.l} onClick={s.action} className="group rounded-2xl border border-white/10 bg-[#09090b] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/30">
                    <p className="font-display text-3xl font-extrabold tracking-tight">{s.n}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 transition group-hover:text-white/65">
                      {s.l} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </button>
                ))}
              </div>

              {/* Passeport des catégories */}
              <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight">
                    <Award className="h-5 w-5 text-[#ff9c2e]" /> Passeport des catégories
                  </h2>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{universCouverts.size} / 12 catégories découvertes</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                  {UNIVERS.map((u) => {
                    const ok = universCouverts.has(u.id);
                    return (
                      <div key={u.id} className={`rounded-xl border p-3.5 text-center transition ${ok ? "border-transparent bg-event-gradient text-white" : "border-dashed border-white/12 text-white/30"}`}>
                        <p className="font-display text-[12px] font-extrabold leading-tight">{u.nom}</p>
                        <p className={`mt-1 text-[9px] font-bold uppercase tracking-[0.12em] ${ok ? "text-white/80" : "text-white/25"}`}>{ok ? "Découvert" : "À découvrir"}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[12.5px] text-white/45">
                  Chaque billet et chaque favori enrichit votre passeport. 12 catégories = statut Ambassadrice et accès prioritaire à vie.
                </p>
              </div>

              {/* Prochain rendez-vous */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Prochain rendez-vous</p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">{MES_BILLETS[0].event.nom}</h3>
                  <p className="mt-1 text-[13px] text-white/50">
                    {MES_BILLETS[0].mois.nom} · {MES_BILLETS[0].event.jour} · {MES_BILLETS[0].event.heure} — {UNIVERS_PAR_ID[MES_BILLETS[0].event.univers].nom}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => exporterEvenement(MES_BILLETS[0].event, MES_BILLETS[0].mois)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.13em] text-black transition hover:bg-event-gradient hover:text-white">
                      <CalendarPlus className="h-3.5 w-3.5" /> Ajouter au calendrier
                    </button>
                    <button onClick={() => setOnglet("billets")} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-white transition hover:border-white/50">
                      Voir mon billet
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Vos badges</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { nom: "Premier pas", ok: favoris.length > 0 },
                      { nom: "Exploratrice", ok: universCouverts.size >= 3 },
                      { nom: "Bénévole", ok: missionsRejointes.length > 0 },
                      { nom: "Créatrice", ok: creations > 0 },
                      { nom: "Ambassadrice", ok: universCouverts.size >= 12 },
                    ].map((b) => (
                      <span key={b.nom} className={`rounded-full px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] ${b.ok ? "bg-event-gradient text-white" : "border border-dashed border-white/15 text-white/30"}`}>
                        {b.nom}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-[12.5px] leading-relaxed text-white/45">
                    Les badges se gagnent en participant, aidant et créant — jamais en payant.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ BILLETS ═══════════ */}
          {onglet === "billets" && (
            <div className="grid gap-4 lg:grid-cols-3">
              {MES_BILLETS.map(({ event, mois }) => (
                <article key={event.id} className="flex flex-col rounded-2xl border border-white/10 bg-[#09090b] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{mois.nom} · {UNIVERS_PAR_ID[event.univers].nom}</p>
                      <h3 className="mt-1.5 font-display text-xl font-extrabold tracking-tight">{event.nom}</h3>
                      <p className="mt-1 text-[12px] text-white/50">{event.jour} · {event.heure} · {event.format}</p>
                    </div>
                    <QrCanvas seed={event.id + AIME_ID} />
                  </div>
                  <p className="mt-3 border-t border-dashed border-white/15 pt-3 text-[10.5px] tabular-nums text-white/35">
                    Réf. {AIME_ID}-{event.id} · 1 personne · {event.prix === 0 ? "Gratuit" : `${event.prix} €`}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => exporterEvenement(event, mois)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black transition hover:bg-event-gradient hover:text-white">
                      <CalendarPlus className="h-3.5 w-3.5" /> Calendrier
                    </button>
                    <button
                      onClick={() => setTransfere(transfere === event.id ? null : event.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-white/50"
                    >
                      {transfere === event.id ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Lien copié</> : "Transférer"}
                    </button>
                  </div>
                </article>
              ))}
              <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-white/15 p-5">
                <Ticket className="h-6 w-6 text-white/30" />
                <p className="mt-3 font-display text-base font-bold">Un billet de plus ?</p>
                <p className="mt-1 text-[12.5px] text-white/45">Le Pass Saison donne accès à toute la programmation.</p>
                <button onClick={onAcces} className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:text-white">
                  Voir les accès <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ MISSIONS ═══════════ */}
          {onglet === "cercle" && <Communaute />}

          {onglet === "missions" && (
            <div>
              <p className="max-w-2xl text-[14px] leading-relaxed text-white/55">
                Les missions sont le cœur d'AIME : ce sont elles qui font tourner les événements.
                Chaque mission rapporte des points, un tampon et une attestation générée automatiquement.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {MISSIONS.map((m) => {
                  const rejointe = missionsRejointes.includes(m.id);
                  const complet = m.prises >= m.places;
                  return (
                    <article key={m.id} className={`flex flex-col rounded-2xl border p-5 transition ${rejointe ? "border-transparent bg-white/[0.06] ring-1 ring-white/25" : "border-white/10 bg-[#09090b] hover:border-white/25"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">{UNIVERS_PAR_ID[m.univers].nom}</span>
                        <span className="font-display text-[12px] font-extrabold text-[#ff9c2e]">+{m.points} pts</span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-extrabold tracking-tight">{m.titre}</h3>
                      <p className="mt-1 text-[11.5px] font-semibold text-white/45">{m.quand} · {m.lieu}</p>
                      <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed text-white/50">{m.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.competences.map((c) => (
                          <span key={c} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.11em] text-white/45">{c}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/40">
                          {m.prises + (rejointe ? 1 : 0)} / {m.places} bénévoles
                        </span>
                        {complet && !rejointe ? (
                          <button
                            onClick={() => basculerMission(m.id)}
                            aria-pressed={rejointe}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition active:scale-[0.97] ${
                              rejointe ? "border border-white/25 text-white" : "border border-white/25 text-white/70 hover:border-white/50 hover:text-white"
                            }`}
                          >
                            {rejointe ? <><Check className="h-3 w-3" /> En liste d'attente</> : "Liste d'attente"}
                          </button>
                        ) : (
                          <button
                            onClick={() => basculerMission(m.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition active:scale-[0.97] ${
                              rejointe ? "bg-emerald-400 text-black" : "bg-white text-black hover:bg-event-gradient hover:text-white"
                            }`}
                          >
                            {rejointe ? <><Check className="h-3 w-3" /> Engagée</> : "Je m'engage"}
                          </button>
                        )}
                      </div>
                      {rejointe && (
                        <p className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[10.5px] text-white/50">
                          <Clock className="h-3 w-3 shrink-0" /> Heures validées automatiquement après la mission — attestation disponible dans Documents.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════ PROPOSER — innovation unique : n'importe qui peut créer un rendez-vous ═══════════ */}
          {onglet === "creer" && <Creer />}

          {/* ═══════════ CRÉATIONS ═══════════ */}
          {onglet === "creations" && <KitsVisuels onExport={ajouterCreation} />}

          {/* ═══════════ DOCUMENTS ═══════════ */}
          {onglet === "documents" && <Documents />}

          {/* ═══════════ MESSAGES ═══════════ */}
          {onglet === "messages" && <Messagerie />}

          {/* ═══════════ PORTEFEUILLE ═══════════ */}
          {onglet === "portefeuille" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Solde AIME Wallet</p>
                  <p className="mt-2 font-display text-5xl font-extrabold tracking-tight">{solde.toLocaleString("fr-FR")} €</p>
                  <p className="mt-2 text-[12px] text-white/45">Utilisable pour tous les billets, ateliers et services de la saison.</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={recharger} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.13em] text-black transition hover:bg-event-gradient hover:text-white">
                      <Plus className="h-3.5 w-3.5" /> Recharger 50 €
                    </button>
                    {heuresValidees >= 4 && (
                      <button
                        onClick={() => setTransactions((t) => [{ id: `t${Date.now()}`, libelle: "Banque du temps — 4 h → 1 rendez-vous", date: "Aujourd'hui", montant: 18 }, ...t])}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-white transition hover:border-white/50"
                      >
                        Convertir 4 h → 18 €
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Envoyer à un proche</p>
                  <input
                    value={destinataire}
                    onChange={(e) => setDestinataire(e.target.value)}
                    placeholder="Nom ou identifiant AIME"
                    className="mt-3 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      value={montantEnvoi}
                      onChange={(e) => setMontantEnvoi(e.target.value)}
                      placeholder="Montant €"
                      inputMode="decimal"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                    />
                    <button onClick={envoyer} className="shrink-0 rounded-xl bg-event-gradient px-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:brightness-110">
                      Envoyer
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-white/35">Instantané, sans frais, sans quitter AIME.</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <p className="border-b border-white/10 bg-[#0a0a0c] px-5 py-4 font-display text-sm font-extrabold tracking-tight">Historique</p>
                <div className="divide-y divide-white/[0.07]">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 bg-[#09090b] px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold">{t.libelle}</p>
                        <p className="text-[11px] text-white/35">{t.date}</p>
                      </div>
                      <span className={`shrink-0 font-display text-sm font-extrabold tabular-nums ${t.montant > 0 ? "text-emerald-400" : "text-white/75"}`}>
                        {t.montant > 0 ? "+" : ""}{t.montant.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                  ))}
                </div>
                <button className="flex w-full items-center justify-center gap-2 bg-[#0a0a0c] px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50 transition hover:text-white">
                  <Download className="h-3.5 w-3.5" /> Exporter le relevé (depuis l'onglet Documents)
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-10 flex items-center gap-2 text-[11px] text-white/30">
          <User className="h-3.5 w-3.5" />
          Un seul espace pour participer, organiser, aider et créer — billets, messages, documents, visuels et paiements vivent ici.
        </p>
      </div>
    </div>
  );
}
