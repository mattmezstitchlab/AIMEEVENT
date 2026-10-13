import type { MoisProgramme, RendezVous } from "../data/annee";
import { UNIVERS_PAR_ID } from "../data/annee";
import { AIME_ID } from "../data/espace";
import { NIVEAU, sensorielDe } from "../data/innovations";
import type { BilletReserve } from "../hooks/useEspaceStore";

function drawQrOnCtx(
  ctx: CanvasRenderingContext2D,
  seed: string,
  offsetX: number,
  offsetY: number,
  size: number,
) {
  const N = 21;
  const S = Math.floor(size / N);
  const actualSize = N * S;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(offsetX - 16, offsetY - 16, actualSize + 32, actualSize + 32, 24);
  ctx.fill();

  let h = 2166136261;
  const bits: boolean[] = [];
  for (let i = 0; i < N * N; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 31;
    h = Math.imul(h, 16777619);
    bits.push(((h >>> 9) & 1) === 1);
  }
  ctx.fillStyle = "#000000";
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      if (!inFinder && bits[y * N + x]) {
        ctx.fillRect(offsetX + x * S, offsetY + y * S, S, S);
      }
    }
  }
  const finder = (fx: number, fy: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(offsetX + fx * S, offsetY + fy * S, 7 * S, 7 * S);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(offsetX + (fx + 1) * S, offsetY + (fy + 1) * S, 5 * S, 5 * S);
    ctx.fillStyle = "#000000";
    ctx.fillRect(offsetX + (fx + 2) * S, offsetY + (fy + 2) * S, 3 * S, 3 * S);
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
}

/**
 * Génère et télécharge un Billet Collector / Carte d'invitation Duo en PNG haute définition (1080×1620)
 */
