import { useEffect, useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import {
  envoyerMessageConversation,
  marquerConversationLue,
  useEspaceStore,
} from "../hooks/useEspaceStore";

const MESSAGES_RAPIDES = [
  "J'arrive dans 10 min",
  "Où se retrouve le Cercle Solo ?",
  "Besoin d'un accueil calme / PMR",
];

const MESSAGES_RAPIDES_ORGANISATEUR = [
  "Ouverture des portes dans 15 min",
  "Table Cercle Solo prête à l'accueil",
  "Rappel : événement garanti 0 % frais",
];

export default function Messagerie({
  eventContext,
}: {
  eventContext?: {
    id: string;
    nom: string;
    jour: string;
    heure: string;
    lieu: string;
  };
} = {}) {
  const { conversations } = useEspaceStore();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "c1");
  const [texte, setTexte] = useState("");

  // Messages dédiés par événement organisé (stockés localement par ID d'événement)
  const [messagesParEvent, setMessagesParEvent] = useState<
    Record<
      string,
      { id: string; auteur: string; moi?: boolean; heure: string; texte: string }[]
    >
  >({});

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    if (!eventContext && active && active.nonLus > 0) {
      marquerConversationLue(active.id);
    }
  }, [active, eventContext]);

  // Si on est dans le contexte d'un ticket d'événement dans J'ORGANISE
  if (eventContext) {
    const messagesEvent = messagesParEvent[eventContext.id] ?? [
      {
        id: "m1",
        auteur: "Nadia Khelifi (Inscrite Duo)",
        heure: "14:15",
        texte: `Bonjour ! Est-ce qu'il reste de la place au Cercle Solo (-20 min) pour « ${eventContext.nom} » ?`,
      },
      {
        id: "m2",
        auteur: "Sami B. (Bénévole Accueil)",
        heure: "14:22",
        texte: `Je serai sur place à ${eventContext.lieu} 30 minutes avant (${eventContext.heure}) pour l'accueil et le pointage QR.`,
      },
    ];

    const envoyerEventMsg = (contenu?: string) => {
      const msg = (contenu ?? texte).trim();
      if (!msg) return;
      const d = new Date();
      const heure = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes(),
      ).padStart(2, "0")}`;
      setMessagesParEvent({
        ...messagesParEvent,
        [eventContext.id]: [
          ...messagesEvent,
          { id: `me-${Date.now()}`, auteur: "Vous (Organisateur)", moi: true, heure, texte: msg },
        ],
      });
      if (!contenu) setTexte("");
    };

    return (
      <div className="w-full overflow-hidden rounded-[26px] border border-white/15 bg-[#0b0b0e]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold text-white">
              Messagerie de l'événement — {eventContext.nom}
            </h3>
            <p className="truncate text-[11.5px] text-white/45">
              Participants inscrits & équipe bénévole · {eventContext.jour} · {eventContext.heure}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Salon actif
          </span>
        </div>

        <div className="max-h-[300px] space-y-2.5 overflow-y-auto px-4 py-4 sm:px-5">
          {messagesEvent.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.moi ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.moi
                    ? "bg-white text-[#0a0a0c]"
                    : "border border-white/10 bg-white/[0.05] text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span
                    className={`truncate font-bold ${
                      m.moi ? "text-[#0a0a0c]/55" : "text-white/55"
                    }`}
                  >
                    {m.auteur}
                  </span>
                  <span
                    className={`shrink-0 ${
                      m.moi ? "text-[#0a0a0c]/45" : "text-white/40"
                    }`}
                  >
                    {m.heure}
                  </span>
                </div>
                <p className="mt-1 break-words text-[13px] leading-relaxed">{m.texte}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-white/[0.07] px-4 py-2.5 sm:px-5">
          {MESSAGES_RAPIDES_ORGANISATEUR.map((rapide) => (
            <button
              key={rapide}
              type="button"
              onClick={() => envoyerEventMsg(rapide)}
              className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white hover:text-black"
            >
              {rapide}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            envoyerEventMsg();
          }}
          className="flex items-center gap-2 border-t border-white/10 bg-black/40 p-3 sm:px-4"
        >
          <input
            type="text"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder={`Écrire aux inscrits de « ${eventContext.nom} »…`}
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!texte.trim()}
            aria-label="Envoyer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition enabled:hover:scale-105 disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    );
  }

  const choisirConversation = (id: string) => {
    setActiveId(id);
    marquerConversationLue(id);
  };

  const envoyer = (contenu?: string) => {
    const msg = (contenu ?? texte).trim();
    if (!msg || !active) return;
    envoyerMessageConversation(active.id, msg);
    if (!contenu) setTexte("");
  };

  if (!active) return null;

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/15 bg-[#0b0b0e]">
      {/* ——— 1. BARRE SUPÉRIEURE : SÉLECTEUR DE SALON EN MENU DÉROULANT (ZÉRO DÉBORDEMENT) ——— */}
      <div className="border-b border-white/10 p-4 sm:px-5">
        <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
          Salon de discussion
        </label>
        <div className="relative mt-1.5">
          <select
            value={active.id}
            onChange={(e) => choisirConversation(e.target.value)}
            aria-label="Choisir une conversation"
            className="w-full appearance-none truncate rounded-2xl border border-white/15 bg-white/[0.06] py-2.5 pl-4 pr-10 font-display text-sm font-bold text-white focus:border-white/40 focus:outline-none"
          >
            {conversations.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0b0b0e] text-white">
                {c.nom} — {c.contexte} {c.nonLus > 0 ? `(${c.nonLus} non lu)` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </div>
        <p className="mt-1.5 truncate text-[11.5px] text-white/50">
          {active.contexte} · En direct avec les membres et référents du lieu
        </p>
      </div>

      {/* ——— 2. FIL DES MESSAGES (100% CONTENU DANS LA LARGEUR) ——— */}
      <div className="max-h-[340px] space-y-2.5 overflow-y-auto px-4 py-4 sm:px-5">
        {active.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.deMoi ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.deMoi
                  ? "bg-white text-[#0a0a0c]"
                  : "border border-white/10 bg-white/[0.05] text-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <span
                  className={`truncate font-bold ${
                    m.deMoi ? "text-[#0a0a0c]/55" : "text-white/55"
                  }`}
                >
                  {m.deMoi ? "Vous" : active.nom}
                </span>
                <span
                  className={`shrink-0 ${
                    m.deMoi ? "text-[#0a0a0c]/45" : "text-white/40"
                  }`}
                >
                  {m.heure}
                </span>
              </div>
              <p className="mt-1 break-words text-[13px] leading-relaxed">{m.texte}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ——— 3. RÉPONSES RAPIDES UTILES LE JOUR J ——— */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/[0.07] px-4 py-2.5 sm:px-5">
        {MESSAGES_RAPIDES.map((rapide) => (
          <button
            key={rapide}
            type="button"
            onClick={() => envoyer(rapide)}
            className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white hover:text-black"
          >
            {rapide}
          </button>
        ))}
      </div>

      {/* ——— 4. CHAMP D'ENVOI SOBRE ——— */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-black/40 p-3 sm:px-4"
      >
        <input
          type="text"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={`Écrire dans ${active.nom}…`}
          className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs text-white placeholder:text-white/35 focus:border-white/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texte.trim()}
          aria-label="Envoyer"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition enabled:hover:scale-105 disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
