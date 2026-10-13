import { useSyncExternalStore } from "react";
import {
  AIME_ID,
  CONVERSATIONS_INITIALES,
  MISSIONS,
  TRANSACTIONS_INITIALES,
  type Conversation,
  type Transaction,
} from "../data/espace";
import {
  CALENDRIER,
  TOUS_LES_EVENEMENTS,
  UNIVERS,
  type MoisProgramme,
  type PublicId,
  type RendezVous,
} from "../data/annee";
import { cercleStore, solidariteStore } from "./useSetStore";
import { toggleFavori, estFavori } from "./useFavorites";

export type ModePaiement = "carte" | "wallet" | "temps" | "solidaire" | "pass" | "gratuit";

export interface BilletReserve {
  id: string;
  qty: number;
  dateReservation: string;
  modePaiement: ModePaiement;
  montantPaye: number;
  rejointCercle: boolean;
  inviteDuoNom?: string;
  cedeSolidaire?: boolean;
}

export interface PassActif {
  id: string;
  name: string;
  note: string;
  qty: number;
  dateAchat: string;
  creditsRestants?: number;
}

export interface PropositionEvenement {
  event: RendezVous;
  moisId: string;
  categorieId: string;
  organisateur: string;
  mode: string;
  acces: string;
  objectif: string;
  creeLe: string;
}

interface EspaceState {
  role: string;
  billets: BilletReserve[];
  missionsRejointes: string[];
  creations: number;
  heuresConverties: number;
  checkinsBenevole: number;
  transactions: Transaction[];
  passesActifs: PassActif[];
  propositions: PropositionEvenement[];
  conversations: Conversation[];
}

const STORAGE_KEY = "aime-event-espace-v2";

const BILLETS_INITIAUX: BilletReserve[] = [
  {
    id: "07",
    qty: 1,
    dateReservation: "12 fév. 2027",
    modePaiement: "wallet",
    montantPaye: 45,
    rejointCercle: true,
  },
  {
    id: "01",
    qty: 1,
    dateReservation: "18 janv. 2027",
    modePaiement: "temps",
    montantPaye: 0,
    rejointCercle: false,
  },
  {
    id: "17",
    qty: 1,
    dateReservation: "2 fév. 2027",
    modePaiement: "gratuit",
    montantPaye: 0,
    rejointCercle: false,
  },
];

function etatInitial(): EspaceState {
  return {
    role: localStorage.getItem("aime-role") ?? "participe",
    billets: BILLETS_INITIAUX,
    missionsRejointes: ["m1"],
    creations: parseInt(localStorage.getItem("aime-creations") ?? "0", 10) || 0,
    heuresConverties: 0,
    checkinsBenevole: 0,
    transactions: TRANSACTIONS_INITIALES,
    passesActifs: [],
    propositions: [],
    conversations: CONVERSATIONS_INITIALES,
  };
}

function charger(): EspaceState {
  if (typeof window === "undefined") return etatInitial();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return etatInitial();
    const parsed = JSON.parse(raw) as Partial<EspaceState>;
    return {
      ...etatInitial(),
      ...parsed,
      billets: Array.isArray(parsed.billets) && parsed.billets.length > 0 ? parsed.billets : BILLETS_INITIAUX,
      conversations:
        Array.isArray(parsed.conversations) && parsed.conversations.length > 0
          ? parsed.conversations
          : CONVERSATIONS_INITIALES,
      transactions:
        Array.isArray(parsed.transactions) && parsed.transactions.length > 0
          ? parsed.transactions
          : TRANSACTIONS_INITIALES,
      missionsRejointes: Array.isArray(parsed.missionsRejointes) ? parsed.missionsRejointes : ["m1"],
      passesActifs: Array.isArray(parsed.passesActifs) ? parsed.passesActifs : [],
      propositions: Array.isArray(parsed.propositions) ? parsed.propositions : [],
    };
  } catch {
    return etatInitial();
  }
}

let state: EspaceState = charger();
const listeners = new Set<() => void>();

