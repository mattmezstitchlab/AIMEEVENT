import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  ImagePlus,
} from "lucide-react";
import { CALENDRIER, PROFILS, type PublicId } from "../data/annee";
import {
  CATEGORIES_EVENEMENT,
  FORMATS_EVENEMENT,
  MODES_PARTICIPATION,
  NIVEAUX_ACCES,
  OBJECTIFS_EVENEMENT,
  PROFILS_ORGANISATEUR,
  categorieParId,
} from "../data/taxonomie";
import {
  publierProposition,
  useEspaceStore,
  type PropositionEvenement,
} from "../hooks/useEspaceStore";

export default function Creer({
  onNavigateTab,
  onOpenMonth,
}: {
  onNavigateTab?: (tab: string) => void;
  onOpenMonth?: (moisId: string) => void;
}) {
  const { propositions } = useEspaceStore();

  const [categorie, setCategorie] = useState(CATEGORIES_EVENEMENT[0].id);
  const [organisateur, setOrganisateur] = useState<string>(PROFILS_ORGANISATEUR[0]);
  const [mode, setMode] = useState<string>(MODES_PARTICIPATION[0]);
  const [acces, setAcces] = useState<string>(NIVEAUX_ACCES[0]);
  const [objectif, setObjectif] = useState<string>(OBJECTIFS_EVENEMENT[0]);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [jour, setJour] = useState(CALENDRIER[2].nom);
  const [heure, setHeure] = useState("14 h");
  const [format, setFormat] = useState<string>(FORMATS_EVENEMENT[4]);
  const [publics, setPublics] = useState<PublicId[]>(["famille"]);
  const [gratuit, setGratuit] = useState(true);
  const [prix, setPrix] = useState("12");
  const [derniereProp, setDerniereProp] = useState<PropositionEvenement | null>(null);

  const togglePublic = (p: PublicId) =>
    setPublics((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const valide = nom.trim().length > 2 && description.trim().length > 10 && publics.length > 0;

  const soumettre = () => {
    if (!valide) return;
    const cree = publierProposition({
      nom,
      description,
      moisNom: jour,
      heure,
      format,
      categorieId: categorie,
      organisateur,
      mode,
      acces,
      objectif,
      publics,
      prix: gratuit ? 0 : Math.max(0, parseInt(prix, 10) || 0),
    });
    setDerniereProp(cree);
  };

  if (derniereProp) {
    return (
      <div className="apple-card rounded-[28px] p-8 text-center md:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">
          Rendez-vous publié
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/55">
          <strong className="text-white">{derniereProp.event.nom}</strong> rejoint le calendrier de{" "}
          <strong className="text-white">{jour} 2027</strong>.
        </p>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
          {onOpenMonth && (
            <button
              onClick={() => onOpenMonth(derniereProp.moisId)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              Voir en {jour} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab("creations")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-xs font-medium text-white transition hover:bg-white/15"
              >
                <ImagePlus className="h-3.5 w-3.5" /> Affiche
              </button>
              <button
                onClick={() => onNavigateTab("documents")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-xs font-medium text-white transition hover:bg-white/15"
              >
                <FileText className="h-3.5 w-3.5" /> Attestation
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setDerniereProp(null);
            setNom("");
            setDescription("");
          }}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-white"
        >
          + Nouveau rendez-vous
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Vos propositions déjà publiées */}
      {propositions.length > 0 && (
        <div className="apple-card rounded-2xl p-5">
          <p className="text-xs font-medium text-white/50">
            Vos rendez-vous publiés ({propositions.length})
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {propositions.map((p) => (
              <div
                key={p.event.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-white">{p.event.nom}</p>
                  <p className="text-[11px] text-white/45">
                    {p.organisateur} · {p.event.heure} ·{" "}
                    {p.event.prix === 0 ? "Libre" : `${p.event.prix} €`}
                  </p>
                </div>
                {onOpenMonth && (
                  <button
                    onClick={() => onOpenMonth(p.moisId)}
                    className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white transition hover:bg-white hover:text-black"
                  >
                    Ouvrir
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* Le rendez-vous */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#09090b] p-6">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/40">
            Votre rendez-vous
          </p>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
              Nom
            </span>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex. Initiation au tour de poterie"
              className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
              Ce qu'on y fait
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez l'expérience en une phrase claire, pour tous les âges."
              className="mt-1.5 w-full resize-none rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Catégorie · ce que c'est
              </span>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {CATEGORIES_EVENEMENT.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[10.5px] text-white/30">
                Ex. {categorieParId(categorie).exemples.slice(0, 3).join(", ")}
              </span>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Qui programme
              </span>
              <select
                value={organisateur}
                onChange={(e) => setOrganisateur(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {PROFILS_ORGANISATEUR.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Mois
              </span>
              <select
                value={jour}
                onChange={(e) => setJour(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {CALENDRIER.map((m) => (
                  <option key={m.id} value={m.nom}>
                    {m.nom} 2027
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Heure
              </span>
              <input
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                placeholder="14 h"
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Format
              </span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {FORMATS_EVENEMENT.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Participation
              </span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {MODES_PARTICIPATION.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Accès
              </span>
              <select
                value={acces}
                onChange={(e) => setAcces(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {NIVEAUX_ACCES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                Objectif
              </span>
              <select
                value={objectif}
                onChange={(e) => setObjectif(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-3 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
              >
                {OBJECTIFS_EVENEMENT.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-[11px] font-medium text-white/45">Publics</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PROFILS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePublic(p.id)}
                  aria-pressed={publics.includes(p.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    publics.includes(p.id)
                      ? "bg-white text-black font-semibold"
                      : "border border-white/12 bg-white/[0.04] text-white/55 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
            <span className="text-xs font-medium text-white/65">Rendez-vous gratuit</span>
            <button
              type="button"
              onClick={() => setGratuit(!gratuit)}
              role="switch"
              aria-checked={gratuit}
              className={`relative h-6 w-11 rounded-full transition ${
                gratuit ? "bg-white" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full transition-all ${
                  gratuit ? "left-6 bg-black" : "left-1 bg-white"
                }`}
              />
            </button>
          </div>

          {!gratuit && (
            <label className="block">
              <span className="text-[11px] font-medium text-white/45">Prix par personne (€)</span>
              <input
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                inputMode="numeric"
                className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-white/35 focus:outline-none"
              />
            </label>
          )}

          <button
            type="button"
            onClick={soumettre}
            disabled={!valide}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-xs font-semibold text-black transition enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Publier dans le calendrier
          </button>
        </div>

        {/* Aperçu sobre en direct */}
        <div className="apple-card h-fit rounded-[26px] p-6">
          <p className="text-xs font-medium text-white/45">Aperçu</p>
          <div className="mt-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5">
            <p className="text-xs font-medium text-white/55">
              {jour} 2027 · {categorieParId(categorie).nom}
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-tight text-white">
              {nom || "Votre rendez-vous"}
            </p>
            <p className="mt-1.5 text-xs font-medium text-white/70">
              {heure} · {format} · {gratuit ? "Entrée libre" : `${prix} €`}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {organisateur} · {acces}
            </p>
            {description && (
              <p className="mt-3 text-xs leading-relaxed text-white/60">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
