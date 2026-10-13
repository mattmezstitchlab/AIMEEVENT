import { useEffect, useRef, useState } from "react";

/**
 * Curseur contextuel — actif uniquement sur pointeur fin (souris), jamais sur tactile.
 * Grossit et affiche un mot-clé quand il survole un élément marqué data-cursor="…".
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      setActive(!!target);
      setLabel(target?.getAttribute("data-cursor") || null);
    };
    const leave = () => setActive(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[200] -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-200 ease-out ${
        active ? "h-16 w-16" : "h-3 w-3"
      }`}
    >
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border transition-all duration-200 ${
          active ? "border-white/80 bg-black/40 backdrop-blur-sm" : "border-transparent bg-white"
        }`}
      >
        {active && label && (
          <span className="font-display text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-white">{label}</span>
        )}
      </div>
    </div>
  );
}