function sauvegarder(next: EspaceState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem("aime-role", next.role);
    localStorage.setItem("aime-missions", JSON.stringify(next.missionsRejointes));
    localStorage.setItem("aime-creations", String(next.creations));
  } catch {
    /* stockage indisponible */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot(): EspaceState {
  return state;
}

/* ————— Actions ————— */

export function changerRoleEspace(role: string) {
  sauvegarder({ ...state, role });
}

export function basculerMissionEspace(missionId: string) {
  const existe = state.missionsRejointes.includes(missionId);
  const missionsRejointes = existe
    ? state.missionsRejointes.filter((id) => id !== missionId)
    : [...state.missionsRejointes, missionId];
  sauvegarder({ ...state, missionsRejointes });
}

export function incrementerCreation() {
  sauvegarder({ ...state, creations: state.creations + 1 });
}

export function rechargerPortefeuille(montant = 50) {
  const tx: Transaction = {
    id: `t-${Date.now()}`,
    libelle: `Recharge portefeuille (+${montant} €)`,
    date: "Aujourd'hui",
    montant,
  };
  sauvegarder({
    ...state,
    transactions: [tx, ...state.transactions],
  });
}

export function envoyerArgentPortefeuille(destinataire: string, montant: number): boolean {
  const soldeActuel = state.transactions.reduce((s, t) => s + t.montant, 0);
  if (!destinataire.trim() || isNaN(montant) || montant <= 0 || montant > soldeActuel) return false;
  const tx: Transaction = {
    id: `t-${Date.now()}`,
    libelle: `Envoi à ${destinataire.trim()}`,
    date: "Aujourd'hui",
    montant: -montant,
  };
  sauvegarder({
    ...state,
    transactions: [tx, ...state.transactions],
  });
  return true;
}

export function convertirHeuresEnEuros(): boolean {
  const heuresValidees = state.missionsRejointes.length * 4 + state.checkinsBenevole * 2;
  const heuresDispo = heuresValidees - state.heuresConverties;
  if (heuresDispo < 4) return false;
  const tx: Transaction = {
    id: `t-${Date.now()}`,
    libelle: "Banque du temps — 4 h converties",
    date: "Aujourd'hui",
    montant: 18,
  };
  sauvegarder({
    ...state,
    heuresConverties: state.heuresConverties + 4,
    transactions: [tx, ...state.transactions],
  });
  return true;
}

export function validerCheckinBenevole(codeBillet: string) {
  const tx: Transaction = {
    id: `t-${Date.now()}`,
    libelle: `Bonus terrain — Check-in (${codeBillet})`,
    date: "Aujourd'hui",
    montant: 5,
  };
  sauvegarder({
    ...state,
    checkinsBenevole: state.checkinsBenevole + 1,
    transactions: [tx, ...state.transactions],
  });
}

/** Synchronise l'adhésion au Cercle Solo avec un salon dédié dans la Messagerie */
export function basculerCercleAvecMessagerie(eventId: string, forcerAjout = false) {
  const tous = getTousLesEvenements();
  const item = tous.find((x) => x.event.id === eventId);
  const dejaDansCercle = cercleStore.has(eventId);

  if (forcerAjout) {
    cercleStore.add(eventId);
  } else {
    cercleStore.toggle(eventId);
  }

  if ((!dejaDansCercle || forcerAjout) && item) {
    const convId = `cercle-${eventId}`;
    const existe = state.conversations.some((c) => c.id === convId);
    if (!existe) {
      const nouvelleConv: Conversation = {
        id: convId,
        nom: `Cercle Solo — ${item.event.nom}`,
        contexte: `${item.mois.nom} · Point RDV : Totem AIME 20 min avant`,
        nonLus: 1,
        reponseAuto:
          "Super ! On se retrouve devant le Totem AIME à l'entrée 20 minutes avant le début. Cherche le bracelet dégradé !",
        messages: [
          {
            id: `m-${Date.now()}-1`,
            deMoi: false,
            texte: `Bienvenue dans le Cercle pour « ${item.event.nom} » (${item.event.jour} à ${item.event.heure}). Vous êtes plusieurs à venir seul·es : on se retrouve 20 min avant devant le Totem lumineux AIME !`,
            heure: "Maintenant",
          },
        ],
      };
      sauvegarder({
        ...state,
        conversations: [nouvelleConv, ...state.conversations],
      });
    }
  }
}

/** Réserver un billet avec choix du mode de paiement (carte, wallet, banque du temps, place solidaire, pass) */
export function reserverBillet(params: {
  event: RendezVous;
  qty: number;
  modePaiement: ModePaiement;
  rejointCercle: boolean;
  inviteDuoNom?: string;
}): { ok: boolean; erreur?: string } {
  const { event, qty, modePaiement, rejointCercle, inviteDuoNom } = params;
  const total = event.prix * qty;
  const soldeActuel = state.transactions.reduce((s, t) => s + t.montant, 0);
  const heuresValidees = state.missionsRejointes.length * 4 + state.checkinsBenevole * 2;
  const heuresDispo = heuresValidees - state.heuresConverties;

  let nouvellesTransactions = [...state.transactions];
  let nouvellesHeuresConverties = state.heuresConverties;
  let nouveauxPasses = [...state.passesActifs];

  if (modePaiement === "wallet") {
    if (soldeActuel < total) {
      return { ok: false, erreur: "Solde AIME Wallet insuffisant." };
    }
    if (total > 0) {
      nouvellesTransactions = [
        {
          id: `t-${Date.now()}`,
          libelle: `Billet — ${event.nom} (×${qty})`,
          date: "Aujourd'hui",
          montant: -total,
        },
        ...nouvellesTransactions,
      ];
    }
  } else if (modePaiement === "temps") {
    if (heuresDispo < 4) {
      return { ok: false, erreur: "Il faut 4 h de mission disponibles dans la Banque du temps." };
    }
    nouvellesHeuresConverties += 4;
    nouvellesTransactions = [
      {
        id: `t-${Date.now()}`,
        libelle: `Banque du temps (4 h) → Billet ${event.nom}`,
        date: "Aujourd'hui",
        montant: 0,
      },
      ...nouvellesTransactions,
    ];
  } else if (modePaiement === "pass") {
    if (nouveauxPasses.length === 0) {
      return { ok: false, erreur: "Aucun Pass actif sur votre compte." };
    }
    nouveauxPasses = nouveauxPasses.map((p, idx) =>
      idx === 0 && typeof p.creditsRestants === "number"
        ? { ...p, creditsRestants: Math.max(0, p.creditsRestants - qty) }
        : p,
    );
  } else if (modePaiement === "carte" && total > 0) {
    nouvellesTransactions = [
      {
        id: `t-${Date.now()}`,
        libelle: `Carte (0 € frais) — ${event.nom} (×${qty})`,
        date: "Aujourd'hui",
        montant: 0,
      },
      ...nouvellesTransactions,
    ];
  }

  const existantIdx = state.billets.findIndex((b) => b.id === event.id);
  let nouveauxBillets: BilletReserve[];
  const billetCree: BilletReserve = {
    id: event.id,
    qty,
    dateReservation: "Aujourd'hui",
    modePaiement: event.prix === 0 ? "gratuit" : modePaiement,
    montantPaye: modePaiement === "carte" || modePaiement === "wallet" ? total : 0,
    rejointCercle,
    inviteDuoNom: inviteDuoNom?.trim() || undefined,
    cedeSolidaire: false,
  };

  if (existantIdx >= 0) {
    nouveauxBillets = state.billets.map((b, i) =>
      i === existantIdx
        ? { ...billetCree, qty: b.qty + qty, inviteDuoNom: billetCree.inviteDuoNom ?? b.inviteDuoNom }
        : b,
    );
  } else {
    nouveauxBillets = [billetCree, ...state.billets];
  }

  if (!estFavori(event.id)) {
    toggleFavori(event.id);
  }

  sauvegarder({
    ...state,
    billets: nouveauxBillets,
    transactions: nouvellesTransactions,
    heuresConverties: nouvellesHeuresConverties,
    passesActifs: nouveauxPasses,
  });

  if (rejointCercle) {
    basculerCercleAvecMessagerie(event.id, true);
  }

  return { ok: true };
}

/** Offrir ou reprendre sa place dans le pot solidaire */
export function basculerPlaceSolidaireBillet(eventId: string) {
  solidariteStore.toggle(eventId);
  const nouveauxBillets = state.billets.map((b) =>
    b.id === eventId ? { ...b, cedeSolidaire: !b.cedeSolidaire } : b,
  );
  sauvegarder({ ...state, billets: nouveauxBillets });
}

/** Enregistrer un nom d'invité Duo sur un billet */
export function definirInviteDuo(eventId: string, nomInvite: string) {
  const nouveauxBillets = state.billets.map((b) =>
    b.id === eventId ? { ...b, inviteDuoNom: nomInvite.trim() || undefined } : b,
  );
  sauvegarder({ ...state, billets: nouveauxBillets });
}

/** Acheter un Pass depuis PageAcces */
export function acheterPass(params: {
  name: string;
  price: number;
  note: string;
  qty: number;
  utiliserWallet: boolean;
}): { ok: boolean; erreur?: string } {
  const total = params.price * params.qty;
  const soldeActuel = state.transactions.reduce((s, t) => s + t.montant, 0);
  if (params.utiliserWallet && total > 0 && soldeActuel < total) {
    return { ok: false, erreur: "Solde AIME Wallet insuffisant pour ce Pass." };
  }

  const nouveauPass: PassActif = {
    id: `pass-${Date.now()}`,
    name: params.name,
    note: params.note,
    qty: params.qty,
    dateAchat: "Aujourd'hui",
    creditsRestants: params.name.includes("CARNET") ? 4 * params.qty : undefined,
  };

  const nouvellesTransactions =
    params.utiliserWallet && total > 0
      ? [
          {
            id: `t-${Date.now()}`,
            libelle: `${params.name} (×${params.qty})`,
            date: "Aujourd'hui",
            montant: -total,
          },
          ...state.transactions,
        ]
      : state.transactions;

  sauvegarder({
    ...state,
    passesActifs: [nouveauPass, ...state.passesActifs],
    transactions: nouvellesTransactions,
  });

  return { ok: true };
}

/** Publier un nouveau rendez-vous depuis l'onglet Proposer (Creer.tsx) */
export function publierProposition(params: {
  nom: string;
  description: string;
  moisNom: string;
  heure: string;
  format: string;
  categorieId: string;
  organisateur: string;
  mode: string;
  acces: string;
  objectif: string;
  publics: PublicId[];
  prix: number;
}): PropositionEvenement {
  const moisObj =
    CALENDRIER.find((m) => m.nom.toLowerCase() === params.moisNom.toLowerCase()) ?? CALENDRIER[2];
  const universObj =
    UNIVERS.find((u) => u.categorieId === params.categorieId) ?? UNIVERS[0];
  const newId = `c${String(33 + state.propositions.length)}`;

  const event: RendezVous = {
    id: newId,
    nom: params.nom.trim(),
    univers: universObj.id,
    jour: "Samedi 20",
    heure: params.heure.trim() || "14 h",
    duree: "2 h",
    format: params.format,
    publics: params.publics.length > 0 ? params.publics : ["famille", "amis", "solo"],
    resume: params.description.trim(),
    prix: params.prix,
    places: 60,
    restantes: 58,
  };

  const prop: PropositionEvenement = {
    event,
    moisId: moisObj.id,
    categorieId: params.categorieId,
    organisateur: params.organisateur,
    mode: params.mode,
    acces: params.acces,
    objectif: params.objectif,
    creeLe: "Aujourd'hui",
  };

  const convOrg: Conversation = {
    id: `org-${newId}`,
    nom: `Coordination — ${event.nom}`,
    contexte: `Organisateur·rice · ${moisObj.nom}`,
    nonLus: 1,
    reponseAuto:
      "Votre rendez-vous est publié dans le calendrier ! Nous préparons la fiche technique et l'accueil.",
    messages: [
      {
        id: `m-${Date.now()}`,
        deMoi: false,
        texte: `Félicitations Camille ! Votre proposition « ${event.nom} » (${params.organisateur}) est publiée en ${moisObj.nom} 2027. Votre attestation d'organisateur·rice et vos kits visuels sont prêts.`,
        heure: "Maintenant",
      },
    ],
  };

  sauvegarder({
    ...state,
    propositions: [prop, ...state.propositions],
    conversations: [convOrg, ...state.conversations],
  });

  if (!estFavori(newId)) {
    toggleFavori(newId);
  }

  return prop;
}

/** Envoyer un message dans une conversation ou créer une alerte Safe Team */
export function envoyerMessageConversation(convId: string, texte: string) {
  const heure = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const msg = { id: `m-${Date.now()}`, deMoi: true, texte, heure };
  const cible = state.conversations.find((c) => c.id === convId);
  if (!cible) return;

  sauvegarder({
    ...state,
    conversations: state.conversations.map((c) =>
      c.id === convId ? { ...c, nonLus: 0, messages: [...c.messages, msg] } : c,
    ),
  });

  setTimeout(() => {
    const heureRep = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    sauvegarder({
      ...state,
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m-${Date.now()}-r`,
                  deMoi: false,
                  texte: c.reponseAuto,
                  heure: heureRep,
                },
              ],
            }
          : c,
      ),
    });
  }, 950);
}

export function marquerConversationLue(convId: string) {
  sauvegarder({
    ...state,
    conversations: state.conversations.map((c) => (c.id === convId ? { ...c, nonLus: 0 } : c)),
  });
}

export function declencherAlerteSafeTeam(zone: string, besoin: string, details?: string) {
  const heure = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const convId = "safe-team-live";
  const texte = `⚡ Signalement Safe Team · Zone : ${zone} · Besoin : ${besoin}${details ? ` (${details})` : ""}`;

  const msgUser = { id: `m-${Date.now()}-u`, deMoi: true, texte, heure };
  const msgTeam = {
    id: `m-${Date.now()}-t`,
    deMoi: false,
    texte: `Bien reçu Camille (ID ${AIME_ID}). Deux membres de la Safe Team (gilet réfléchissant dégradé) arrivent vers « ${zone} » en moins de 2 minutes. Reste où tu es, on veille sur toi.`,
    heure,
  };

  const existante = state.conversations.find((c) => c.id === convId);
  if (existante) {
    sauvegarder({
      ...state,
      conversations: state.conversations.map((c) =>
        c.id === convId
          ? { ...c, nonLus: 1, messages: [...c.messages, msgUser, msgTeam] }
          : c,
      ),
    });
  } else {
    const nouvelle: Conversation = {
      id: convId,
      nom: "Safe Team 18+ · Urgence & Veille",
      contexte: `Intervention directe · ${zone}`,
      nonLus: 1,
      reponseAuto: "Équipe Safe Team en liaison directe. Dis-nous si tu as besoin d'autre chose.",
      messages: [msgUser, msgTeam],
    };
    sauvegarder({
      ...state,
      conversations: [nouvelle, ...state.conversations],
    });
  }
}

/** Retourne le calendrier enrichi avec les propositions de la communauté */
export function getCalendrierComplet(): MoisProgramme[] {
  if (state.propositions.length === 0) return CALENDRIER;
  return CALENDRIER.map((m) => {
    const ajouts = state.propositions.filter((p) => p.moisId === m.id).map((p) => p.event);
    return ajouts.length > 0 ? { ...m, rendezVous: [...m.rendezVous, ...ajouts] } : m;
  });
}

export function getTousLesEvenements(): { event: RendezVous; mois: MoisProgramme; communaute?: PropositionEvenement }[] {
  const base = [...TOUS_LES_EVENEMENTS];
  const ajouts = state.propositions.map((p) => {
    const mois = CALENDRIER.find((m) => m.id === p.moisId) ?? CALENDRIER[0];
    return { event: p.event, mois, communaute: p };
  });
  return [...base, ...ajouts];
}

/** Hook principal de l'écosystème AIME EVENT */
export function useEspaceStore() {
  const s = useSyncExternalStore(subscribe, getSnapshot, etatInitial);

  const solde = s.transactions.reduce((acc, t) => acc + t.montant, 0);
  const heuresValidees = s.missionsRejointes.length * 4 + s.checkinsBenevole * 2;
  const heuresDisponibles = Math.max(0, heuresValidees - s.heuresConverties);
  const points =
    180 +
    MISSIONS.filter((m) => s.missionsRejointes.includes(m.id)).reduce((acc, m) => acc + m.points, 0) +
    s.creations * 15 +
    s.propositions.length * 30 +
    s.checkinsBenevole * 10;

  const niveau =
    points < 260 ? "Découverte" : points < 420 ? "Exploratrice" : points < 600 ? "Passeuse" : "Ambassadrice";

  const totalNonLus = s.conversations.reduce((acc, c) => acc + c.nonLus, 0);

  return {
    ...s,
    solde,
    heuresValidees,
    heuresDisponibles,
    points,
    niveau,
    totalNonLus,
    calendrierComplet: getCalendrierComplet(),
    tousLesEvenements: getTousLesEvenements(),
  };
}

export { cercleStore, solidariteStore };
