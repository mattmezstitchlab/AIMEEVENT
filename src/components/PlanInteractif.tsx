import { useState } from "react";
import {
  Accessibility,
  Check,
  Droplets,
  HeartHandshake,
  MapPin,
  Radio,
  Shield,
  Sun,
  Users,
  Volume2,
} from "lucide-react";
import { declencherAlerteSafeTeam } from "../hooks/useEspaceStore";

export interface ZonePlan {
  id: string;
  nom: string;
  code: string;
  x: string;
  y: string;
  activiteEnCours: string;
  db: number;
  bruitNiveau: string;
  lumiere: string;
  affluencePct: number;
  benevolesActifs: number;
  equipements: string[];
  itinerairePmr: string;
  estCalme?: boolean;
  estTotemCercle?: boolean;
}

export const ZONES_PLAN: ZonePlan[] = [
  {
    id: "totem",
    nom: "Entrée · Totem AIME & Cercle Solo",
    code: "Z-01",
    x: "16%",
    y: "74%",
    activiteEnCours: "Point de rencontre Cercle Solo (-20 min) & Accueil",
    db: 56,
    bruitNiveau: "Modéré",
    lumiere: "Douce (2/5)",
    affluencePct: 42,
    benevolesActifs: 4,
    equipements: ["Totem lumineux Cercle Solo", "Bouchons d'oreilles gratuits", "Fontaine à eau", "Rampe PMR"],
    itinerairePmr: "Accès plain-pied direct depuis le parvis — 0 marche.",
    estTotemCercle: true,
  },
  {
    id: "grande-salle",
    nom: "Grande Salle · Scène & Forums",
    code: "Z-02",
    x: "48%",
    y: "34%",
    activiteEnCours: "Le Sommet · Rencontres & Performances",
    db: 78,
    bruitNiveau: "Élevé",
    lumiere: "Scénique (4/5)",
    affluencePct: 74,
    benevolesActifs: 6,
    equipements: ["Boucle inductive", "Plateforme PMR surélevée", "Safe Team en veille", "Gilets vibrants"],
    itinerairePmr: "Couloir central large (2,4 m) depuis l'Entrée, ascenseur prioritaire à gauche.",
  },
  {
    id: "salle-calme",
    nom: "Salle Calme · Refuge Sensoriel (Bât. B)",
    code: "Z-03",
    x: "82%",
    y: "26%",
    activiteEnCours: "Espace silence, décompression & écoute Safe Team",
    db: 34,
    bruitNiveau: "Silence",
    lumiere: "Tamisée (1/5)",
    affluencePct: 18,
    benevolesActifs: 2,
    equipements: ["Casques anti-bruit", "Fauteuils profonds", "Eau & tisanes", "Présence Safe Team"],
    itinerairePmr: "Accès direct et isolé par la galerie Est — portes automatiques.",
    estCalme: true,
  },
  {
    id: "tablees",
    nom: "Cuisine Collective & Grandes Tablées",
    code: "Z-04",
    x: "76%",
    y: "68%",
    activiteEnCours: "Grandes tablées & Atelier Sel",
    db: 65,
    bruitNiveau: "Animé",
    lumiere: "Chaude (2/5)",
    affluencePct: 62,
    benevolesActifs: 5,
    equipements: ["Affichage allergènes complet", "Tables hauteur PMR", "Fontaine d'eau filtrée"],
    itinerairePmr: "Allée plane depuis le Totem AIME (45 mètres).",
  },
  {
    id: "familles",
    nom: "Espace Familles & Kids Lab",
    code: "Z-05",
    x: "22%",
    y: "30%",
    activiteEnCours: "Kids Lab & Village des jeux (0–12 ans)",
    db: 61,
    bruitNiveau: "Modéré",
    lumiere: "Naturelle (2/5)",
    affluencePct: 50,
    benevolesActifs: 4,
    equipements: ["Parking poussettes", "Espace allaitement & calme", "Jeux sensoriels"],
    itinerairePmr: "À gauche immédiatement après l'accueil principal.",
  },
  {
    id: "salon-voix",
    nom: "Salon de Lecture & Ciné-Débat",
    code: "Z-06",
    x: "48%",
    y: "76%",
    activiteEnCours: "Lecture à voix haute & Projections sous-titrées",
    db: 46,
    bruitNiveau: "Bas",
    lumiere: "Tamisée (1/5)",
    affluencePct: 35,
    benevolesActifs: 2,
    equipements: ["100 % Places assises", "Sous-titrage SME en direct", "Boucle magnétique"],
    itinerairePmr: "Entrée sud de plain-pied, 12 emplacements fauteuils réservés.",
  },
];