export function telechargerBilletCollectorPng(
  event: RendezVous,
  mois: MoisProgramme,
  billet: BilletReserve,
) {
  const W = 1080;
  const H = 1620;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const univers = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
  const sensoriel = sensorielDe(event.id);

  // Fond noir profond
  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, W, H);

  // Carte principale avec bordure subtile
  const pad = 64;
  ctx.fillStyle = "#0b0b0e";
  ctx.beginPath();
  ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 44);
  ctx.fill();

  // Bandeau supérieur en dégradé signature AIME
  const grad = ctx.createLinearGradient(pad, pad, W - pad, pad + 340);
  grad.addColorStop(0, "#ff9c2e");
  grad.addColorStop(0.35, "#ff5f45");
  grad.addColorStop(0.68, "#f6497a");
  grad.addColorStop(1, "#b86bd7");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(pad, pad, W - pad * 2, 320, [44, 44, 0, 0]);
  ctx.fill();

  // En-tête dans le bandeau
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 42px "Inter Tight", Arial, sans-serif';
  ctx.fillText("AIME EVENT · SAISON 2027", pad + 56, pad + 92);

  ctx.font = "700 24px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText(
    `${mois.nom.toUpperCase()} 2027 · ${univers.nom.toUpperCase()}`,
    pad + 56,
    pad + 142,
  );

  // Titre du rendez-vous
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 76px "Inter Tight", Arial, sans-serif';
  ctx.fillText(event.nom.toUpperCase().slice(0, 22), pad + 56, pad + 245);

  // Infos date / heure / format
  const bodyY = pad + 400;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  ctx.fillText("QUAND & QUOI", pad + 56, bodyY);

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 40px "Inter Tight", Arial, sans-serif';
  ctx.fillText(`${event.jour} · ${event.heure} (${event.duree})`, pad + 56, bodyY + 54);

  ctx.fillStyle = "#d4d4d8";
  ctx.font = "600 28px Inter, Arial, sans-serif";
  ctx.fillText(
    `${event.format} · ${billet.qty} place${billet.qty > 1 ? "s" : ""}`,
    pad + 56,
    bodyY + 100,
  );

  // Titulaire & Invité Duo
  const holderY = bodyY + 185;
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "700 22px Inter, Arial, sans-serif";
  ctx.fillText("TITULAIRE & ACCÈS", pad + 56, holderY);

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 34px "Inter Tight", Arial, sans-serif';
  const holderText = billet.inviteDuoNom
    ? `Camille Ravier + Invité·e Duo : ${billet.inviteDuoNom}`
    : "Camille Ravier";
  ctx.fillText(holderText, pad + 56, holderY + 48);

  ctx.fillStyle = "#34d399";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  const statut = billet.rejointCercle
    ? `Réf. ${AIME_ID}-${event.id} · Cercle Solo (RDV Totem -20 min)`
    : `Réf. ${AIME_ID}-${event.id} · 0 € frais de service`;
  ctx.fillText(statut, pad + 56, holderY + 90);

  // Passeport sensoriel
  const sensY = holderY + 170;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.roundRect(pad + 56, sensY, W - (pad + 56) * 2, 160, 24);
  ctx.fill();

  ctx.fillStyle = "#ff9c2e";
  ctx.font = "700 22px Inter, Arial, sans-serif";
  ctx.fillText("PASSEPORT SENSORIEL GARANTI", pad + 88, sensY + 46);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Inter, Arial, sans-serif";
  ctx.fillText(
    `Bruit : ${NIVEAU[sensoriel.bruit]} (${sensoriel.bruit}/5)   ·   Foule : ${NIVEAU[sensoriel.foule]} (${sensoriel.foule}/5)   ·   Lumière : ${NIVEAU[sensoriel.lumiere]} (${sensoriel.lumiere}/5)`,
    pad + 88,
    sensY + 94,
  );

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "600 22px Inter, Arial, sans-serif";
  const tags = [
    sensoriel.assis ? "Places assises" : null,
    sensoriel.salleCalme ? "Salle calme ouverte" : null,
    ...sensoriel.access,
  ]
    .filter(Boolean)
    .join(" · ");
  ctx.fillText(tags || "Accès PMR", pad + 88, sensY + 132);

  // Ligne de découpe pointillée du billet
  const cutY = sensY + 220;
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(pad + 40, cutY);
  ctx.lineTo(W - pad - 40, cutY);
  ctx.stroke();
  ctx.setLineDash([]);

  // QR Code en bas
  const qrSize = 294;
  drawQrOnCtx(
    ctx,
    `${event.id}-${AIME_ID}-${billet.qty}-${billet.inviteDuoNom ?? ""}`,
    pad + 72,
    cutY + 66,
    qrSize,
  );

  // Texte à droite du QR
  const qrTextX = pad + 72 + qrSize + 56;
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 36px "Inter Tight", Arial, sans-serif';
  ctx.fillText(
    billet.inviteDuoNom ? "CARTE D'INVITATION DUO" : "BILLET OFFICIEL HORS-LIGNE",
    qrTextX,
    cutY + 125,
  );

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "600 24px Inter, Arial, sans-serif";
  ctx.fillText("Présentez ce QR à l'entrée.", qrTextX, cutY + 175);
  ctx.fillText("Transfert libre & gratuit.", qrTextX, cutY + 212);
  ctx.fillStyle = "#ff4e6b";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  ctx.fillText("Le programme est le lieu.", qrTextX, cutY + 265);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billet-aime-${event.nom.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export interface ParticipantInscrit {
  id: string;
  nom: string;
  aimeId: string;
  places: number;
  modeAcces: string;
  cercleSolo: boolean;
  besoinSpecifique: string;
  present: boolean;
}

export function exporterEmargementCsv(eventNom: string, inscrits: ParticipantInscrit[]) {
  const entetes = [
    "Référence AIME",
    "Participant",
    "Places",
    "Mode d'accès",
    "Cercle Solo",
    "Besoin / Accessibilité",
    "Statut Pointage",
  ];
  const lignes = inscrits.map((p) => [
    p.aimeId,
    `"${p.nom.replace(/"/g, '""')}"`,
    String(p.places),
    `"${p.modeAcces}"`,
    p.cercleSolo ? "Oui" : "Non",
    `"${p.besoinSpecifique}"`,
    p.present ? "Présent (Validé)" : "Attendu",
  ]);
  const csv = "\uFEFF" + [entetes.join(";"), ...lignes.map((l) => l.join(";"))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `emargement-${eventNom.toLowerCase().replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
