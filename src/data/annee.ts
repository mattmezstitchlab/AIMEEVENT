export type PublicId = "famille" | "ados" | "amis" | "duo" | "55plus" | "solo";

export interface Univers {
  id: string;
  nom: string;
  domaine: string;
  categorieId: string;
  image: string;
  video: string;
  alt: string;
}

export interface RendezVous {
  id: string;
  nom: string;
  univers: string;
  jour: string;
  heure: string;
  duree: string;
  format: string;
  publics: PublicId[];
  resume: string;
  /** 0 = gratuit sur inscription, sinon prix en euros */
  prix: number;
  places: number;
  restantes: number;
}

export interface MoisProgramme {
  id: string;
  nom: string;
  edition: string;
  rendezVous: RendezVous[];
}

const photo = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2200`;

const TOUS: PublicId[] = ["famille", "ados", "amis", "duo", "55plus", "solo"];

export const UNIVERS: Univers[] = [
  {
    id: "eveil", nom: "Santé & bien-être", domaine: "Yoga, méditation, prévention", categorieId: "bienetre",
    image: photo("8436728"),
    video: "https://videos.pexels.com/video-files/6246041/6246041-uhd_4096_2160_25fps.mp4",
    alt: "Pratique de yoga et d'écoute collective",
  },
  {
    id: "forge", nom: "Ateliers & loisirs", domaine: "Créer, fabriquer, apprendre", categorieId: "ateliers",
    image: photo("15096484"),
    video: "https://videos.pexels.com/video-files/6692630/6692630-uhd_4096_2160_25fps.mp4",
    alt: "Mains façonnant l'argile sur un tour",
  },
  {
    id: "sommet", nom: "Festivals & grands événements", domaine: "Programmation multi-formats", categorieId: "festivals",
    image: photo("38780313"),
    video: "https://videos.pexels.com/video-files/38892281/16537162_3840_2160_30fps.mp4",
    alt: "Foule réunie sous les lumières d'un grand événement",
  },
  {
    id: "table", nom: "Gastronomie & dégustations", domaine: "Cuisine, repas, marchés", categorieId: "gastronomie",
    image: photo("4253315"),
    video: "https://videos.pexels.com/video-files/39498947/16826521_3840_2160_50fps.mp4",
    alt: "Chef préparant un plat en cuisine",
  },
  {
    id: "vivant", nom: "Sorties & plein air", domaine: "Nature, visites, excursions", categorieId: "sorties",
    image: photo("7728121"),
    video: "https://videos.pexels.com/video-files/35575737/15076545_3840_2160_30fps.mp4",
    alt: "Végétation verte en gros plan",
  },
  {
    id: "corps", nom: "Sport & activités physiques", domaine: "Pratique, tournoi, mouvement", categorieId: "sport",
    image: photo("19629397"),
    video: "https://videos.pexels.com/video-files/26491563/11954344_3840_2160_24fps.mp4",
    alt: "Danseurs en mouvement sur scène",
  },
  {
    id: "nuit", nom: "Musique & concerts", domaine: "Concerts, DJ sets, vie nocturne", categorieId: "musique",
    image: photo("11858855"),
    video: "https://videos.pexels.com/video-files/5004222/5004222-uhd_3840_2160_24fps.mp4",
    alt: "Ciel étoilé en timelapse",
  },
  {
    id: "enfance", nom: "Enfants & famille", domaine: "Jeux, spectacles, activités famille", categorieId: "famille",
    image: photo("8033884"),
    video: "https://videos.pexels.com/video-files/5789826/5789826-uhd_4096_2160_25fps.mp4",
    alt: "Enfants en atelier créatif",
  },
  {
    id: "voix", nom: "Conférences & rencontres", domaine: "Débats, littérature, networking", categorieId: "pro",
    image: photo("1132577"),
    video: "https://videos.pexels.com/video-files/8244203/8244203-uhd_3840_2160_25fps.mp4",
    alt: "Prise de parole sur scène",
  },
  {
    id: "image", nom: "Cinéma & médias", domaine: "Projections, médias, création", categorieId: "cinema",
    image: photo("7991318"),
    video: "https://videos.pexels.com/video-files/7668580/7668580-uhd_3840_2160_25fps.mp4",
    alt: "Projecteur de cinéma en fonctionnement",
  },
  {
    id: "savoir", nom: "Cours & formation", domaine: "Éducation, sciences, transmission", categorieId: "formation",
    image: photo("8917903"),
    video: "https://videos.pexels.com/video-files/32402591/13822273_3840_2160_25fps.mp4",
    alt: "Observation scientifique au microscope",
  },
  {
    id: "feu", nom: "Mariages & célébrations", domaine: "Fêtes, cérémonies, événements privés", categorieId: "celebrations",
    image: photo("19883421"),
    video: "https://videos.pexels.com/video-files/34192632/14493108_3840_2160_24fps.mp4",
    alt: "Feu d'artifice dans la nuit",
  },
];

export const UNIVERS_PAR_ID = Object.fromEntries(UNIVERS.map((u) => [u.id, u])) as Record<string, Univers>;

export const PROFILS: { id: PublicId; label: string }[] = [
  { id: "famille", label: "En famille" },
  { id: "ados", label: "Avec des ados" },
  { id: "amis", label: "Entre amis" },
  { id: "duo", label: "À deux" },
  { id: "55plus", label: "55+" },
  { id: "solo", label: "Seul·e" },
];

const rdv = (
  id: string, nom: string, univers: string, jour: string, heure: string, duree: string,
  format: string, publics: PublicId[], resume: string, prix: number, places: number, restantes: number,
): RendezVous => ({ id, nom, univers, jour, heure, duree, format, publics, resume, prix, places, restantes });

export const CALENDRIER: MoisProgramme[] = [
  {
    id: "janvier", nom: "Janvier", edition: "L'hiver ouvre l'écoute",
    rendezVous: [
      rdv("01", "Bain sonore", "eveil", "Samedi 11", "17 h", "1 h 15", "Immersion", ["duo", "55plus", "solo"], "Une traversée sonore pour ralentir et commencer l'année autrement. Allongé, sans rien faire d'autre qu'écouter.", 18, 60, 12),
      rdv("02", "Lecture à voix haute", "voix", "Vendredi 10", "19 h", "1 h", "Lecture", ["55plus", "duo", "solo"], "Des textes choisis, lus et partagés autour d'un verre. On vient écouter ou lire, au choix.", 0, 45, 20),
      rdv("03", "Planétarium des idées", "savoir", "Dimanche 12", "15 h", "1 h 30", "Rencontre", ["famille", "ados", "55plus", "solo"], "Une conversation à hauteur d'étoiles, accessible aux curieux de tous âges. Aucune connaissance requise.", 12, 90, 34),
    ],
  },
  {
    id: "fevrier", nom: "Février", edition: "Mains en mouvement",
    rendezVous: [
      rdv("04", "Repair café", "forge", "Samedi 7", "10 h", "3 h", "Atelier", TOUS, "Réparer, apprendre et transmettre autour d'objets du quotidien. Apportez ce qui est cassé.", 0, 40, 9),
      rdv("05", "Village des jeux", "enfance", "Samedi 7", "14 h", "4 h", "Jeu", ["famille", "ados"], "Jeux libres, défis créatifs et découvertes à partager. Entrée et sortie libres tout l'après-midi.", 0, 150, 88),
      rdv("06", "Scène ouverte", "voix", "Vendredi 6", "20 h", "2 h 30", "Scène", ["ados", "amis", "solo"], "Micro ouvert aux voix, textes et histoires qui cherchent leur public. Inscription sur place possible.", 8, 80, 26),
    ],
  },
  {
    id: "mars", nom: "Mars", edition: "Tous les mondes se croisent",
    rendezVous: [
      rdv("07", "Le Sommet", "sommet", "Samedi 14", "11 h – 23 h", "12 h", "Rencontres", TOUS, "Une journée où les univers se répondent et où chacun compose son parcours. Le temps fort de la saison.", 45, 800, 142),
      rdv("08", "Battle de danses", "corps", "Samedi 14", "16 h", "2 h", "Danse", ["ados", "amis", "famille"], "Des crews de générations et de styles différents se retrouvent sur la piste. Public bienvenu.", 0, 200, 61),
      rdv("09", "Ciné-débat", "image", "Dimanche 15", "17 h", "2 h 30", "Projection", ["ados", "amis", "duo", "55plus", "solo"], "Un film, puis une conversation ouverte avec celles et ceux qui l'ont fait.", 9, 120, 48),
    ],
  },
  {
    id: "avril", nom: "Avril", edition: "À table, ensemble",
    rendezVous: [
      rdv("10", "Grandes tablées", "table", "Samedi 11", "12 h", "3 h", "Repas partagé", TOUS, "Une grande table, des recettes transmises et des places pour les inconnus. On apporte ou on contribue.", 22, 120, 31),
      rdv("11", "Lab du vivant", "vivant", "Samedi 11", "15 h", "2 h", "Expérience", ["famille", "ados", "55plus", "solo"], "Observer, manipuler et s'émerveiller devant le vivant à toutes les échelles.", 0, 50, 14),
      rdv("12", "Club du vendredi", "nuit", "Vendredi 10", "22 h", "5 h", "Musique", ["amis", "duo", "solo"], "Une nuit en mouvement, du groove lent aux premières lueurs du jour.", 16, 300, 97),
    ],
  },
  {
    id: "mai", nom: "Mai", edition: "Dehors, le monde",
    rendezVous: [
      rdv("13", "Cuisine lente", "eveil", "Samedi 9", "14 h", "3 h", "Atelier", ["famille", "duo", "55plus", "solo"], "Cuisiner ensemble, prendre son temps et repartir avec une recette et ce qu'on a préparé.", 25, 24, 6),
      rdv("14", "Nuit à la belle étoile", "vivant", "Samedi 9", "21 h", "4 h", "Veillée", TOUS, "Une veillée d'écoute et de récits tournée vers le vivant, jusqu'au bout de la nuit.", 0, 100, 52),
      rdv("15", "Brunch en musique", "table", "Dimanche 10", "11 h", "3 h", "Brunch", ["famille", "duo", "55plus", "solo"], "Un brunch ouvert, accompagné d'un concert acoustique tout en douceur.", 19, 90, 23),
    ],
  },
  {
    id: "juin", nom: "Juin", edition: "Corps libres",
    rendezVous: [
      rdv("16", "Queer rave", "corps", "Vendredi 5", "23 h", "6 h", "Nuit", ["amis", "duo", "solo"], "Une nuit de danse, de liberté et de célébration des identités.", 14, 400, 118),
      rdv("17", "Chorale ouverte", "voix", "Dimanche 7", "11 h", "1 h 30", "Pratique collective", TOUS, "Pas besoin de savoir chanter : on apprend les voix ensemble, en une matinée.", 0, 70, 29),
      rdv("18", "Rituel de saison", "feu", "Dimanche 7", "16 h", "2 h", "Rassemblement", TOUS, "Un moment collectif pour marquer le passage vers l'été.", 0, 250, 140),
    ],
  },
  {
    id: "juillet", nom: "Juillet", edition: "La nuit nous appartient",
    rendezVous: [
      rdv("19", "Cinéma de minuit", "nuit", "Vendredi 10", "23 h", "2 h 30", "Projection", ["ados", "amis", "duo", "solo"], "Une séance nocturne suivie d'un échange avec l'équipe du film.", 9, 110, 37),
      rdv("20", "Sunrise ambient", "nuit", "Samedi 11", "5 h", "2 h", "Concert", ["amis", "duo", "solo"], "Un concert à l'aube pour finir la nuit sans la brusquer.", 12, 150, 64),
      rdv("21", "Kids Lab", "enfance", "Dimanche 12", "14 h", "2 h", "Atelier", ["famille"], "Un atelier de jeu et d'invention conçu pour les plus jeunes, accompagnés d'un adulte.", 0, 30, 8),
    ],
  },
  {
    id: "aout", nom: "Août", edition: "Récits à partager",
    rendezVous: [
      rdv("22", "Dîner-spectacle", "table", "Samedi 8", "19 h", "3 h", "Spectacle", ["famille", "duo", "55plus", "solo"], "Un repas traversé par des histoires, des chansons et des surprises.", 38, 80, 17),
      rdv("23", "Parade de clôture", "enfance", "Dimanche 9", "16 h", "2 h", "Parade", TOUS, "Une parade conçue avec les participants de l'édition. Costumes bienvenus.", 0, 400, 260),
    ],
  },
  {
    id: "septembre", nom: "Septembre", edition: "La rentrée prend la parole",
    rendezVous: [
      rdv("24", "Battle de luthiers", "forge", "Samedi 12", "17 h", "2 h", "Performance", ["ados", "amis", "duo", "solo"], "Des instruments fabriqués et joués en direct, dans un défi amical.", 11, 130, 55),
      rdv("25", "Slam battle", "voix", "Samedi 12", "20 h", "2 h 30", "Scène", ["ados", "amis", "solo"], "Des textes originaux, une scène ouverte et un public qui choisit le gagnant.", 8, 140, 72),
    ],
  },
  {
    id: "octobre", nom: "Octobre", edition: "L'image en mouvement",
    rendezVous: [
      rdv("26", "Game jam ouverte", "image", "Samedi 10", "14 h", "8 h", "Création", ["ados", "amis", "solo"], "Créer un petit jeu vidéo en équipe, puis le faire essayer au public. Débutants acceptés.", 0, 60, 19),
      rdv("27", "Forum image & jeux", "savoir", "Dimanche 11", "11 h", "4 h", "Rencontre", ["ados", "amis", "55plus", "solo"], "Professionnels et curieux croisent leurs regards sur les images de demain.", 15, 200, 86),
    ],
  },
  {
    id: "novembre", nom: "Novembre", edition: "La curiosité en partage",
    rendezVous: [
      rdv("28", "Université populaire", "savoir", "Samedi 14", "10 h 30", "3 h", "Conférence", ["ados", "duo", "55plus", "solo"], "Une grande question, plusieurs points de vue et aucune connaissance préalable requise.", 0, 180, 95),
      rdv("29", "Grand bal", "corps", "Samedi 14", "20 h", "4 h", "Bal", TOUS, "Un bal ouvert aux débutants, aux habitués et à toutes les générations. Initiation à 19 h 30.", 14, 300, 123),
    ],
  },
  {
    id: "decembre", nom: "Décembre", edition: "L'année se retrouve",
    rendezVous: [
      rdv("30", "Best-of de la saison", "sommet", "Vendredi 11", "19 h", "3 h", "Rétrospective", TOUS, "Les moments choisis par le public reviennent sur scène, en images et en musique.", 20, 350, 104),
      rdv("31", "Réveillon des univers", "feu", "Samedi 12", "22 h", "6 h", "Célébration", ["amis", "duo", "55plus", "solo"], "Une fin d'année festive, traversée de clins d'œil aux univers rencontrés.", 42, 400, 76),
      rdv("32", "Chœur de clôture", "voix", "Dimanche 13", "16 h", "1 h 30", "Chant collectif", TOUS, "Un dernier chant pour refermer la saison ensemble, sans prérequis musical.", 0, 200, 118),
    ],
  },
];

/** Liste plate des 32 rendez-vous, avec leur mois, pour la recherche et l'export calendrier */
export const TOUS_LES_EVENEMENTS: { event: RendezVous; mois: MoisProgramme }[] =
  CALENDRIER.flatMap((mois) => mois.rendezVous.map((event) => ({ event, mois })));

export const trouverMoisDeEvenement = (eventId: string): MoisProgramme | undefined =>
  CALENDRIER.find((m) => m.rendezVous.some((r) => r.id === eventId));

export const PASSES = [
  { name: "PASS SAISON", price: "490 €", note: "Toute la programmation", feats: ["Accès aux 25 jours d'édition", "Fil rouge illimité", "Transfert 4 fois / an", "Invitations duos"], star: true },
  { name: "CARNET 4 RENDEZ-VOUS", price: "190 €", note: "À la carte", feats: ["4 rendez-vous au choix", "Transférable", "Jusqu'à −35 % vs plein tarif"], star: false },
  { name: "PASS ÂGES", price: "0 – 29 €", note: "Selon l'âge", feats: ["0–12 ans : dimanche gratuit", "Ados : 19 € / rendez-vous", "55+ : tarif ados"], star: false },
];
