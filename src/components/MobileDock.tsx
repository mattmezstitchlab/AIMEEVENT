import { Calendar, Heart, QrCode, Search, User } from "lucide-react";

interface MobileDockProps {
  page: "accueil" | "mois" | "acces" | "espace";
  totalNonLus: number;
  nbBillets: number;
  nbFavoris?: number;
  onCalendrier: () => void;
  onSearch: () => void;
  onFavoris?: () => void;
  onJourJ: () => void;
  onEspace: () => void;
}

/**
 * Dock flottant universel — uniquement des pictogrammes épurés (Apple VisionOS style),
 * avec le picto Cœur ("Ma sélection") intégré dans le Dock (zéro gros bouton flottant).
 */
export default function MobileDock({
  page,
  totalNonLus,
  nbBillets,
  nbFavoris = 0,
  onCalendrier,
  onSearch,
  onFavoris,
  onJourJ,
  onEspace,
}: MobileDockProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-4 z-[85] mx-auto flex w-fit max-w-[92vw] items-center justify-center px-3"
    >
      <div className="apple-glass relative flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-2">
        {/* Filet supérieur Aurore de 1px */}
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-event-gradient opacity-75"
          aria-hidden="true"
        />

        <button
          onClick={onCalendrier}
          title="Calendrier annuel"
          aria-label="Calendrier annuel"
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
            page === "accueil" || page === "mois"
              ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
              : "text-white/65 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <Calendar className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={onSearch}
          title="Rechercher (⌘K)"
          aria-label="Rechercher"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        {onFavoris && (
          <button
            onClick={onFavoris}
            title="Ma sélection"
            aria-label="Ma sélection"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
          >
            <Heart
              className={`h-[18px] w-[18px] ${
                nbFavoris > 0 ? "fill-[#ff375f] text-[#ff375f]" : ""
              }`}
            />
            {nbFavoris > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black shadow">
                {nbFavoris}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onJourJ}
          title="Pass Jour J"
          aria-label="Pass Jour J"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/75 transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
        >
          <QrCode className="h-[18px] w-[18px]" />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"
            aria-hidden="true"
          />
        </button>

        <button
          onClick={onEspace}
          title="Mon espace"
          aria-label="Mon espace"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
            page === "espace"
              ? "bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
              : "text-white/65 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <User className="h-[18px] w-[18px]" />
          {totalNonLus > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-event-gradient px-1 text-[9px] font-bold text-white shadow">
              {totalNonLus}
            </span>
          ) : nbBillets > 0 ? (
            <span
              className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                page === "espace"
                  ? "bg-emerald-400 text-black"
                  : "border border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
              }`}
            >
              {nbBillets}
            </span>
          ) : null}
        </button>
      </div>
    </nav>
  );
}
