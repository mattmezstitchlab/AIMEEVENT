import { useMemo, useState } from "react";
import {
  Check,
  Download,
  Plus,
  Search,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { UNIVERS_PAR_ID } from "../data/annee";
import { incrementerCreation, useEspaceStore, validerCheckinBenevole } from "../hooks/useEspaceStore";
import { exporterEmargementCsv, type ParticipantInscrit } from "../utils/billetCanvas";
import KitsVisuels from "./KitsVisuels";
import Messagerie from "./Messagerie";

const INSCRITS_PAR_DEFAUT: ParticipantInscrit[] = [
  {
    id: "p1",
    nom: "Camille Ravier",
    aimeId: "AIME-2027-4821-KM",
    places: 1,
    modeAcces: "Pass Saison",
    cercleSolo: true,
    besoinSpecifique: "Table Cercle Solo (-20 min)",
    present: true,
  },
  {
    id: "p2",
    nom: "Nadia Khelifi & Samira",
    aimeId: "AIME-2027-1904-NK",
    places: 2,
    modeAcces: "Duo · AIME Wallet",
    cercleSolo: false,
    besoinSpecifique: "Sans arachide",
    present: true,
  },
  {
    id: "p3",
    nom: "Jean-Claude Moreau",
    aimeId: "AIME-2027-0388-JM",
    places: 1,
    modeAcces: "Entrée libre",
    cercleSolo: true,
    besoinSpecifique: "Place assise proche sortie",
    present: true,
  },
  {
    id: "p4",
    nom: "Lucas & Chloé Garnier",
    aimeId: "AIME-2027-7712-LG",
    places: 3,
    modeAcces: "Tribu Famille",
    cercleSolo: false,
    besoinSpecifique: "Accès poussette",
    present: false,
  },
  {
    id: "p5",
    nom: "Driss Benali",
    aimeId: "AIME-2027-5520-DB",
    places: 1,
    modeAcces: "Banque du Temps (4 h)",
    cercleSolo: false,
    besoinSpecifique: "Bénévole référent accueil",
    present: true,
  },
  {
    id: "p6",
    nom: "Éléonore Vance",
    aimeId: "AIME-2027-9103-EV",
    places: 1,
    modeAcces: "Place Solidaire",
    cercleSolo: true,
    besoinSpecifique: "Sensibilité sonore (casque)",
    present: false,
  },
  {
    id: "p7",
    nom: "Sami Bouzid",
    aimeId: "AIME-2027-6491-SB",
    places: 2,
    modeAcces: "Billet unitaire",
    cercleSolo: false,
    besoinSpecifique: "Aucun",
    present: false,
  },
];

export default function CockpitOrganisateur({
  onGoCreer,
}: {
  onGoCreer: () => void;
  onGoVisuels?: () => void;
  onGoDocuments?: () => void;
  onGoMessages?: () => void;
}) {
  const { propositions, tousLesEvenements } = useEspaceStore();

  const evenementsPilotes = useMemo(() => {
    const idsParDefaut = ["01", "07", "28"];
    const base = tousLesEvenements.filter(
      (x) =>
        idsParDefaut.includes(x.event.id) ||
        propositions.some((p) => p.event.id === x.event.id),
    );
    return base.length > 0 ? base : tousLesEvenements.slice(0, 3);
  }, [tousLesEvenements, propositions]);

  const [selectedEventId, setSelectedEventId] = useState<string>(
    evenementsPilotes[0]?.event.id ?? "01",
  );
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<
    "tous" | "presents" | "attendus" | "solo"
  >("tous");
  const [parEventInscrits, setParEventInscrits] = useState<
    Record<string, ParticipantInscrit[]>
  >({});
  const [nouvelInvite, setNouvelInvite] = useState("");
  const [nouvelInviteBesoin, setNouvelInviteBesoin] = useState("");

  const cible =
    evenementsPilotes.find((x) => x.event.id === selectedEventId) ??
    evenementsPilotes[0] ??
    tousLesEvenements[0];
  const event = cible.event;
  const mois = cible.mois;

  const inscrits = parEventInscrits[event.id] ?? INSCRITS_PAR_DEFAUT;

  const basculerPresence = (participantId: string) => {
    const next = inscrits.map((p) => {
      if (p.id !== participantId) return p;
      const nouveauPresent = !p.present;
      if (nouveauPresent) validerCheckinBenevole(p.aimeId);
      return {
        ...p,
        present: nouveauPresent,
      };
    });
    setParEventInscrits({
      ...parEventInscrits,
      [event.id]: next,
    });
  };

  const ajouterInviteListe = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = nouvelInvite.trim();
    if (!nom) return;
    const nouveau: ParticipantInscrit = {
      id: `inv-${Date.now()}`,
      nom,
      aimeId: `AIME-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      places: 1,
      modeAcces: "Accréditation Organisateur",
      cercleSolo: false,
      besoinSpecifique: nouvelInviteBesoin.trim() || "Invité·e",
      present: true,
    };
    setParEventInscrits({
      ...parEventInscrits,
      [event.id]: [nouveau, ...inscrits],
    });
    setNouvelInvite("");
    setNouvelInviteBesoin("");
  };

  const inscritsFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return inscrits.filter((p) => {
      if (filtreStatut === "presents" && !p.present) return false;
      if (filtreStatut === "attendus" && p.present) return false;
      if (filtreStatut === "solo" && !p.cercleSolo) return false;
      if (!q) return true;
      return `${p.nom} ${p.aimeId} ${p.modeAcces} ${p.besoinSpecifique}`
        .toLowerCase()
        .includes(q);
    });
  }, [inscrits, recherche, filtreStatut]);

  const placesPrises =
    event.places - event.restantes + (inscrits.length - INSCRITS_PAR_DEFAUT.length);
  const tauxRemplissage = Math.min(
    100,
    Math.round((placesPrises / Math.max(1, event.places)) * 100),
  );
  const recetteNette = placesPrises * event.prix;
  const nbPresents = inscrits.filter((p) => p.present).length;
  const nbSolo = inscrits.filter((p) => p.cercleSolo).length;

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════════════════════
          1. VOS ÉVÉNEMENTS ORGANISÉS SOUS FORME DE VRAIS TICKETS BLANCS CLIQUABLES
         ══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold text-white">
              Vos rendez-vous organisés ({evenementsPilotes.length})
            </p>
            <p className="text-[12px] text-white/45">
              Cliquez sur un ticket pour afficher ses 3 visuels prêts à diffuser, son émargement et sa messagerie
            </p>
          </div>

          <button
            onClick={onGoCreer}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-white/90"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau RDV
          </button>
        </div>

        {/* Grille de Tickets Blancs Carrés cliquables */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evenementsPilotes.map(({ event: e, mois: m }) => {
            const isSelected = e.id === event.id;
            const u = UNIVERS_PAR_ID[e.univers];
            const inscritsEvt = parEventInscrits[e.id] ?? INSCRITS_PAR_DEFAUT;
            const presentsEvt = inscritsEvt.filter((p) => p.present).length;
            const jaugeEvt =
              e.places - e.restantes + (inscritsEvt.length - INSCRITS_PAR_DEFAUT.length);
            const ratioEvt = Math.min(
              100,
              Math.round((jaugeEvt / Math.max(1, e.places)) * 100),
            );

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedEventId(e.id)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white text-left text-[#0a0a0c] transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-white ring-offset-4 ring-offset-black"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                {/* Filet supérieur Aurore */}
                <div className="h-[4px] w-full shrink-0 bg-event-gradient" />

                {/* Corps du Ticket */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a0a0c]/45">
                        AIME EVENT · #{e.id}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-2.5 py-0.5 text-[10px] font-bold text-black">
                          <Check className="h-3 w-3" /> Ouvert
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-display text-[13px] font-bold text-[#0a0a0c]">
                      {e.jour} {m.nom} · {e.heure}
                    </p>

                    <h3 className="mt-0.5 line-clamp-2 font-display text-[19px] font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c]">
                      {e.nom}
                    </h3>

                    <p className="mt-1 truncate text-[12px] font-medium text-[#0a0a0c]/65">
                      {e.format} · {u.nom}
                    </p>
                  </div>

                  {/* Barre de jauge sur le ticket */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-[#0a0a0c]/50">
                      <span>
                        Inscrits : {jaugeEvt}/{e.places} ({ratioEvt}%)
                      </span>
                      <span>Pointés : {presentsEvt}</span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full bg-event-gradient"
                        style={{ width: `${ratioEvt}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Découpe perforée */}
                <div className="relative flex items-center" aria-hidden="true">
                  <span className="-ml-[1px] h-5 w-2.5 shrink-0 rounded-r-full bg-black" />
                  <div className="mx-2 flex-1 border-t border-dashed border-black/20" />
                  <span className="-mr-[1px] h-5 w-2.5 shrink-0 rounded-l-full bg-black" />
                </div>

                {/* Talon du Ticket */}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="font-mono text-[10px] font-bold text-[#0a0a0c]/50">
                    {e.prix === 0 ? "ENTRÉE LIBRE" : `${e.prix} € · 0 % FRAIS`}
                  </span>
                  <span
                    className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                      isSelected
                        ? "bg-[#0a0a0c] text-white"
                        : "bg-black/[0.06] text-[#0a0a0c]"
                    }`}
                  >
                    {isSelected ? "Pilotage actif" : "Ouvrir ce ticket →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. KIT VISUEL AUTOMATIQUE DE CE TICKET (STORY 9:16 + CARRÉ 1:1 + BANDEAU 16:9)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-[28px] border border-white/12 bg-white/[0.02] p-5 sm:p-6">
        <KitsVisuels eventId={event.id} onExport={incrementerCreation} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. ÉMARGEMENT & INSCRITS DE CE TICKET (.CSV)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="apple-card overflow-hidden rounded-[26px]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold tracking-[-0.015em] text-white">
              Émargement — {event.nom}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-white/55">
              <span>
                Jauge :{" "}
                <strong className="text-white">
                  {placesPrises}/{event.places}
                </strong>{" "}
                ({tauxRemplissage}%)
              </span>
              <span>
                Présents :{" "}
                <strong className="text-emerald-400">
                  {nbPresents}/{inscrits.length}
                </strong>
              </span>
              <span>
                Recette :{" "}
                <strong className="text-white">
                  {event.prix === 0
                    ? "Entrée libre"
                    : `${recetteNette.toLocaleString("fr-FR")} €`}
                </strong>{" "}
                <span className="text-white/35">(0 % frais)</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => exporterEmargementCsv(event.nom, inscrits)}
            title="Exporter la liste (.CSV)"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90"
          >
            <Download className="h-3.5 w-3.5" /> Exporter (.CSV)
          </button>
        </div>

        {/* Recherche & Filtres */}
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un participant…"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="apple-segment flex flex-wrap items-center gap-1 rounded-full p-1">
            {(
              [
                { id: "tous", l: `Tous (${inscrits.length})` },
                { id: "presents", l: `Présents (${nbPresents})` },
                { id: "attendus", l: `Attendus (${inscrits.length - nbPresents})` },
                { id: "solo", l: `Solo (${nbSolo})` },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltreStatut(f.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  filtreStatut === f.id
                    ? "apple-pill-active"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Lignes des participants */}
        <div className="divide-y divide-white/[0.06]">
          {inscritsFiltres.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-semibold text-white">{p.nom}</p>
                  <span className="text-[11.5px] text-white/45">
                    · {p.places} pl. · {p.modeAcces}
                  </span>
                  {p.cercleSolo && (
                    <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/75">
                      Solo
                    </span>
                  )}
                </div>
                {p.besoinSpecifique && p.besoinSpecifique !== "Aucun" && (
                  <p className="mt-0.5 text-[11.5px] text-white/45">{p.besoinSpecifique}</p>
                )}
              </div>

              <button
                onClick={() => basculerPresence(p.id)}
                title={p.present ? "Présent·e" : "Pointer l'entrée"}
                className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${
                  p.present
                    ? "bg-emerald-400 text-black shadow-sm"
                    : "border border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/15 hover:text-white"
                }`}
              >
                {p.present ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Présent
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" /> Pointer
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Ajout d'accréditation épuré */}
        <form
          onSubmit={ajouterInviteListe}
          className="flex flex-col gap-2 border-t border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row"
        >
          <input
            value={nouvelInvite}
            onChange={(e) => setNouvelInvite(e.target.value)}
            placeholder="Ajouter un·e invité·e…"
            className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
          />
          <input
            value={nouvelInviteBesoin}
            onChange={(e) => setNouvelInviteBesoin(e.target.value)}
            placeholder="Note (PMR, Intervenant…)"
            className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!nouvelInvite.trim()}
            title="Accréditer"
            aria-label="Accréditer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black transition enabled:hover:bg-white/90 disabled:opacity-35"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. MESSAGERIE DÉDIÉE DE CE TICKET (INSCRITS & BÉNÉVOLES DE L'ÉVÉNEMENT)
         ══════════════════════════════════════════════════════════════════ */}
      <Messagerie
        eventContext={{
          id: event.id,
          nom: event.nom,
          jour: `${event.jour} ${mois.nom.toLowerCase()}`,
          heure: event.heure,
          lieu: event.format,
        }}
      />
    </div>
  );
}