export default function PlanInteractif({
  onOpenMessages,
}: {
  onOpenMessages?: () => void;
}) {
  const [zoneId, setZoneId] = useState<string>("totem");
  const [alerteZone, setAlerteZone] = useState<string | null>(null);

  const active = ZONES_PLAN.find((z) => z.id === zoneId) ?? ZONES_PLAN[0];

  const appelerSafeTeamIci = () => {
    declencherAlerteSafeTeam(active.nom, "Assistance sur le plan interactif");
    setAlerteZone(active.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      {/* Carte architecturale interactive */}
      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/12 bg-[#070709] p-5">
        {/* Grille architecturale subtile */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium text-white/60">
            <Radio className="h-3.5 w-3.5 text-white/75" /> 6 zones & capteurs sensoriels
          </span>
        </div>

        {/* Tracés de liaison PMR entre les salles */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 16 74 L 48 34 L 82 26 M 16 74 L 48 76 L 76 68 M 16 74 L 22 30"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.6"
            strokeDasharray="2 2"
            fill="none"
          />
        </svg>

        {/* Points interactifs des 6 espaces */}
        <div className="relative mt-4 h-[250px] w-full">
          {ZONES_PLAN.map((z) => {
            const isSel = z.id === active.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  setZoneId(z.id);
                  setAlerteZone(null);
                }}
                style={{ left: z.x, top: z.y }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-left backdrop-blur-xl transition-all duration-300 ${
                  isSel
                    ? "z-20 scale-105 border-white bg-white text-black shadow-xl"
                    : "border-white/15 bg-black/75 text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSel ? "bg-black" : "bg-white/65"
                    }`}
                  />
                  <span className="font-display text-[10px] font-bold">
                    {z.code}
                  </span>
                  <span className="text-[9.5px] opacity-65">{z.db} dB</span>
                </div>
                <p className="mt-0.5 max-w-[130px] truncate font-display text-[11px] font-semibold">
                  {z.nom.split("·")[0]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Légende bas de carte */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10.5px] text-white/45">
          <span>Refuge calme (34 dB)</span>
          <span>Totem Cercle Solo</span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-white/60" /> Eau libre
          </span>
        </div>
      </div>

      {/* Fiche télémétrie de la zone sélectionnée */}
      <div className="apple-card flex flex-col justify-between rounded-[24px] p-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[10.5px] font-medium text-white/70">
              Zone {active.code}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
              <Users className="h-3.5 w-3.5" /> {active.benevolesActifs} bénévoles
            </span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-white">
            {active.nom}
          </h3>
          <p className="mt-1 text-xs text-white/55">{active.activiteEnCours}</p>

          {/* Indicateurs sensoriels temps réel */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-medium text-white/45">
                <Volume2 className="h-3 w-3 text-white/65" /> Son
              </p>
              <p className="mt-1 font-display text-sm font-bold text-white">{active.db} dB</p>
              <p className="text-[10px] text-white/45">{active.bruitNiveau}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-medium text-white/45">
                <Sun className="h-3 w-3 text-white/65" /> Lumière
              </p>
              <p className="mt-1 font-display text-sm font-bold text-white">{active.lumiere}</p>
              <p className="text-[10px] text-white/45">Douce</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <p className="flex items-center gap-1 text-[10px] font-medium text-white/45">
                <Users className="h-3 w-3 text-white/65" /> Densité
              </p>
              <p className="mt-1 font-display text-sm font-bold text-white">{active.affluencePct} %</p>
              <p className="text-[10px] text-white/45">Fluide</p>
            </div>
          </div>

          {/* Équipements & PMR */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {active.equipements.map((eq) => (
              <span
                key={eq}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-white/65"
              >
                {eq}
              </span>
            ))}
          </div>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/55">
            <Accessibility className="mt-0.5 h-4 w-4 shrink-0 text-white/75" />
            <span>
              <strong className="text-white/85">PMR :</strong> {active.itinerairePmr}
            </span>
          </p>
        </div>

        {/* Actions directes sur cette zone */}
        <div className="mt-4 border-t border-white/10 pt-3">
          {alerteZone === active.id ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2.5 text-xs text-white">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="h-4 w-4" /> Safe Team prévenue ({active.code})
              </span>
              {onOpenMessages && (
                <button
                  onClick={onOpenMessages}
                  className="underline font-semibold text-white"
                >
                  Chat
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={appelerSafeTeamIci}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
              >
                <Shield className="h-3.5 w-3.5" /> Safe Team
              </button>
              {active.estTotemCercle && onOpenMessages && (
                <button
                  type="button"
                  onClick={onOpenMessages}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/15"
                >
                  <HeartHandshake className="h-3.5 w-3.5" /> Cercle
                </button>
              )}
              {!active.estCalme && (
                <button
                  type="button"
                  onClick={() => setZoneId("salle-calme")}
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/70 transition hover:text-white"
                >
                  <MapPin className="h-3.5 w-3.5" /> Refuge
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
