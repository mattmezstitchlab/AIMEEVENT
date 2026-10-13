import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  User,
  Volume2,
  X,
} from "lucide-react";
import { PROFILS, UNIVERS_PAR_ID, type PublicId, type RendezVous } from "../data/annee";
import { sensorielDe } from "../data/innovations";
import ModalReservation from "./ModalReservation";
import TicketBlanc from "./TicketBlanc";
import { useEspaceStore } from "../hooks/useEspaceStore";

export default function PageMois({
  moisId,
  onRetour,
  onEspace,
  onChangeMonth,
}: {
  moisId: string;
  onRetour: () => void;
  onAcces?: () => void;
  onEspace: (tab?: string) => void;
  onChangeMonth: (id: string) => void;
  onSearch?: () => void;
}) {
  const { calendrierComplet, billets, totalNonLus } = useEspaceStore();

  const index = Math.max(
    0,
    calendrierComplet.findIndex((m) => m.id === moisId),
  );
  const mois = calendrierComplet[index] ?? calendrierComplet[0];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filtreOuvert, setFiltreOuvert] = useState(false);
  const [publicFiltre, setPublicFiltre] = useState<PublicId | "tous">("tous");
  const [gratuitUniquement, setGratuitUniquement] = useState(false);
  const [calmeUniquement, setCalmeUniquement] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [reserve, setReserve] = useState<RendezVous | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [moisId, publicFiltre, gratuitUniquement, calmeUniquement, searchQuery]);

  const rvsFiltres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const f = mois.rendezVous.filter((ev) => {
      if (publicFiltre !== "tous" && !ev.publics.includes(publicFiltre)) return false;
      if (gratuitUniquement && ev.prix !== 0) return false;
      if (calmeUniquement) {
        const s = sensorielDe(ev.id);
        if (s.bruit > 2 && !s.salleCalme) return false;
      }
      if (q) {
        const u = UNIVERS_PAR_ID[ev.univers]?.nom ?? "";
        const hay = `${ev.nom} ${ev.format} ${ev.resume} ${u}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return f.length > 0 ? f : mois.rendezVous;
  }, [mois.rendezVous, publicFiltre, gratuitUniquement, calmeUniquement, searchQuery]);

  const safeSelected =
    ((selectedIndex % rvsFiltres.length) + rvsFiltres.length) % rvsFiltres.length;
  const currentEvent = rvsFiltres[safeSelected] ?? rvsFiltres[0];
  const univers = UNIVERS_PAR_ID[currentEvent.univers] ?? Object.values(UNIVERS_PAR_ID)[0];

  useEffect(() => {
    videoRef.current?.load();
  }, [univers.video]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const el = container.children[safeSelected] as HTMLElement | undefined;
    if (!el) return;
    const padLeft = window.innerWidth >= 768 ? 40 : 20;
    container.scrollTo({
      left: Math.max(0, el.offsetLeft - padLeft),
      behavior: "smooth",
    });
  }, [safeSelected]);

  const publicLabelActif =
    publicFiltre === "tous"
      ? null
      : PROFILS.find((p) => p.id === publicFiltre)?.label ?? null;

  return (
    <div className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-black text-[#f5f5f7]">
      {/* ——— VIDÉO PLEIN ÉCRAN PURE ——— */}
      <video
        ref={videoRef}
        key={univers.video}
        autoPlay
        muted
        loop
        playsInline
        poster={univers.image}
        aria-label={univers.alt}
        className="hero-slide-image pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src={univers.video} type="video/mp4" />
      </video>

      {/* ——— 1. HAUT : AIME EVENT + MOIS ▾ & LOUPE SANS ROND NOIR / DROITE = MON ESPACE ——— */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-start justify-between gap-4 px-[5vw] pt-7 md:px-10 md:pt-10">
        <div className="relative">
          <button
            onClick={onRetour}
            className="inline-flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.22em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] transition hover:text-white/85"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>AIME EVENT</span>
          </button>

          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltreOuvert((o) => !o)}
              aria-expanded={filtreOuvert}
              className="inline-flex items-center gap-2 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none tracking-[-0.03em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] transition hover:text-white/85"
            >
              <span>{mois.nom}</span>
              <ChevronDown
                className={`h-5 w-5 text-white/85 transition-transform duration-200 ${
                  filtreOuvert ? "rotate-180" : ""
                }`}
              />
            </button>

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

          {filtreOuvert && (
            <div
              className="absolute left-0 top-full z-50 mt-3 w-[88vw] max-w-sm overflow-hidden rounded-[24px] border border-white/15 bg-[#0b0b0e] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.92)]"
              style={{ animation: "fadeIn 0.18s ease both" }}
            >
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-white/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un événement, un thème…"
                  className="w-full bg-transparent text-xs font-medium text-white placeholder-white/40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Effacer"
                    className="text-white/50 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Public
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPublicFiltre("tous")}
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
                        onClick={() => setPublicFiltre(actif ? "tous" : p.id)}
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

              <div className="mt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Mois
                </p>
                <div className="mt-1.5 grid max-h-48 grid-cols-3 gap-1 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFiltreOuvert(false);
                      onRetour();
                    }}
                    className="col-span-3 flex items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    <span>Tous les mois</span>
                  </button>
                  {calendrierComplet.map((m) => {
                    const actif = m.id === mois.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onChangeMonth(m.id);
                          setFiltreOuvert(false);
                        }}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition ${
                          actif
                            ? "bg-white font-semibold text-black"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{m.nom}</span>
                        {actif && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Haut droite : Mon Espace uniquement */}
        <button
          onClick={() => onEspace("participe")}
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
      </header>

      {/* ——— 2. EN BAS : CARROUSEL DE TICKETS CARRÉS + BOUTONS "ENTRÉE LIBRE" & "CALME" AU CENTRE EN BAS ——— */}
      <main className="relative z-20 mt-auto w-full pb-5 pt-4 md:pb-7">
        <div
          ref={carouselRef}
          onScroll={(e) => {
            const container = e.currentTarget;
            const firstCard = container.firstElementChild as HTMLElement | null;
            const cardWidth = firstCard?.offsetWidth || 300;
            const newIdx = Math.round(container.scrollLeft / (cardWidth + 18));
            if (newIdx >= 0 && newIdx < rvsFiltres.length && newIdx !== safeSelected) {
              setSelectedIndex(newIdx);
            }
          }}
          className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-[5vw] py-2 scroll-pl-[5vw] md:px-10 md:scroll-pl-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {rvsFiltres.map((ev, i) => (
            <div key={ev.id} className="shrink-0 snap-start">
              <TicketBlanc
                event={ev}
                moisNom={mois.nom}
                onReserve={setReserve}
                actif={i === safeSelected}
                onSelect={() => setSelectedIndex(i)}
              />
            </div>
          ))}
        </div>

        {/* Au centre en bas : Entrée libre & Calme */}
        <div className="mt-4 flex items-center justify-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setGratuitUniquement((v) => !v)}
            className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold shadow-lg transition ${
              gratuitUniquement
                ? "border-white bg-white text-black"
                : "border-white/15 bg-[#0b0b0e] text-white/85 hover:border-white/35 hover:text-white"
            }`}
          >
            Entrée libre
          </button>

          <button
            type="button"
            onClick={() => setCalmeUniquement((v) => !v)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold shadow-lg transition ${
              calmeUniquement
                ? "border-white bg-white text-black"
                : "border-white/15 bg-[#0b0b0e] text-white/85 hover:border-white/35 hover:text-white"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Calme</span>
          </button>
        </div>
      </main>

      <ModalReservation
        event={reserve}
        onClose={() => setReserve(null)}
        onEspace={(tab) => onEspace(tab ?? "participe")}
      />
    </div>
  );
}
