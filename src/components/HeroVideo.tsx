import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Search,
  User,
  Volume2,
  X,
} from "lucide-react";
import { PROFILS, UNIVERS_PAR_ID, type PublicId, type RendezVous } from "../data/annee";
import { useEspaceStore } from "../hooks/useEspaceStore";
import SectionJAide from "./SectionJAide";
import TicketBlanc from "./TicketBlanc";

export interface Slide {
  event: RendezVous;
  surtitre: string;
  moisId?: string;
  moisNom?: string;
}

export default function HeroVideo({
  slides,
  onReserve,
  onEspace,
  moisFiltre = "tous",
  onChangeMoisFiltre,
  publicFiltre = "tous",
  onChangePublicFiltre,
  gratuitUniquement = false,
  onToggleGratuit,
  calmeUniquement = false,
  onToggleCalme,
  searchQuery = "",
  onChangeSearchQuery,
}: {
  slides: Slide[];
  compteurLabel?: string;
  onReserve: (e: RendezVous) => void;
  onSearch?: () => void;
  onEspace?: () => void;
  moisFiltre?: string;
  onChangeMoisFiltre?: (moisId: string) => void;
  publicFiltre?: PublicId | "tous";
  onChangePublicFiltre?: (pub: PublicId | "tous") => void;
  gratuitUniquement?: boolean;
  onToggleGratuit?: () => void;
  calmeUniquement?: boolean;
  onToggleCalme?: () => void;
  searchQuery?: string;
  onChangeSearchQuery?: (q: string) => void;
  cta?: { label: string; onClick: () => void };
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [filtreOuvert, setFiltreOuvert] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { calendrierComplet, totalNonLus, billets } = useEspaceStore();

  const safeIndex =
    slides.length > 0 ? ((index % slides.length) + slides.length) % slides.length : 0;
  const slide = slides[safeIndex] ?? {
    event: calendrierComplet[0].rendezVous[0],
    surtitre: "",
    moisNom: calendrierComplet[0].nom,
  };
  const univers = UNIVERS_PAR_ID[slide.event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];

  useEffect(() => {
    setIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [
    slides.length,
    moisFiltre,
    publicFiltre,
    gratuitUniquement,
    calmeUniquement,
    searchQuery,
  ]);

  useEffect(() => {
    if (
      paused ||
      filtreOuvert ||
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = window.setInterval(() => setIndex((c) => (c + 1) % slides.length), 8500);
    return () => window.clearInterval(t);
  }, [paused, filtreOuvert, slides.length]);

  useEffect(() => {
    videoRef.current?.load();
  }, [univers.video]);

  // Synchronise le scroll horizontal du carrousel de tickets carrés avec le slide actif
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const el = container.children[safeIndex] as HTMLElement | undefined;
    if (!el) return;
    const padLeft = window.innerWidth >= 768 ? 40 : 20;
    container.scrollTo({
      left: Math.max(0, el.offsetLeft - padLeft),
      behavior: "smooth",
    });
  }, [safeIndex]);

  const moisLabelActif =
    moisFiltre === "tous"
      ? slide.moisNom ?? "Tous les mois"
      : calendrierComplet.find((m) => m.id === moisFiltre)?.nom ?? "Tous les mois";

  const publicLabelActif =
    publicFiltre === "tous"
      ? null
      : PROFILS.find((p) => p.id === publicFiltre)?.label ?? null;

  return (
    <>
    <section
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-black"
      aria-label="Prochains rendez-vous"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Vidéo plein écran pure */}
      <video
        ref={videoRef}
        key={univers.video}
        autoPlay
        muted
        loop
        playsInline
        poster={univers.image}
        aria-label={univers.alt}
        className="hero-slide-image absolute inset-0 h-full w-full object-cover"
      >
        <source src={univers.video} type="video/mp4" />
      </video>

      {/* ——— 1. HAUT : GAUCHE = AIME EVENT + MOIS ▾ & LOUPE SANS ROND NOIR (FILTRE UNIQUE) / DROITE = MON ESPACE ——— */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-start justify-between gap-4 px-[5vw] pt-7 md:px-10 md:pt-10">
        <div className="relative">
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.22em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
            AIME EVENT
          </p>

          {/* Mois aligné à gauche + flèche bas + loupe nue juste à côté (ouvre le filtre unique Mois + Publics en texte + Recherche) */}
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltreOuvert((o) => !o)}
              aria-expanded={filtreOuvert}
              className="inline-flex items-center gap-2 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none tracking-[-0.03em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] transition hover:text-white/85"
            >
              <span>{moisLabelActif}</span>
              <ChevronDown
                className={`h-5 w-5 text-white/85 transition-transform duration-200 ${
                  filtreOuvert ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Bouton Loupe sans rond noir juste à côté du Mois */}
            <button
              type="button"
              onClick={() => {
                setFiltreOuvert(true);
                setTimeout(() => searchInputRef.current?.focus(), 40);
              }}
              title="Rechercher et filtrer par mois ou public"
              aria-label="Rechercher et filtrer"
              className="inline-flex items-center gap-1.5 p-1 text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] transition hover:text-white/75"
            >
              <Search className="h-5 w-5" />
              {(publicLabelActif || searchQuery) && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">
                  {searchQuery ? `“${searchQuery}”` : publicLabelActif}
                </span>
              )}
            </button>
          </div>

          {/* ——— MENU DÉROULANT UNIQUE : RECHERCHE + PUBLICS EN TEXTE + MOIS ——— */}
          {filtreOuvert && (
            <div
              className="absolute left-0 top-full z-50 mt-3 w-[88vw] max-w-sm overflow-hidden rounded-[24px] border border-white/15 bg-[#0b0b0e] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.92)]"
              style={{ animation: "fadeIn 0.18s ease both" }}
            >
              {/* 1. Champ de saisie direct */}
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-white/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onChangeSearchQuery?.(e.target.value)}
                  placeholder="Rechercher un événement, un thème…"
                  className="w-full bg-transparent text-xs font-medium text-white placeholder-white/40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onChangeSearchQuery?.("")}
                    aria-label="Effacer"
                    className="text-white/50 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Filtres Publics en texte clair */}
              <div className="mt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Public
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChangePublicFiltre?.("tous")}
                    className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition ${
                      publicFiltre === "tous"
                        ? "bg-white text-black"
                        : "border border-white/12 bg-white/[0.04] text-white/75 hover:text-white"
                    }`}
                  >
                    Tous
                  </button>
                  {PROFILS.map((p) => {
                    const actif = publicFiltre === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          onChangePublicFiltre?.(actif ? "tous" : p.id)
                        }
                        className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition ${
                          actif
                            ? "bg-white text-black"
                            : "border border-white/12 bg-white/[0.04] text-white/75 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mois */}
              <div className="mt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Mois
                </p>
                <div className="mt-1.5 grid max-h-48 grid-cols-3 gap-1 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onChangeMoisFiltre?.("tous");
                      setFiltreOuvert(false);
                    }}
                    className={`col-span-3 flex items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-semibold transition ${
                      moisFiltre === "tous"
                        ? "bg-white text-black"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <span>Tous les mois</span>
                    {moisFiltre === "tous" && <Check className="h-3.5 w-3.5" />}
                  </button>
                  {calendrierComplet.map((m) => {
                    const actif = moisFiltre === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onChangeMoisFiltre?.(m.id);
                          setFiltreOuvert(false);
                        }}
                        className={`rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition ${
                          actif
                            ? "bg-white font-semibold text-black"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {m.nom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex justify-end border-t border-white/10 pt-2.5">
                <button
                  type="button"
                  onClick={() => setFiltreOuvert(false)}
                  className="rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-black"
                >
                  Voir les {slides.length} tickets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Haut droite : Mon Espace uniquement */}
        {onEspace && (
          <button
            onClick={onEspace}
            title="Mon espace"
            aria-label="Mon espace"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#0b0b0e] text-white/85 transition hover:border-white/35 hover:text-white"
          >
            <User className="h-4 w-4" />
            {totalNonLus > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-event-gradient px-1 text-[9px] font-bold text-white shadow">
                {totalNonLus}
              </span>
            ) : billets.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold text-black shadow">
                {billets.length}
              </span>
            ) : null}
          </button>
        )}
      </header>

      {/* ——— 2. BAS : CARROUSEL DE TICKETS CARRÉS + BOUTONS "ENTRÉE LIBRE" & "CALME" AU CENTRE EN BAS ——— */}
      <div className="relative z-20 mt-auto w-full pb-5 pt-4 md:pb-7">
        <div
          ref={carouselRef}
          onScroll={(e) => {
            const container = e.currentTarget;
            const firstCard = container.firstElementChild as HTMLElement | null;
            const cardWidth = firstCard?.offsetWidth || 300;
            const newIdx = Math.round(container.scrollLeft / (cardWidth + 18));
            if (newIdx >= 0 && newIdx < slides.length && newIdx !== safeIndex) {
              setIndex(newIdx);
            }
          }}
          className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-[5vw] py-2 scroll-pl-[5vw] md:px-10 md:scroll-pl-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <div key={s.event.id} className="shrink-0 snap-start">
              <TicketBlanc
                event={s.event}
                moisNom={s.moisNom ?? ""}
                onReserve={onReserve}
                actif={i === safeIndex}
                onSelect={() => setIndex(i)}
              />
            </div>
          ))}
        </div>

        {/* ——— AU CENTRE EN BAS : UNIQUEMENT LES BOUTONS "ENTRÉE LIBRE" ET "CALME" ——— */}
        <div className="mt-4 flex items-center justify-center gap-2 px-4">
          {onToggleGratuit && (
            <button
              type="button"
              onClick={onToggleGratuit}
              className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold shadow-lg transition ${
                gratuitUniquement
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-[#0b0b0e] text-white/85 hover:border-white/35 hover:text-white"
              }`}
            >
              Entrée libre
            </button>
          )}

          {onToggleCalme && (
            <button
              type="button"
              onClick={onToggleCalme}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold shadow-lg transition ${
                calmeUniquement
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-[#0b0b0e] text-white/85 hover:border-white/35 hover:text-white"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Calme</span>
            </button>
          )}
        </div>
      </div>
    </section>

    {/* ——— EN DESSOUS DU HERO VIDÉO : J'AIDE (MISSIONS À ADOPTER LIÉES À L'ÉVÉNEMENT) ——— */}
    <SectionJAide activeEvent={slide.event} activeMoisNom={slide.moisNom} />
    </>
  );
}
