import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { CONVERSATIONS_INITIALES, type Conversation, type MessageFil } from "../data/espace";

export default function Messagerie() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS_INITIALES);
  const [activeId, setActiveId] = useState("c1");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conv.messages.length, activeId]);

  const ouvrir = (id: string) => {
    setActiveId(id);
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, nonLus: 0 } : c)));
  };

  const envoyer = () => {
    const texte = draft.trim();
    if (!texte) return;
    const heure = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const msg: MessageFil = { id: `m-${Date.now()}`, deMoi: true, texte, heure };
    const id = conv.id;
    setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c)));
    setDraft("");

    /* Réponse simulée du correspondant */
    setTimeout(() => {
      setConversations((cs) =>
        cs.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `m-${Date.now()}-r`,
                    deMoi: false,
                    texte: c.reponseAuto,
                    heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            : c,
        ),
      );
    }, 1300);
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-white/10 md:grid-cols-[280px_1fr]">
      {/* Liste des conversations */}
      <div className="border-b border-white/10 bg-[#070708] md:border-b-0 md:border-r">
        <p className="border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Toutes vos conversations — au même endroit
        </p>
        <div className="flex overflow-x-auto md:max-h-[520px] md:flex-col md:overflow-y-auto">
          {conversations.map((c) => {
            const dernier = c.messages[c.messages.length - 1];
            const actif = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => ouvrir(c.id)}
                aria-current={actif}
                className={`flex min-w-[210px] items-start gap-3 px-4 py-3.5 text-left transition md:min-w-0 ${actif ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-event-gradient font-display text-[11px] font-extrabold text-white">
                  {c.nom.replace(/^(Équipe|Bénévoles|Atelier|AIME)\s/, "").slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-[13px] font-bold tracking-tight">{c.nom}</span>
                    {c.nonLus > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#ff4e6b] px-1.5 font-display text-[10px] font-extrabold">{c.nonLus}</span>
                    )}
                  </span>
                  <span className="block truncate text-[11px] text-white/40">{c.contexte}</span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-white/50">{dernier?.texte}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fil de discussion */}
      <div className="flex flex-col bg-[#09090b]">
        <div className="border-b border-white/10 px-5 py-3.5">
          <p className="font-display text-sm font-extrabold tracking-tight">{conv.nom}</p>
          <p className="text-[11px] text-white/40">{conv.contexte} · Répond généralement dans la journée</p>
        </div>
        <div ref={scrollRef} className="max-h-[420px] flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {conv.messages.map((m) => (
            <div key={m.id} className={`flex ${m.deMoi ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                  m.deMoi ? "bg-event-gradient text-white rounded-br-md" : "bg-white/[0.07] text-white/85 rounded-bl-md"
                }`}
              >
                <p>{m.texte}</p>
                <p className={`mt-1 text-right text-[9.5px] ${m.deMoi ? "text-white/70" : "text-white/35"}`}>{m.heure}</p>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); envoyer(); }}
          className="flex items-center gap-2 border-t border-white/10 p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire sans quitter AIME…"
            aria-label="Message"
            className="w-full rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Envoyer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-event-gradient text-white transition enabled:hover:brightness-110 enabled:active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
