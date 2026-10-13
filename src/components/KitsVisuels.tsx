import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID, type MoisProgramme, type RendezVous } from "../data/annee";
import { sensorielDe } from "../data/innovations";

type FormatAutoId = "story" | "carre" | "bandeau";

interface FormatAutoSpec {
  id: FormatAutoId;
  nom: string;
  sousTitre: string;
  dimensions: string;
  w: number;
  h: number;
}

const TROIS_FORMATS: FormatAutoSpec[] = [
  {
    id: "story",
    nom: "Format Story",
    sousTitre: "Vertical 9:16 · Instagram / TikTok",
    dimensions: "1080 × 1920",
    w: 1080,
    h: 1920,
  },
  {
    id: "carre",
    nom: "Format Carré",
    sousTitre: "Post 1:1 · Feed / LinkedIn",
    dimensions: "1080 × 1080",
    w: 1080,
    h: 1080,
  },
  {
    id: "bandeau",
    nom: "Format Bandeau",
    sousTitre: "Horizontal 16:9 · Couverture / Écran",
    dimensions: "1920 × 1080",
    w: 1920,
    h: 1080,
  },
];

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      linesCount++;
      if (linesCount >= maxLines) {
        ctx.fillText(line.trim() + "…", x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawAuroraBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, "#fbbf24");
  g.addColorStop(0.25, "#ff375f");
  g.addColorStop(0.5, "#a855f7");
  g.addColorStop(0.75, "#3b82f6");
  g.addColorStop(1, "#10b981");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function drawQrStylise(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: string,
) {
  const N = 15;
  const cell = size / N;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  ctx.fillStyle = "#0a0a0c";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const inCorner =
        (r < 4 && c < 4) || (r < 4 && c >= N - 4) || (r >= N - 4 && c < 4);
      if (inCorner) continue;
      h ^= r * 31 + c * 17;
      h = Math.imul(h, 16777619);
      if ((h >>> 8) & 1) {
        ctx.fillRect(x + c * cell, y + r * cell, cell * 0.85, cell * 0.85);
      }
    }
  }
  const corner = (cx: number, cy: number) => {
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(cx, cy, cell * 4, cell * 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx + cell * 0.7, cy + cell * 0.7, cell * 2.6, cell * 2.6);
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(cx + cell * 1.35, cy + cell * 1.35, cell * 1.3, cell * 1.3);
  };
  corner(x, y);
  corner(x + (N - 4) * cell, y);
  corner(x, y + (N - 4) * cell);
}

