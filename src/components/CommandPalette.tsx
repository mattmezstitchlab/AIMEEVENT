import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Command,
  CornerDownLeft,
  FileText,
  HeartHandshake,
  ImagePlus,
  Lightbulb,
  Radio,
  Search,
  Ticket,
  Wallet,
  X,
} from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { useEspaceStore } from "../hooks/useEspaceStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenMonth: (id: string) => void;
  onAcces: () => void;
  onEspace?: (tab?: string) => void;
  onReserve?: (event: RendezVous) => void;
  onOpenJourJ?: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  onOpenMonth,
  onAcces,
  onEspace,
  onReserve,
  onOpenJourJ,
}: Props) {
  const { calendrierComplet, tousLesEvenements } = useEspaceStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const resultats = useMemo(() => {
    const q = query.trim().toLowerCase();
    const evenements = tousLesEvenements.map(({ event, mois, communaute }) => ({
      type: "evenement" as const,
      id: event.id,
      titre: event.nom,
      sous: `${mois.nom} · ${UNIVERS_PAR_ID[event.univers]?.nom ?? "Univers"} · ${event.jour} ${event.heure}${communaute ? " · Communauté" : ""}`,
      prix: event.prix,
      event,
      icone: Ticket,
      action: () => onOpenMonth(mois.id),
    }));

    const mois = calendrierComplet.map((m) => ({
      type: "mois" as const,
      id: m.id,
      titre: m.nom,
      sous: m.edition,
      prix: null as number | null,
      event: undefined as RendezVous | undefined,
      icone: Calendar,
      action: () => onOpenMonth(m.id),
    }));

    const raccourcis = [
      ...(onOpenJourJ
        ? [
            {
              type: "action" as const,
              id: "jour-j",
              titre: "Mode Jour J · Billet QR, Météo sensorielle & Safe Team 18+",
              sous: "Compagnon sur place, signalement < 2 min & check-in bénévole",
              prix: null,
              event: undefined,
              icone: Radio,
              action: onOpenJourJ,
            },
          ]
        : []),
      ...(onEspace
        ? [
            {
              type: "action" as const,
              id: "espace-organise",
              titre: "J'organise — Cockpit d'émargement (.CSV) & Jauge en direct",
              sous: "Piloter vos rendez-vous, pointer les entrées et exporter la liste CSV",
              prix: null,
              event: undefined,
              icone: FileText,
              action: () => onEspace("organise"),
            },
            {
              type: "action" as const,
              id: "espace-billets",
              titre: "Je participe — Mes billets QR & Carte Collector Duo (PNG)",
              sous: "Voir vos billets actifs, invitations Duo et cessions solidaires",
              prix: null,
              event: undefined,
              icone: Ticket,
              action: () => onEspace("participe"),
            },
            {
              type: "action" as const,
              id: "espace-creer",
              titre: "Proposer un rendez-vous dans le calendrier",
              sous: "Devenir passeur·se et publier un événement (+30 pts)",
              prix: null,
              event: undefined,
              icone: Lightbulb,
              action: () => onEspace("creer"),
            },
            {
              type: "action" as const,
              id: "espace-cercle",
              titre: "Le Cercle Solo & Passeport sensoriel",
              sous: "Venir seul·e sans l'être, jauges bruit/lumière & place offerte",
              prix: null,
              event: undefined,
              icone: HeartHandshake,
              action: () => onEspace("cercle"),
            },
            {
              type: "action" as const,
              id: "espace-creations",
              titre: "Studio Kits Visuels (Story, Post, Bannière)",
              sous: "Générer une affiche officielle en 10 secondes",
              prix: null,
              event: undefined,
              icone: ImagePlus,
              action: () => onEspace("creations"),
            },
            {
              type: "action" as const,
              id: "espace-documents",
              titre: "Générer une attestation ou facture officielle",
              sous: "Attestation bénévolat, présence, organisateur, convention",
              prix: null,
              event: undefined,
              icone: FileText,
              action: () => onEspace("documents"),
            },
            {
              type: "action" as const,
              id: "espace-wallet",
              titre: "AIME Wallet & Banque du temps",
              sous: "Convertir vos heures de mission en accès ou recharger",
              prix: null,
              event: undefined,
              icone: Wallet,
              action: () => onEspace("portefeuille"),
            },
          ]
        : []),
      {
        type: "action" as const,
        id: "acces",
        titre: "Portefeuille & Pass Saison",
        sous: "Gérer votre solde AIME Wallet et vos Pass",
        prix: null,
        event: undefined,
        icone: Wallet,
        action: () => (onEspace ? onEspace("portefeuille") : onAcces()),
      },
    ];

    const all = [...raccourcis, ...evenements, ...mois];
    if (!q) return [raccourcis[0], raccourcis[1], raccourcis[2], ...evenements.slice(0, 5)].filter(Boolean);
    return all
      .filter((r) => `${r.titre} ${r.sous}`.toLowerCase().includes(q))
      .slice(0, 9);
  }, [query, tousLesEvenements, calendrierComplet, onOpenMonth, onAcces, onEspace, onOpenJourJ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, resultats.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const r = resultats[active];
        if (r) {
          r.action();
          onClose();
        }
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resultats, active, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche rapide"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "heroUp 0.25s ease both" }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Chercher un rendez-vous, un mois, une action (QR, Safe Team, affiche…)"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:bg-white hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {resultats.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-white/40">
              Aucun résultat pour « {query} ».
            </p>
          )}
          {resultats.map((r, i) => {
            const Icon = r.icone;
            return (
              <div
                key={`${r.type}-${r.id}`}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                  i === active ? "bg-white/[0.07]" : ""
                }`}
              >
                <button
                  onClick={() => {
                    r.action();
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-bold tracking-tight">
                      {r.titre}
                    </span>
                    <span className="block truncate text-[11px] text-white/40">{r.sous}</span>
                  </span>
                </button>
                {r.prix !== null && (
                  <span
                    className={`shrink-0 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
                      r.prix === 0 ? "text-emerald-400" : "text-white/50"
                    }`}
                  >
                    {r.prix === 0 ? "Gratuit" : `${r.prix} €`}
                  </span>
                )}
                {r.event && onReserve && (
                  <button
                    onClick={() => {
                      onClose();
                      onReserve(r.event!);
                    }}
                    className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-black transition hover:bg-event-gradient hover:text-white"
                  >
                    {r.event.prix === 0 ? "S'inscrire" : "Réserver"}
                  </button>
                )}
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-white/30" />}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          <span className="flex items-center gap-1.5">
            <Command className="h-3 w-3" /> K pour rouvrir, à tout moment
          </span>
          <span>↑↓ naviguer · ↵ ouvrir · Échap fermer</span>
        </div>
      </div>
    </div>
  );
}
