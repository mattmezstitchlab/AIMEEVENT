import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, Heart, Ticket, Users } from "lucide-react";
import { UNIVERS_PAR_ID, type RendezVous } from "../data/annee";
import { useFavorites } from "../hooks/useFavorites";

interface Slide {
  event: RendezVous;
  /** Libellé contextuel au-dessus du titre (mois, univers…) */
  surtitre: string;
}

export default function HeroVideo({
  slides,
  compteurLabel,
  onReserve,
  cta,
  topLeft,
  topRight,
}: {
  slides: Slide[];
  compteurLabel: string;
  onReserve: (e: RendezVous) => void;
  cta?: { label: string; onClick: () => void };
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const slide = slides[index % slides.length];
  const univers = UNIVERS_PAR_ID[slide.event.univers];
  const gratuit = slide.event.prix === 0;
  const { has, toggle } = useFavorites();
  const aime = has(slide.event.id);

  useEffect(() => setIndex(0), [slides]);

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((c) => (c + 1) % slides.length), 8000);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  useEffect(() => {
    videoRef.current?.load();
  }, [univers.video]);

  const go = (d: -1 | 1) => setIndex((c) => (c + d + slides.length) % slides.length);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black"
      aria-label="Prochains rendez-vous"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Vidéo plein écran */}
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

      {/* Voile noir 15 % — juste assez pour faire ressortir les infos */}
      <div className="pointer-events-none absolute inset-0 bg-black/15" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-[6vw] pb-7 pt-24 md:px-[5vw] md:pb-10 md:pt-28">
        {/* Rangée haute */}
        <div className="flex items-start justify-between gap-4">
          {topLeft}
          {topRight}
        </div>

        {/* Bloc info — hiérarchie : contexte › titre › quand › promesse › action */}
        <div key={slide.event.id} className="hero-slide-copy max-w-3xl">
          {/* 1. Contexte */}
          <p className="text-[10.5px] font-bold uppercase tracking-[0.3em] text-white/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-[11.5px]">
            {slide.surtitre}
          </p>

          {/* 2. Titre dominant */}
          <h1 className="mt-3 font-display text-[clamp(2.6rem,7.5vw,6.8rem)] font-extrabold leading-[0.88] tracking-[-0.045em] text-white drop-shadow-[0_6px_34px_rgba(0,0,0,0.85)]">
            {slide.event.nom}
          </h1>

          {/* 3. Quand / quoi — la ligne de faits */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
              <Calendar className="h-3.5 w-3.5" /> {slide.event.jour}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
              <Clock className="h-3.5 w-3.5" /> {slide.event.heure} · {slide.event.duree}
            </span>
            <span className="rounded-full bg-black/45 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md">
              {slide.event.format}
            </span>
            <span className={`rounded-full px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.13em] ${gratuit ? "bg-emerald-400 text-black" : "bg-white text-black"}`}>
              {gratuit ? "Gratuit" : `${slide.event.prix} €`}
            </span>
          </div>

          {/* 4. Promesse */}
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)] md:text-base">
            {slide.event.resume}
          </p>

          {/* 5. Action dominante + secondaire discrète */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onReserve(slide.event)}
              data-cursor={gratuit ? "S'inscrire" : "Réserver"}
              className="group inline-flex items-center gap-2.5 rounded-full bg-event-gradient px-8 py-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_14px_44px_-12px_rgba(255,78,107,0.7)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <Ticket className="h-4 w-4" />
              {gratuit ? "S'inscrire" : "Réserver"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => toggle(slide.event.id)}
              aria-label={aime ? "Retirer de mon programme" : "Ajouter à mon programme"}
              aria-pressed={aime}
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border backdrop-blur-sm transition ${aime ? "border-transparent bg-[#ff4e6b] text-white" : "border-white/70 text-white hover:bg-white hover:text-black"}`}
            >
              <Heart className={`h-4 w-4 ${aime ? "fill-current" : ""}`} />
            </button>
            {cta && (
              <button
                onClick={cta.onClick}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 px-7 py-4 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
              >
                {cta.label}
              </button>
            )}
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              <Users className="h-3.5 w-3.5" /> {slide.event.restantes} places restantes
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/35 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/60"> / {String(slides.length).padStart(2, "0")} · {compteurLabel}</span>
            </span>
            {/* Barres de progression */}
            <div className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
              {slides.map((s, i) => (
                <button
                  key={s.event.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Aller à ${s.event.nom}`}
                  className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i === index ? "bg-white" : "bg-white/30 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => go(-1)} aria-label="Précédent" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white backdrop-blur-sm transition hover:bg-white hover:text-black">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => go(1)} aria-label="Suivant" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white backdrop-blur-sm transition hover:bg-white hover:text-black">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