function exporterVisuelTicketPng(
  spec: FormatAutoSpec,
  event: RendezVous,
  mois: MoisProgramme,
) {
  const canvas = document.createElement("canvas");
  canvas.width = spec.w;
  canvas.height = spec.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const u = UNIVERS_PAR_ID[event.univers];
  const sens = sensorielDe(event.id);
  const prixLabel = event.prix === 0 ? "ENTRÉE LIBRE" : `${event.prix} €`;

  // Fond noir pur autour du ticket
  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, spec.w, spec.h);

  const pad = spec.id === "bandeau" ? 80 : 72;
  const tx = pad;
  const ty = pad;
  const tw = spec.w - pad * 2;
  const th = spec.h - pad * 2;

  // Carte Ticket Blanc
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(tx, ty, tw, th, 44);
  ctx.fill();
  ctx.clip();

  // Filet Aurore supérieur
  drawAuroraBar(ctx, tx, ty, tw, 12);

  if (spec.id === "bandeau") {
    // Format Horizontal 16:9 : Corps à gauche + découpe verticale + Talon QR à droite
    const stubX = tx + tw * 0.72;
    const innerX = tx + 68;

    ctx.fillStyle = "rgba(10,10,12,0.45)";
    ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillText(`AIME EVENT · ${u.nom.toUpperCase()}`, innerX, ty + 78);

    ctx.fillStyle = "#0a0a0c";
    ctx.font = '800 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillText(
      `${event.jour.toUpperCase()} ${mois.nom.toUpperCase()} 2027 · ${event.heure}`,
      innerX,
      ty + 148,
    );

    ctx.font = '800 68px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    const afterTitleY = wrapText(ctx, event.nom, innerX, ty + 245, stubX - innerX - 60, 76, 3);

    ctx.fillStyle = "rgba(10,10,12,0.72)";
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    ctx.fillText(`${event.format} · ${event.duree}`, innerX, afterTitleY + 28);

    // Jauge sensorielle
    ctx.fillStyle = "rgba(10,10,12,0.45)";
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    ctx.fillText(
      `SON ${sens.bruit}/3  ·  LUMIÈRE ${sens.lumiere}/3  ·  FOULE ${sens.foule}/3`,
      innerX,
      ty + th - 64,
    );

    // Ligne pointillée verticale + encoches
    ctx.strokeStyle = "rgba(10,10,12,0.18)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(stubX, ty + 32);
    ctx.lineTo(stubX, ty + th - 32);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#050507";
    ctx.beginPath();
    ctx.arc(stubX, ty, 26, 0, Math.PI * 2);
    ctx.arc(stubX, ty + th, 26, 0, Math.PI * 2);
    ctx.fill();

    // Talon droit QR + Prix
    const qrSize = 210;
    const qrX = stubX + (tx + tw - stubX - qrSize) / 2;
    drawQrStylise(ctx, qrX, ty + 140, qrSize, `AIME-${event.id}`);

    ctx.fillStyle = "#0a0a0c";
    ctx.beginPath();
    ctx.roundRect(stubX + 48, ty + th - 150, tx + tw - stubX - 96, 86, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(prixLabel, stubX + (tx + tw - stubX) / 2, ty + th - 96);
    ctx.textAlign = "left";
  } else {
    // Format Story (9:16) ou Carré (1:1)
    const isStory = spec.id === "story";
    const innerX = tx + 64;
    const innerW = tw - 128;
    const stubY = isStory ? ty + th - 360 : ty + th - 230;

    ctx.fillStyle = "rgba(10,10,12,0.45)";
    ctx.font = '700 22px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    ctx.fillText(`AIME EVENT · #${event.id}`, innerX, ty + (isStory ? 96 : 74));

    ctx.fillStyle = "#0a0a0c";
    ctx.font = `800 ${isStory ? 40 : 32}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
    ctx.fillText(
      `${event.jour.toUpperCase()} ${mois.nom.toUpperCase()} · ${event.heure}`,
      innerX,
      ty + (isStory ? 185 : 140),
    );

    ctx.font = `800 ${isStory ? 76 : 58}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
    const afterTitleY = wrapText(
      ctx,
      event.nom,
      innerX,
      ty + (isStory ? 300 : 225),
      innerW,
      isStory ? 84 : 64,
      isStory ? 4 : 3,
    );

    ctx.fillStyle = "rgba(10,10,12,0.72)";
    ctx.font = `600 ${isStory ? 30 : 24}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
    ctx.fillText(`${event.format} · ${u.nom}`, innerX, afterTitleY + (isStory ? 36 : 20));

    if (isStory) {
      ctx.fillStyle = "rgba(10,10,12,0.55)";
      ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
      wrapText(ctx, event.resume, innerX, afterTitleY + 110, innerW, 40, 4);
    }

    ctx.fillStyle = "rgba(10,10,12,0.45)";
    ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    ctx.fillText(
      `SON ${sens.bruit}/3  ·  LUMIÈRE ${sens.lumiere}/3  ·  FOULE ${sens.foule}/3`,
      innerX,
      stubY - 42,
    );

    // Ligne pointillée horizontale + encoches
    ctx.strokeStyle = "rgba(10,10,12,0.18)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(tx + 32, stubY);
    ctx.lineTo(tx + tw - 32, stubY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#050507";
    ctx.beginPath();
    ctx.arc(tx, stubY, 26, 0, Math.PI * 2);
    ctx.arc(tx + tw, stubY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Talon inférieur : Bouton Prix à gauche + QR à droite
    ctx.fillStyle = "#0a0a0c";
    ctx.beginPath();
    ctx.roundRect(innerX, stubY + (isStory ? 95 : 58), 340, isStory ? 96 : 78, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${isStory ? 30 : 25}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      prixLabel,
      innerX + 170,
      stubY + (isStory ? 154 : 106),
    );
    ctx.textAlign = "left";

    const qrSize = isStory ? 170 : 120;
    drawQrStylise(
      ctx,
      tx + tw - 64 - qrSize,
      stubY + (isStory ? 58 : 38),
      qrSize,
      `AIME-${event.id}`,
    );
  }

  ctx.restore();

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aime-ticket-${event.id}-${spec.id}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export default function KitsVisuels({
  eventId,
  onExport,
}: {
  eventId?: string;
  onExport?: () => void;
}) {
  const [copieOk, setCopieOk] = useState(false);

  const cible =
    (eventId ? TOUS_LES_EVENEMENTS.find((x) => x.event.id === eventId) : null) ??
    TOUS_LES_EVENEMENTS[0];
  const { event, mois } = cible;
  const u = UNIVERS_PAR_ID[event.univers];
  const sens = sensorielDe(event.id);
  const prixLabel = event.prix === 0 ? "Entrée libre" : `${event.prix} €`;

  const legendePrete = `${event.nom} — ${event.jour} ${mois.nom.toLowerCase()} 2027 à ${event.heure} (${event.format}).\n${event.resume}\nAccès : ${prixLabel} · Cercle Solo (-20 min) disponible.\n#AimeEvent2027`;

  const copierLegende = () => {
    navigator.clipboard?.writeText(legendePrete);
    setCopieOk(true);
    setTimeout(() => setCopieOk(false), 2000);
  };

  const telechargerUnFormat = (spec: FormatAutoSpec) => {
    exporterVisuelTicketPng(spec, event, mois);
    onExport?.();
  };

  const telechargerLesTrois = () => {
    TROIS_FORMATS.forEach((spec, idx) => {
      setTimeout(() => {
        exporterVisuelTicketPng(spec, event, mois);
      }, idx * 180);
    });
    onExport?.();
  };

  return (
    <div className="space-y-4">
      {/* Barre d'en-tête : Titre + Copier légende + Tout télécharger (3 PNG) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold tracking-[-0.015em] text-white">
            Kit Visuel Automatique — 3 formats prêts à diffuser
          </h3>
          <p className="text-[12px] text-white/45">
            Générés automatiquement depuis le ticket « {event.nom} » · Zéro réglage nécessaire
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copierLegende}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            {copieOk ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Légende copiée
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copier le texte du post
              </>
            )}
          </button>

          <button
            onClick={telechargerLesTrois}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-sm transition hover:bg-white/90"
          >
            <Download className="h-3.5 w-3.5" /> Tout télécharger (3 PNG)
          </button>
        </div>
      </div>

      {/* Grille des 3 formats automatiques : Story (9:16), Carré (1:1), Bandeau (16:9) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ——— 1. FORMAT STORY (9:16) ——— */}
        <div className="flex flex-col justify-between rounded-[24px] border border-white/12 bg-[#0b0b0e] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold text-white">1. Format Story</p>
              <p className="text-[11px] text-white/45">Vertical 9:16 · 1080 × 1920</p>
            </div>
            <button
              onClick={() => telechargerUnFormat(TROIS_FORMATS[0])}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-black transition hover:bg-white/90"
            >
              <Download className="h-3 w-3" /> PNG
            </button>
          </div>

          {/* Aperçu Story 9:16 fidèle au Vrai Ticket Blanc */}
          <div className="mx-auto flex w-full max-w-[205px] flex-1 items-center justify-center py-1">
            <div className=" flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-white text-[#0a0a0c] shadow-lg">
              <div className="h-[3px] w-full shrink-0 bg-event-gradient" />
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <p className="font-display text-[8px] font-bold uppercase tracking-[0.16em] text-[#0a0a0c]/45">
                    AIME EVENT · #{event.id}
                  </p>
                  <p className="mt-1.5 font-display text-[10px] font-bold text-[#0a0a0c]">
                    {event.jour} {mois.nom} · {event.heure}
                  </p>
                  <h4 className="mt-1 line-clamp-3 font-display text-[15px] font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c]">
                    {event.nom}
                  </h4>
                  <p className="mt-1 truncate text-[9.5px] font-medium text-[#0a0a0c]/65">
                    {event.format} · {u.nom}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[8.5px] leading-relaxed text-[#0a0a0c]/50">
                    {event.resume}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 text-[7.5px] font-bold uppercase text-[#0a0a0c]/45">
                  <span>Son {sens.bruit}/3</span>
                  <span>Lum. {sens.lumiere}/3</span>
                  <span>Foule {sens.foule}/3</span>
                </div>
              </div>

              {/* Découpe perforée Story */}
              <div className="relative flex items-center" aria-hidden="true">
                <span className="-ml-[1px] h-4 w-2 rounded-r-full bg-[#0b0b0e]" />
                <div className="mx-1.5 flex-1 border-t border-dashed border-black/20" />
                <span className="-mr-[1px] h-4 w-2 rounded-l-full bg-[#0b0b0e]" />
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="rounded-lg bg-[#0a0a0c] px-2.5 py-1 text-[9px] font-bold text-white">
                  {prixLabel}
                </span>
                <span className="font-mono text-[8px] font-bold text-[#0a0a0c]/45">QR PASS</span>
              </div>
            </div>
          </div>
        </div>

        {/* ——— 2. FORMAT CARRÉ (1:1) ——— */}
        <div className="flex flex-col justify-between rounded-[24px] border border-white/12 bg-[#0b0b0e] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold text-white">2. Format Carré</p>
              <p className="text-[11px] text-white/45">Post 1:1 · 1080 × 1080</p>
            </div>
            <button
              onClick={() => telechargerUnFormat(TROIS_FORMATS[1])}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-black transition hover:bg-white/90"
            >
              <Download className="h-3 w-3" /> PNG
            </button>
          </div>

          {/* Aperçu Carré 1:1 fidèle au Vrai Ticket Blanc */}
          <div className="mx-auto flex w-full max-w-[250px] flex-1 items-center justify-center py-1">
            <div className="flex aspect-square w-full flex-col justify-between overflow-hidden rounded-[20px] bg-white text-[#0a0a0c] shadow-lg">
              <div className="h-[3px] w-full shrink-0 bg-event-gradient" />
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="font-display text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#0a0a0c]/45">
                    AIME EVENT · #{event.id}
                  </p>
                  <p className="mt-1 font-display text-[11px] font-bold text-[#0a0a0c]">
                    {event.jour} {mois.nom} · {event.heure}
                  </p>
                  <h4 className="mt-1 line-clamp-2 font-display text-[16px] font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c]">
                    {event.nom}
                  </h4>
                  <p className="mt-1 truncate text-[10px] font-medium text-[#0a0a0c]/65">
                    {event.format} · {u.nom}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 text-[8px] font-bold uppercase text-[#0a0a0c]/45">
                  <span>Son {sens.bruit}/3</span>
                  <span>Lum. {sens.lumiere}/3</span>
                  <span>Foule {sens.foule}/3</span>
                </div>
              </div>

              {/* Découpe perforée Carré */}
              <div className="relative flex items-center" aria-hidden="true">
                <span className="-ml-[1px] h-4 w-2 rounded-r-full bg-[#0b0b0e]" />
                <div className="mx-1.5 flex-1 border-t border-dashed border-black/20" />
                <span className="-mr-[1px] h-4 w-2 rounded-l-full bg-[#0b0b0e]" />
              </div>

              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="rounded-lg bg-[#0a0a0c] px-3 py-1 text-[9.5px] font-bold text-white">
                  {prixLabel}
                </span>
                <span className="font-mono text-[8.5px] font-bold text-[#0a0a0c]/45">QR PASS</span>
              </div>
            </div>
          </div>
        </div>

        {/* ——— 3. FORMAT BANDEAU (16:9) ——— */}
        <div className="flex flex-col justify-between rounded-[24px] border border-white/12 bg-[#0b0b0e] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold text-white">3. Format Bandeau</p>
              <p className="text-[11px] text-white/45">Horizontal 16:9 · 1920 × 1080</p>
            </div>
            <button
              onClick={() => telechargerUnFormat(TROIS_FORMATS[2])}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-black transition hover:bg-white/90"
            >
              <Download className="h-3 w-3" /> PNG
            </button>
          </div>

          {/* Aperçu Bandeau 16:9 Horizontal fidèle au Vrai Ticket Blanc */}
          <div className="mx-auto flex w-full flex-1 items-center justify-center py-1">
            <div className="flex aspect-[16/9] w-full flex-col overflow-hidden rounded-[20px] bg-white text-[#0a0a0c] shadow-lg">
              <div className="h-[3px] w-full shrink-0 bg-event-gradient" />
              <div className="flex flex-1 items-stretch">
                {/* Partie gauche */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                  <div>
                    <p className="font-display text-[8px] font-bold uppercase tracking-[0.16em] text-[#0a0a0c]/45">
                      AIME EVENT · {u.nom}
                    </p>
                    <p className="mt-1 font-display text-[10px] font-bold text-[#0a0a0c]">
                      {event.jour} {mois.nom} · {event.heure}
                    </p>
                    <h4 className="mt-0.5 line-clamp-2 font-display text-[14px] font-extrabold leading-tight tracking-[-0.03em] text-[#0a0a0c]">
                      {event.nom}
                    </h4>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-[#0a0a0c]/65">
                      {event.format} · {event.duree}
                    </p>
                  </div>

                  <p className="text-[7.5px] font-bold uppercase text-[#0a0a0c]/45">
                    Son {sens.bruit}/3 · Lum. {sens.lumiere}/3 · Foule {sens.foule}/3
                  </p>
                </div>

                {/* Découpe verticale */}
                <div className="relative flex flex-col items-center" aria-hidden="true">
                  <span className="-mt-[1px] h-2 w-4 rounded-b-full bg-[#0b0b0e]" />
                  <div className="my-1 flex-1 border-l border-dashed border-black/20" />
                  <span className="-mb-[1px] h-2 w-4 rounded-t-full bg-[#0b0b0e]" />
                </div>

                {/* Talon droit */}
                <div className="flex w-24 shrink-0 flex-col items-center justify-between p-3 text-center">
                  <span className="font-mono text-[8px] font-bold text-[#0a0a0c]/45">
                    #{event.id}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/15 font-mono text-[8px] font-bold text-[#0a0a0c]">
                    QR
                  </div>
                  <span className="w-full rounded-lg bg-[#0a0a0c] py-1 text-[8px] font-bold text-white">
                    {prixLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
