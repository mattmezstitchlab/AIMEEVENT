/**
 * Taxonomie universelle AIME EVENT.
 *
 * Règle fondamentale : ne jamais mélanger
 * - CATÉGORIE : ce que c'est (musique, sport, mariage…)
 * - FORMAT : comment ça se vit (concert, atelier, projection…)
 * - ORGANISATEUR : qui le porte (école, cinéma, famille…)
 * - MODE : où l'on participe (sur place, en ligne, hybride)
 * - ACCÈS : public, privé ou sur invitation
 *
 * Cette structure reprend les points communs d'Eventbrite, Ticketmaster,
 * Meetup et Schema.org, tout en couvrant les usages qu'ils oublient
 * (écoles, mariages, sorties locales, clubs sportifs, cérémonies privées).
 */

export interface CategorieEvenement {
  id: string;
  nom: string;
  description: string;
  exemples: string[];
  schemaType: string;
}

export const CATEGORIES_EVENEMENT: CategorieEvenement[] = [
  { id: "musique", nom: "Musique & concerts", description: "Toute programmation musicale, live ou enregistrée.", exemples: ["concert", "DJ set", "chorale", "jam", "récital"], schemaType: "MusicEvent" },
  { id: "spectacles", nom: "Spectacles & scène", description: "Ce qui se joue devant un public.", exemples: ["théâtre", "danse", "cirque", "humour", "performance"], schemaType: "PerformingArtsEvent" },
  { id: "cinema", nom: "Cinéma & médias", description: "Images projetées, produites ou discutées.", exemples: ["projection", "avant-première", "ciné-débat", "podcast live", "tournage"], schemaType: "ScreeningEvent" },
  { id: "arts", nom: "Arts & expositions", description: "Œuvres, artistes, patrimoine et design.", exemples: ["exposition", "vernissage", "galerie", "mode", "installation"], schemaType: "ExhibitionEvent" },
  { id: "festivals", nom: "Festivals & grands événements", description: "Programmes multi-activités ou multi-jours.", exemples: ["festival", "salon", "foire", "convention", "carnaval"], schemaType: "Festival" },
  { id: "sport", nom: "Sport & activités physiques", description: "Pratiquer, concourir, supporter ou se remettre en mouvement.", exemples: ["match", "tournoi", "course", "cours de sport", "randonnée"], schemaType: "SportsEvent" },
  { id: "ateliers", nom: "Ateliers & loisirs", description: "Faire, fabriquer, essayer et pratiquer ensemble.", exemples: ["atelier créatif", "bricolage", "jeu", "club", "initiation"], schemaType: "EducationEvent" },
  { id: "formation", nom: "Cours & formation", description: "Apprendre, transmettre et certifier.", exemples: ["cours", "formation", "masterclass", "stage", "webinaire"], schemaType: "EducationEvent" },
  { id: "pro", nom: "Conférences & professionnel", description: "Partager des idées, travailler et créer des opportunités.", exemples: ["conférence", "séminaire", "networking", "congrès", "lancement"], schemaType: "BusinessEvent" },
  { id: "gastronomie", nom: "Gastronomie & dégustations", description: "Cuisiner, goûter, partager et découvrir.", exemples: ["repas", "dégustation", "cours de cuisine", "brunch", "marché"], schemaType: "FoodEvent" },
  { id: "bienetre", nom: "Santé & bien-être", description: "Prévention, soin, équilibre et santé mentale.", exemples: ["yoga", "méditation", "conférence santé", "groupe de parole", "retraite"], schemaType: "Event" },
  { id: "famille", nom: "Enfants & famille", description: "Des événements pensés pour les enfants, parents et proches.", exemples: ["spectacle enfant", "anniversaire", "atelier famille", "conte", "activité parent-enfant"], schemaType: "ChildrensEvent" },
  { id: "sorties", nom: "Sorties & plein air", description: "Découvrir un lieu, un territoire ou la nature.", exemples: ["visite", "balade", "excursion", "voyage", "camp"], schemaType: "Event" },
  { id: "celebrations", nom: "Mariages & célébrations", description: "Les grands moments privés ou familiaux.", exemples: ["mariage", "anniversaire", "baptême", "remise de diplôme", "réunion de famille"], schemaType: "SocialEvent" },
  { id: "communaute", nom: "Communauté & solidarité", description: "Se rencontrer, agir, collecter ou défendre une cause.", exemples: ["collecte", "bénévolat", "réunion citoyenne", "association", "événement caritatif"], schemaType: "SocialEvent" },
  { id: "ecole", nom: "École & jeunesse", description: "Vie scolaire, universitaire et périscolaire.", exemples: ["sortie scolaire", "kermesse", "réunion parents", "orientation", "cérémonie"], schemaType: "EducationEvent" },
  { id: "spiritualite", nom: "Spiritualité & cérémonies", description: "Rituels, pratiques spirituelles et rassemblements religieux.", exemples: ["cérémonie", "office", "méditation", "pèlerinage", "célébration"], schemaType: "Event" },
  { id: "autre", nom: "Autre événement", description: "Pour ce qui n'entre dans aucune case — sans bloquer la création.", exemples: ["événement hybride", "format inédit", "expérimentation"], schemaType: "Event" },
];

export const FORMATS_EVENEMENT = [
  "Concert ou spectacle",
  "Projection",
  "Exposition",
  "Festival ou fête",
  "Atelier",
  "Cours ou formation",
  "Conférence ou débat",
  "Réunion ou networking",
  "Salon ou marché",
  "Match ou compétition",
  "Course ou défi",
  "Visite ou sortie",
  "Voyage ou séjour",
  "Repas ou dégustation",
  "Soirée ou fête privée",
  "Mariage ou cérémonie",
  "Collecte ou action solidaire",
  "Rendez-vous individuel",
] as const;

export const PROFILS_ORGANISATEUR = [
  "Salle de spectacle",
  "Cinéma",
  "Festival",
  "École ou université",
  "Club sportif",
  "Association",
  "Entreprise",
  "Collectivité",
  "Musée ou bibliothèque",
  "Restaurant ou commerce",
  "Artiste ou collectif",
  "Famille ou particulier",
] as const;

export const MODES_PARTICIPATION = ["Sur place", "En ligne", "Hybride"] as const;
export const NIVEAUX_ACCES = ["Ouvert au public", "Sur inscription", "Sur invitation", "Privé"] as const;

export const OBJECTIFS_EVENEMENT = [
  "Divertir",
  "Apprendre",
  "Se rencontrer",
  "Pratiquer",
  "Célébrer",
  "Vendre ou présenter",
  "Collecter ou aider",
  "Informer ou débattre",
] as const;

export const categorieParId = (id: string) =>
  CATEGORIES_EVENEMENT.find((c) => c.id === id) ?? CATEGORIES_EVENEMENT[CATEGORIES_EVENEMENT.length - 1];
