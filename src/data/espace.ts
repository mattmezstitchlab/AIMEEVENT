/* ————————————————————————————————————————————————————————————
   AIME EVENT — ESPACE UNIVERSEL
   L'espace de toutes celles et ceux qui font l'événement :
   participer, organiser, aider, créer.
   ———————————————————————————————————————————————————————————— */

export const AIME_ID = "AIME-2027-4821-KM";

export interface Mission {
  id: string;
  titre: string;
  univers: string;
  quand: string;
  lieu: string;
  competences: string[];
  points: number;
  places: number;
  prises: number;
  description: string;
}

export const MISSIONS: Mission[] = [
  {
    id: "m1", titre: "Accueil & orientation", univers: "sommet", quand: "Samedi 14 mars · 10 h – 14 h",
    lieu: "Entrée principale", competences: ["Sourire", "Orientation"], points: 40, places: 12, prises: 9,
    description: "Premier visage de l'événement : accueillir, orienter, répondre aux questions simples.",
  },
  {
    id: "m2", titre: "Montage lumière", univers: "nuit", quand: "Vendredi 10 juil. · 8 h – 12 h",
    lieu: "Grande salle", competences: ["Technique", "Port de charges"], points: 60, places: 6, prises: 4,
    description: "Installer et câbler les projecteurs avec le régisseur. Formation de 30 min sur place.",
  },
  {
    id: "m3", titre: "Atelier enfants — Kids Lab", univers: "enfance", quand: "Dimanche 12 juil. · 13 h 30 – 16 h",
    lieu: "Espace familles", competences: ["Animation", "Patience"], points: 50, places: 8, prises: 8,
    description: "Accompagner les enfants dans l'atelier de fabrication. Complet — liste d'attente ouverte.",
  },
  {
    id: "m4", titre: "Captation photo", univers: "image", quand: "Samedi 10 oct. · 14 h – 18 h",
    lieu: "Tout le site", competences: ["Photo", "Droit à l'image"], points: 70, places: 4, prises: 2,
    description: "Documenter la journée pour les réseaux et les archives. Matériel personnel bienvenu.",
  },
  {
    id: "m5", titre: "Cuisine — Grandes tablées", univers: "table", quand: "Samedi 11 avr. · 9 h – 13 h",
    lieu: "Cuisine collective", competences: ["Cuisine", "Hygiène HACCP"], points: 55, places: 10, prises: 6,
    description: "Préparer le repas partagé avec les chefs invités. Repas offert après le service.",
  },
  {
    id: "m6", titre: "Médiation lecture", univers: "voix", quand: "Vendredi 10 janv. · 18 h – 20 h",
    lieu: "Salon de lecture", competences: ["Lecture", "Écoute"], points: 35, places: 6, prises: 3,
    description: "Lire à voix haute et animer les échanges autour des textes choisis.",
  },
];

export interface MessageFil {
  id: string;
  deMoi: boolean;
  texte: string;
  heure: string;
}

export interface Conversation {
  id: string;
  nom: string;
  contexte: string;
  nonLus: number;
  reponseAuto: string;
  messages: MessageFil[];
}

export const CONVERSATIONS_INITIALES: Conversation[] = [
  {
    id: "c1", nom: "Équipe — Le Sommet", contexte: "Organisation · Mars",
    nonLus: 2,
    reponseAuto: "Bien reçu ! On synchronise avec l'équipe et je te confirme dans la journée.",
    messages: [
      { id: "1", deMoi: false, texte: "Bonjour Camille, ton badge organisatrice est prêt. Tu le récupères à l'accueil vendredi dès 9 h.", heure: "09:12" },
      { id: "2", deMoi: true, texte: "Parfait, merci ! Je serai là à 9 h 30. Il reste une place pour l'accueil samedi matin ?", heure: "09:20" },
      { id: "3", deMoi: false, texte: "Oui, 3 places. Je te mets dessus ?", heure: "09:21" },
    ],
  },
  {
    id: "c2", nom: "Bénévoles — La Forge", contexte: "Communauté · Février",
    nonLus: 0,
    reponseAuto: "Merci pour ton message ! Un·e référent·e bénévole te répond très vite.",
    messages: [
      { id: "1", deMoi: false, texte: "Quelqu'un a un tournevis cruciforme à prêter pour le repair café ?", heure: "Hier" },
      { id: "2", deMoi: true, texte: "J'en ai deux, je les apporte samedi.", heure: "Hier" },
      { id: "3", deMoi: false, texte: "Génial, merci ! Je note +10 points entraide.", heure: "Hier" },
    ],
  },
  {
    id: "c3", nom: "Atelier Sel — chef invité", contexte: "Partenaire · Avril",
    nonLus: 1,
    reponseAuto: "Merci ! Je transmets à la cuisine, on te répond avant le service.",
    messages: [
      { id: "1", deMoi: false, texte: "On a reçu les légumes pour les Grandes tablées. Tu veux la liste des allergènes pour l'affiche ?", heure: "08:02" },
    ],
  },
  {
    id: "c4", nom: "AIME Assistant", contexte: "Aide · Documents & paiements",
    nonLus: 0,
    reponseAuto: "Je suis là. Tu peux me demander un document, un remboursement ou un visuel pour les réseaux.",
    messages: [
      { id: "1", deMoi: false, texte: "Bonjour ! Je peux générer tes attestations, factures et visuels de communication. De quoi as-tu besoin ?", heure: "Lun." },
    ],
  },
];

export interface Transaction {
  id: string;
  libelle: string;
  date: string;
  montant: number; // positif = crédit, négatif = débit
}

export const TRANSACTIONS_INITIALES: Transaction[] = [
  { id: "t1", libelle: "Billet — Le Sommet", date: "12 fév. 2027", montant: -45 },
  { id: "t2", libelle: "Recharge portefeuille", date: "10 fév. 2027", montant: 100 },
  { id: "t3", libelle: "Mission — Accueil & orientation", date: "18 janv. 2027", montant: 15 },
  { id: "t4", libelle: "Atelier — Cuisine lente", date: "20 déc. 2026", montant: -25 },
  { id: "t5", libelle: "Parrainage — Léa M.", date: "5 déc. 2026", montant: 10 },
];

export interface TypeDocument {
  id: string;
  titre: string;
  description: string;
  gratuit: boolean;
}

export const TYPES_DOCUMENTS: TypeDocument[] = [
  { id: "attestation-benevolat", titre: "Attestation de bénévolat", description: "Preuve de mission pour CV, employeur ou université.", gratuit: true },
  { id: "certificat-presence", titre: "Certificat de présence", description: "Justificatif de participation à un rendez-vous.", gratuit: true },
  { id: "autorisation-image", titre: "Autorisation de captation", description: "Accord de diffusion photo/vidéo signé en 1 clic.", gratuit: true },
  { id: "facture", titre: "Facture", description: "Facture détaillée de vos achats et missions rémunérées.", gratuit: true },
  { id: "convention", titre: "Convention de partenariat", description: "Accord type entre AIME EVENT et un partenaire.", gratuit: true },
  { id: "attestation-organisateur", titre: "Attestation d'organisateur", description: "Pour les porteurs de projet et coordinateurs d'événements.", gratuit: true },
];
