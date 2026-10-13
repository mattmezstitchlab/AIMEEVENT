import { useMemo, useState } from "react";
import { Check, Clock, Lightbulb, MapPin, Plus, Sparkles, Users, Zap } from "lucide-react";
import { Reveal } from "./Reveal";
import { CALENDRIER, PROFILS, UNIVERS_PAR_ID } from "../data/annee";
import { MISSIONS } from "../data/espace";
import {
  CATEGORIES_EVENEMENT,
  FORMATS_EVENEMENT,
  MODES_PARTICIPATION,
  NIVEAUX_ACCES,
  OBJECTIFS_EVENEMENT,
  PROFILS_ORGANISATEUR,
  categorieParId,
} from "../data/taxonomie";

/* ————— Les 2 innovations qui n'existent nulle part ailleurs :
   1. N'importe qui propose un rendez-vous (Fever ne le permet pas)
   2. Matching de missions selon votre rôle et vos compétences (Golden, mais pour un événement) ————— */

const COMPETENCES = ["Animation", "Technique", "Cuisine", "Photo", "Lecture", "Orientation", "Danse", "Accompagnement"];

export default function Creer() {
  const [categorie, setCategorie] = useState(CATEGORIES_EVENEMENT[0].id);
  const [organisateur, setOrganisateur] = useState(PROFILS_ORGANISATEUR[0]);
  const [mode, setMode] = useState(MODES_PARTICIPATION[0]);
  const [acces, setAcces] = useState(NIVEAUX_ACCES[0]);
  const [objectif, setObjectif] = useState(OBJECTIFS_EVENEMENT[0]);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [jour, setJour] = useState(CALENDRIER[0].nom);
  const [heure, setHeure] = useState("14 h");
  const [format, setFormat] = useState<string>(FORMATS_EVENEMENT[4]);
  const [publics, setPublics] = useState<string[]>(["famille"]);
  const [gratuit, setGratuit] = useState(true);
  const [prix, setPrix] = useState("12");
  const [envoye, setEnvoye] = useState(false);

  /* Matching de missions : rôle + compétences sélectionnées */
  const [mesCompetences, setMesCompetences] = useState<string[]>(["Orientation"]);
  const suggestions = useMemo(() => {
    const score = MISSIONS.map((m) => ({
      m,
      score: m.competences.reduce((s, c) => s + (mesCompetences.includes(c) ? 2 : 0), 0)
        + (m.prises < m.places ? 1 : 0),
    }));
    return score.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [mesCompetences]);

  const togglePublic = (p: string) =>
    setPublics((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const toggleCompetence = (c: string) =>
    setMesCompetences((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const valide = nom.trim().length > 2 && description.trim().length > 10 && publics.length > 0;

  if (envoye) {
    return (
      <div className="rounded-3xl border border-white/12 bg-[#09090b] p-8 text-center md:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-event-gradient">
          <Check className="h-7 w-7" strokeWidth={3} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight md:text-3xl">Proposition envoyée.</h2>
        <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/55">
          Votre rendez-vous <strong className="text-white">{nom}</strong> est en file de modération.
          Vous suivez son statut dans vos Documents — et si vous l'organisez,
          l'attestation d'organisateur·rice se génère automatiquement.
        </p>
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Ce qui se passe ensuite</p>
          <ol className="mt-3 space-y-2 text-[13px] text-white/60">
            <li className="flex gap-2.5"><span className="text-white/30">01</span> Modération sous 48 h — charte des publics et accessibilité.</li>
            <li className="flex gap-2.5"><span className="text-white/30">02</span> Publication dans le mois choisi, avec votre nom en passeur·se.</li>
            <li className="flex gap-2.5"><span className="text-white/30">03</span> Vous recevez les demandes dans votre messagerie AIME, au même endroit.</li>
          </ol>
        </div>
        <button onClick={() => { setEnvoye(false); setNom(""); setDescription(""); }} className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/50">
          Proposer un autre rendez-vous
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#ff9c2e]/25 bg-[#ff9c2e]/[0.06] p-5">
        <p className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight">
          <Lightbulb className="h-4 w-4 text-[#ff9c2e]" /> Aucune autre plateforme ne le permet
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/60">
          Sur les plateformes fermées, il faut être partenaire pour publier un événement.
          Ici, toute personne de l'espace peut proposer un rendez-vous : vous devenez passeur·se, pas client.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Le rendez-vous */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#09090b] p-6">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Votre rendez-vous</p>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Nom</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Initiation au tour de poterie"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none" />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Ce qu'on y fait</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Décrivez l'expérience en une phrase claire, pour tous les âges."
              className="mt-1.5 w-full resize-none rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none" />
          </label>

          {/* Catégorie et profil organisateur sont deux axes distincts :
              un cinéma peut organiser un atelier, une école un spectacle, une famille un tournoi. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Catégorie · ce que c'est</span>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {CATEGORIES_EVENEMENT.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <span className="mt-1 block text-[10.5px] text-white/30">Ex. {categorieParId(categorie).exemples.slice(0, 3).join(", ")}</span>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Qui programme</span>
              <select value={organisateur} onChange={(e) => setOrganisateur(e.target.value as typeof organisateur)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {PROFILS_ORGANISATEUR.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Mois</span>
              <select value={jour} onChange={(e) => setJour(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {CALENDRIER.map((m) => <option key={m.id} value={m.nom}>{m.nom} 2027</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Heure</span>
              <input value={heure} onChange={(e) => setHeure(e.target.value)} placeholder="14 h"
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {FORMATS_EVENEMENT.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Participation</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {MODES_PARTICIPATION.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Accès</span>
              <select value={acces} onChange={(e) => setAcces(e.target.value as typeof acces)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {NIVEAUX_ACCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Objectif</span>
              <select value={objectif} onChange={(e) => setObjectif(e.target.value as typeof objectif)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none">
                {OBJECTIFS_EVENEMENT.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Pour qui</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PROFILS.map((p) => (
                <button key={p.id} onClick={() => togglePublic(p.id)} aria-pressed={publics.includes(p.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.11em] transition ${publics.includes(p.id) ? "bg-event-gradient text-white" : "border border-white/15 text-white/50 hover:border-white/40 hover:text-white"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
            <span className="text-[12px] font-semibold text-white/60">Rendez-vous gratuit</span>
            <button onClick={() => setGratuit(!gratuit)} role="switch" aria-checked={gratuit}
              className={`relative h-6 w-11 rounded-full transition ${gratuit ? "bg-emerald-400" : "bg-white/20"}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${gratuit ? "left-6" : "left-1"}`} />
            </button>
          </div>

          {!gratuit && (
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Prix par personne (€)</span>
              <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="numeric"
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none" />
              <span className="mt-1.5 block text-[11px] text-white/35">0 € de frais de service. Le montant vous est versé en intégralité.</span>
            </label>
          )}

          <button onClick={() => valide && setEnvoye(true)} disabled={!valide}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient py-4 text-[12px] font-extrabold uppercase tracking-[0.14em] text-white transition enabled:hover:brightness-110 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
            <Sparkles className="h-4 w-4" /> Proposer ce rendez-vous
          </button>
          {!valide && <p className="text-[11px] text-white/35">Nom, description et au moins un public sont nécessaires.</p>}
        </div>

        {/* Matching de missions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">
              <Zap className="h-3.5 w-3.5 text-[#ff9c2e]" /> Missions suggérées pour vous
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
              Indiquez vos compétences : le système vous propose les missions qui collent vraiment.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {COMPETENCES.map((c) => (
                <button key={c} onClick={() => toggleCompetence(c)} aria-pressed={mesCompetences.includes(c)}
                  className={`rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.11em] transition ${mesCompetences.includes(c) ? "bg-white text-black" : "border border-white/15 text-white/50 hover:border-white/40 hover:text-white"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {suggestions.map(({ m, score }) => (
                <div key={m.id} className={`rounded-xl border p-3.5 transition ${score >= 3 ? "border-white/25 bg-white/[0.04]" : "border-white/10"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-[13.5px] font-bold tracking-tight">{m.titre}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                        <Clock className="h-3 w-3" /> {m.quand}
                        <span className="text-white/20">·</span>
                        <MapPin className="h-3 w-3" /> {m.lieu}
                      </p>
                    </div>
                    {score >= 3 && <span className="shrink-0 rounded-full bg-emerald-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-black">Match</span>}
                  </div>
                  <p className="mt-1.5 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.11em] text-white/35">
                    <Users className="h-3 w-3" /> {m.prises}/{m.places} · +{m.points} pts · {UNIVERS_PAR_ID[m.univers].nom}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#09090b] p-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">Aperçu</p>
            <div className="mt-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#ff9c2e]/15 via-[#ff4e6b]/10 to-[#b86bd7]/15 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                {jour} 2027 · {categorieParId(categorie).nom}
              </p>
              <p className="mt-2 font-display text-xl font-extrabold leading-tight tracking-tight">{nom || "Votre rendez-vous"}</p>
              <p className="mt-1 text-[12px] text-white/60">{heure} · {format} · {mode} · {gratuit ? "Gratuit" : `${prix} €`}</p>
              <p className="mt-1 text-[10.5px] uppercase tracking-[0.11em] text-white/40">{organisateur} · {acces} · objectif : {objectif}</p>
              {description && <p className="mt-3 text-[12.5px] leading-relaxed text-white/60">{description}</p>}
            </div>
          </div>
        </div>
      </div>

      <Reveal delay={60}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/30">
          <Plus className="h-3.5 w-3.5" />
          Un rendez-vous proposé par un membre de l'espace = un tampon Passeur sur votre passeport, et +30 points.
        </div>
      </Reveal>
    </div>
  );
}
