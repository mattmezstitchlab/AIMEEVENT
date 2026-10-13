import { useEffect, useState } from "react";

/** Fine barre en haut d'écran qui matérialise la progression dans la page — repère discret et utile sur les longues pages. */
export default function ScrollProgress() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setRatio(scrollable > 0 ? Math.min(1, h.scrollTop / scrollable) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2.5px] bg-white/0" aria-hidden="true">
      <div
        className="scroll-progress-bar h-full bg-event-gradient transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${ratio})`, width: "100%" }}
      />
    </div>
  );
}
