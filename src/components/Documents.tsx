import { useMemo, useState } from "react";
import { Check, FileDown, FileText } from "lucide-react";
import { AIME_ID, TYPES_DOCUMENTS } from "../data/espace";
import { UNIVERS_PAR_ID } from "../data/annee";
import { getTousLesEvenements, useEspaceStore } from "../hooks/useEspaceStore";

function buildDocument(type: string, nom: string, eventId: string): string {
  const tous = getTousLesEvenements();
  const item = tous.find((x) => x.event.id === eventId) ?? tous[0];
  const { event, mois } = item;
  const univers = UNIVERS_PAR_ID[event.univers] ?? Object.values(UNIVERS_PAR_ID)[0];
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const corps: Record<string, { titre: string; lignes: string[] }> = {
    "attestation-benevolat": {
      titre: "Attestation de bénévolat",
      lignes: [
        `Je soussigné·e, la coordination AIME EVENT, atteste que ${nom} (identifiant ${AIME_ID}) a effectué une mission de bénévolat dans le cadre du rendez-vous « ${event.nom} » (${univers.nom}), le ${event.jour.toLowerCase()} à ${event.heure}.`,
        "Cette attestation est délivrée pour servir et valoir ce que de droit, notamment dans le cadre d'un dossier de formation, d'une candidature ou d'une valorisation d'engagement citoyen.",
      ],
    },
    "certificat-presence": {
      titre: "Certificat de présence",
      lignes: [
        `La coordination AIME EVENT certifie que ${nom} (identifiant ${AIME_ID}) a participé au rendez-vous « ${event.nom} » — ${univers.nom} — le ${event.jour.toLowerCase()} à ${event.heure} (${event.format}, ${event.duree}).`,
        "Fait pour justificatif de présence.",
      ],
    },
    "autorisation-image": {
      titre: "Autorisation de captation et de diffusion",
      lignes: [
        `Je, ${nom} (identifiant ${AIME_ID}), autorise AIME EVENT à me photographier et me filmer lors du rendez-vous « ${event.nom} » (${mois.nom} 2027), et à diffuser ces images sur ses supports de communication, sans limitation de durée.`,
        "Cette autorisation est révocable à tout moment par simple message depuis l'espace personnel.",
      ],
    },
    facture: {
      titre: "Facture",
      lignes: [
        `Facture émise pour ${nom} (identifiant ${AIME_ID}).`,
        `Détail : « ${event.nom} » — ${univers.nom} — ${event.jour} à ${event.heure}. Montant : ${event.prix === 0 ? "0 € (rendez-vous gratuit)" : `${event.prix} € TTC`}.`,
        "Frais de service : 0 €. TVA non applicable sur les rendez-vous gratuits.",
      ],
    },
    convention: {
      titre: "Convention de partenariat (modèle)",
      lignes: [
        `Entre AIME EVENT (Saison 2027) et ${nom} (identifiant ${AIME_ID}), il est convenu une collaboration dans la catégorie ${univers.nom}, autour du rendez-vous « ${event.nom} ».`,
        "Chaque partie s'engage à respecter la charte des publics, l'accessibilité et la transparence tarifaire d'AIME EVENT.",
      ],
    },
    "attestation-organisateur": {
      titre: "Attestation d'organisateur·rice",
      lignes: [
        `La coordination AIME EVENT atteste que ${nom} (identifiant ${AIME_ID}) a contribué à l'organisation du rendez-vous « ${event.nom} » (${univers.nom}, ${mois.nom} 2027) : préparation, coordination et accueil des publics.`,
        "Compétences mobilisées : production, médiation, gestion de publics intergénérationnels.",
      ],
    },
  };

  const doc = corps[type] ?? corps["certificat-presence"];
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${doc.titre} — AIME EVENT</title>
<style>
  body{font-family:Georgia,serif;max-width:720px;margin:60px auto;padding:0 24px;color:#111;line-height:1.75}
  header{display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #111;padding-bottom:16px}
  .logo{font-family:Arial,sans-serif;font-weight:900;font-size:22px;letter-spacing:-.02em}
  .grad{background:linear-gradient(90deg,#ff9c2e,#ff4e6b,#b86bd7);-webkit-background-clip:text;color:transparent}
  h1{font-size:26px;margin:42px 0 8px}
  .ref{color:#666;font-size:13px;margin-bottom:30px}
  p{margin:0 0 16px;font-size:16px}
  .sign{margin-top:56px;display:flex;justify-content:space-between;font-size:14px}
  footer{margin-top:70px;border-top:1px solid #ddd;padding-top:14px;color:#888;font-size:12px}
  @media print{body{margin:20px auto}}
</style></head><body>
<header><span class="logo">AIME <span class="grad">EVENT</span></span><span>Saison 2027</span></header>
<h1>${doc.titre}</h1>
<p class="ref">Référence ${AIME_ID} · Délivré le ${date} · Document généré depuis l'espace personnel AIME EVENT — aucun autre site nécessaire.</p>
${doc.lignes.map((l) => `<p>${l}</p>`).join("\n")}
<div class="sign"><span>Fait le ${date}</span><span>La coordination AIME EVENT<br><em>(signature électronique)</em></span></div>
<footer>AIME EVENT — Le programme est le lieu. Ce document est vérifiable avec la référence ci-dessus.</footer>
</body></html>`;
}

export default function Documents() {
  const { tousLesEvenements, propositions } = useEspaceStore();
  const [nom, setNom] = useState("Camille Ravier");
  const [eventId, setEventId] = useState(
    () => propositions[0]?.event.id ?? tousLesEvenements[6]?.event.id ?? "07",
  );
  const [genere, setGenere] = useState<string | null>(null);

  const item = useMemo(
    () => tousLesEvenements.find((x) => x.event.id === eventId) ?? tousLesEvenements[0],
    [eventId, tousLesEvenements],
  );

  const telecharger = (typeId: string) => {
    const html = buildDocument(typeId, nom, eventId);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${typeId}-aime-event.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenere(typeId);
  };

  return (
    <div>
      {/* Identité utilisée sur les documents */}
      <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Nom sur les documents</span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Rendez-vous concerné</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/12 bg-[#0b0b0d] px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
          >
            {tousLesEvenements.map(({ event: e, mois: m, communaute }) => (
              <option key={e.id} value={e.id}>
                {m.nom} — {e.nom}{communaute ? " (Votre proposition)" : ""}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[12px] text-white/40 sm:col-span-2">
          Document lié à <strong className="text-white/70">{item.event.nom}</strong> · identifiant universel <span className="tabular-nums">{AIME_ID}</span> · génération instantanée, sans e-mail ni pièce jointe.
        </p>
      </div>

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES_DOCUMENTS.map((d) => (
          <article key={d.id} className="apple-card flex flex-col justify-between rounded-2xl p-5">
            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <FileText className="h-4 w-4" />
              </span>
              <h3 className="mt-3.5 font-display text-[14.5px] font-bold tracking-tight text-white">
                {d.titre}
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">{d.description}</p>
            </div>
            <button
              onClick={() => telecharger(d.id)}
              className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold transition ${
                genere === d.id
                  ? "bg-white text-black"
                  : "border border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-black"
              }`}
            >
              {genere === d.id ? <Check className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
              {genere === d.id ? "Généré" : "Télécharger"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
