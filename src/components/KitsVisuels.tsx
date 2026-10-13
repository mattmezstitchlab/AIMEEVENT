import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImagePlus } from "lucide-react";
import { TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID } from "../data/annee";

const FORMATS = {
  story: { w: 1080, h: 1920, label: "Story · 9:16" },
  carre: { w: 1080, h: 1080, label: "Post · 1:1" },
  banniere: { w: 1200, h: 628, label: "Bannière · 1.91:1" },
} as const;

type FormatId = keyof typeof FORMATS;
type StyleId = "signature" | "photo" | "noir";

const STYLES: { id: StyleId; label: string }[] = [
  { id: "signature", label: "Dégradé signature" },
  { id: "photo", label: "Photo immersive" },
  { id: "noir", label: "Noir pur" },
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export default function KitsVisuels({ onExport }: { onExport?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eventId, setEventId] = useState(TOUS_LES_EVENEMENTS[6].event.id);
  const [format, setFormat] = useState<FormatId>("story");
  const [style, setStyle] = useState<StyleId>("signature");
  const [copie, setCopie] = useState(false);

  const item = useMemo(
    () => TOUS_LES_EVENEMENTS.find((x) => x.event.id === eventId) ?? TOUS_LES_EVENEMENTS[0],
    [eventId],
  );
  const { event, mois } = item;
  const univers = UNIVERS_PAR_ID[event.univers];
  const f = FORMATS[format];

  const legende = `${event.nom} — ${univers.nom}\n${event.jour} · ${event.heure} · ${event.format}\n${event.resume}\n\nAIME EVENT · Saison 2027\n#AIMEevent #${univers.nom.replace(/[^a-zA-Z]/g, "")} #${mois.nom}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = f.w;
    const H = f.h;
    canvas.width = W;
    canvas.height = H;

    const draw = (photo?: HTMLImageElement) => {
      if (!ctx) return;
      /* ——— Fond ——— */
      if (style === "noir") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, W, H);
      } else if (style === "photo" && photo) {
        const s = Math.max(W / photo.width, H / photo.height);
        const dw = photo.width * s;
        const dh = photo.height * s;
        ctx.drawImage(photo, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.72)");
        ctx.fillStyle = g;
        ctx.fillRect(0, H * 0.45, W, H * 0.55);
      } else {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, "#ff9c2e");
        g.addColorStop(0.35, "#ff5f45");
        g.addColorStop(0.62, "#f6497a");
        g.addColorStop(1, "#b86bd7");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      const pad = Math.round(W * 0.075);
      const dark = style === "signature";
      ctx.fillStyle = dark ? "#ffffff" : "#ffffff";

      /* ——— Logo ——— */
      ctx.textAlign = "left";
      ctx.font = `800 ${Math.round(W * 0.042)}px "Inter Tight", sans-serif`;
      ctx.fillText("AIME EVENT", pad, pad + Math.round(W * 0.035));
      ctx.font = `600 ${Math.round(W * 0.026)}px Inter, sans-serif`;
      ctx.globalAlpha = 0.85;
      ctx.fillText("SAISON 2027", pad, pad + Math.round(W * 0.075));
      ctx.globalAlpha = 1;

      /* ——— Bloc principal (bas) ——— */
      const baseY = H - pad;
      ctx.textBaseline = "alphabetic";

      ctx.font = `800 ${Math.round(W * 0.034)}px Inter, sans-serif`;
      ctx.globalAlpha = 0.9;
      ctx.fillText(`${mois.nom.toUpperCase()} 2027 · ${univers.nom.toUpperCase()}`, pad, baseY - Math.round(H * 0.30));
      ctx.globalAlpha = 1;

      const titleSize = format === "banniere" ? Math.round(W * 0.085) : Math.round(W * 0.115);
      ctx.font = `900 ${titleSize}px "Inter Tight", sans-serif`;
      const lines = wrapText(ctx, event.nom.toUpperCase(), W - pad * 2).slice(0, 3);
      lines.forEach((l, i) => {
        ctx.fillText(l, pad, baseY - Math.round(H * 0.20) + i * titleSize * 1.02);
      });

      ctx.font = `700 ${Math.round(W * 0.036)}px Inter, sans-serif`;
      const meta = `${event.jour} · ${event.heure} · ${event.format}${event.prix === 0 ? " · GRATUIT" : ` · ${event.prix} €`}`;
      ctx.fillText(meta, pad, baseY - Math.round(H * 0.065));

      ctx.font = `600 ${Math.round(W * 0.028)}px Inter, sans-serif`;
      ctx.globalAlpha = 0.88;
      const res = wrapText(ctx, event.resume, W - pad * 2).slice(0, 2);
      res.forEach((l, i) => ctx.fillText(l, pad, baseY - Math.round(H * 0.018) + i * Math.round(W * 0.038)));
      ctx.globalAlpha = 1;

      /* ——— Pastille prix / univers ——— */
      const badge = event.prix === 0 ? "GRATUIT" : `${event.prix} €`;
      ctx.font = `800 ${Math.round(W * 0.03)}px Inter, sans-serif`;
      const bw = ctx.measureText(badge).width + Math.round(W * 0.045);
      const bx = W - pad - bw;
      const by = pad + Math.round(H * 0.015);
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, Math.round(W * 0.055), Math.round(W * 0.028));
      ctx.fillStyle = event.prix === 0 ? "#34d399" : "#ffffff";
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillText(badge, bx + Math.round(W * 0.022), by + Math.round(W * 0.038));
      ctx.fillStyle = "#ffffff";
    };

    if (style === "photo") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
      img.onerror = () => draw();
      img.src = univers.image;
    } else {
      draw();
    }
  }, [event, mois, univers, format, style, f]);

  const telecharger = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aime-event-${event.nom.toLowerCase().replace(/\s+/g, "-")}-${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
      onExport?.();
    }, "image/png");
  };

  const copierLegende = async () => {
    try {
      await navigator.clipboard.writeText(legende);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch { /* presse-papier indisponible */ }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Contrôles */}
      <div className="space-y-5">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Rendez-vous</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {TOUS_LES_EVENEMENTS.map(({ event: e, mois: m }) => (
              <option key={e.id} value={e.id}>{m.nom} — {e.nom}</option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Format</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(FORMATS) as FormatId[]).map((id) => (
              <button
                key={id}
                onClick={() => setFormat(id)}
                aria-pressed={format === id}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${format === id ? "bg-white text-black" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
              >
                {FORMATS[id].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Style</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                aria-pressed={style === s.id}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${style === s.id ? "bg-event-gradient text-white" : "border border-white/15 text-white/55 hover:border-white/40 hover:text-white"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Légende prête à poster</p>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[12.5px] leading-relaxed text-white/60">{legende}</p>
          <button onClick={copierLegende} className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition hover:border-white/50">
            {copie ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copie ? "Copiée !" : "Copier la légende"}
          </button>
        </div>

        <button
          onClick={telecharger}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-event-gradient px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          <Download className="h-4 w-4" /> Télécharger le visuel (PNG)
        </button>
        <p className="flex items-center gap-1.5 text-[10.5px] text-white/35">
          <ImagePlus className="h-3.5 w-3.5" /> Généré instantanément — prêt pour Instagram, TikTok, X, LinkedIn.
        </p>
      </div>

      {/* Aperçu */}
      <div className="flex items-start justify-center rounded-2xl border border-white/10 bg-[#070708] p-5">
        <canvas
          ref={canvasRef}
          className="max-h-[620px] w-auto max-w-full rounded-lg shadow-2xl"
          style={{ aspectRatio: `${f.w} / ${f.h}` }}
          aria-label={`Aperçu du visuel pour ${event.nom}`}
        />
      </div>
    </div>
  );
}
