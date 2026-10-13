import type { MoisProgramme, RendezVous } from "../data/annee";

const MOIS_INDEX: Record<string, number> = {
  janvier: 0, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11,
};

function parseHeures(heure: string): { h1: number; m1: number; h2: number | null; m2: number | null } {
  const matches = [...heure.matchAll(/(\d+)\s*h(?:\s*(\d+))?/g)];
  const first = matches[0];
  const second = matches[1];
  return {
    h1: first ? parseInt(first[1], 10) : 10,
    m1: first?.[2] ? parseInt(first[2], 10) : 0,
    h2: second ? parseInt(second[1], 10) : null,
    m2: second?.[2] ? parseInt(second[2], 10) : null,
  };
}

function parseDureeMinutes(duree: string): number {
  const h = duree.match(/(\d+)\s*h/);
  const m = duree.match(/h\s*(\d+)/);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

/** Construit les dates de début/fin d'un rendez-vous (saison 2027) */
export function datesEvenement(event: RendezVous, mois: MoisProgramme): { debut: Date; fin: Date } {
  const monthIndex = MOIS_INDEX[mois.id] ?? 0;
  const jourNum = parseInt(event.jour.match(/\d+/)?.[0] ?? "1", 10);
  const { h1, m1, h2, m2 } = parseHeures(event.heure);

  const debut = new Date(2027, monthIndex, jourNum, h1, m1, 0);
  const fin = h2 !== null
    ? new Date(2027, monthIndex, jourNum, h2, m2 ?? 0, 0)
    : new Date(debut.getTime() + parseDureeMinutes(event.duree) * 60000);

  return { debut, fin };
}

const pad = (n: number) => String(n).padStart(2, "0");
const toIcsDate = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function escapeIcs(text: string) {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

function buildVevent(event: RendezVous, mois: MoisProgramme): string {
  const { debut, fin } = datesEvenement(event, mois);
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}-aime-event-2027@aime-event.com`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(debut)}`,
    `DTEND:${toIcsDate(fin)}`,
    `SUMMARY:${escapeIcs(event.nom)} — AIME EVENT`,
    `DESCRIPTION:${escapeIcs(event.resume)}`,
    `CATEGORIES:${escapeIcs(event.format)}`,
    "END:VEVENT",
  ].join("\r\n");
}

function buildIcsFile(events: { event: RendezVous; mois: MoisProgramme }[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AIME EVENT//Saison 2027//FR",
    "CALSCALE:GREGORIAN",
    ...events.map(({ event, mois }) => buildVevent(event, mois)),
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Télécharge un seul rendez-vous au format .ics (compatible Google/Apple/Outlook) */
export function exporterEvenement(event: RendezVous, mois: MoisProgramme) {
  downloadIcs(buildIcsFile([{ event, mois }]), `${event.nom.toLowerCase().replace(/\s+/g, "-")}.ics`);
}

/** Télécharge plusieurs rendez-vous (ex. le programme personnel) en un seul fichier */
export function exporterProgramme(events: { event: RendezVous; mois: MoisProgramme }[]) {
  downloadIcs(buildIcsFile(events), "mon-programme-aime-event.ics");
}
