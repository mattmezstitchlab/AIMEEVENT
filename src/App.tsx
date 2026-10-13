import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Camera,
  Clapperboard,
  Plus,
} from "lucide-react";
import HeroVideo from "./components/HeroVideo";
import ModalReservation from "./components/ModalReservation";
import PageMois from "./components/PageMois";
import PageEspace from "./components/PageEspace";
import PageAcces from "./components/PageAcces";
import CommandPalette from "./components/CommandPalette";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import StructuredData from "./components/StructuredData";
import ModeJourJ from "./components/ModeJourJ";
import { Reveal } from "./components/Reveal";
import { CALENDRIER, UNIVERS_PAR_ID, type PublicId, type RendezVous } from "./data/annee";
import { sensorielDe } from "./data/innovations";
import { useEspaceStore } from "./hooks/useEspaceStore";

type PageId = "accueil" | "mois" | "acces" | "espace";

function parserHash(): { page: PageId; mois?: string; onglet?: string } {
  if (typeof window === "undefined") return { page: "accueil" };
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h || h === "top" || h === "programme" || h === "roles" || h === "faq")
    return { page: "accueil" };
  if (h === "acces") return { page: "acces" };
  if (h.startsWith("mois/")) {
    const m = h.split("/")[1];
    return { page: "mois", mois: m || "mars" };
  }
  if (h.startsWith("espace")) {
    const o = h.split("/")[1];
    return { page: "espace", onglet: o || "apercu" };
  }
  return { page: "accueil" };
}

export default function App() {
  const initRoute = parserHash();
  const [page, setPage] = useState<PageId>(initRoute.page);
  const [moisActif, setMoisActif] = useState<string>(initRoute.mois ?? "mars");
  const [espaceOnglet, setEspaceOnglet] = useState(initRoute.onglet ?? "apercu");
  const [modal, setModal] = useState<{ name: string; price: number; note: string } | null>(null);
  const [reserve, setReserve] = useState<RendezVous | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [jourJOpen, setJourJOpen] = useState(false);

  // Filtres du Hero (Mois, Publics, Entrée libre, Calme, Recherche directe)
  const [moisFiltre, setMoisFiltre] = useState<string>("tous");
  const [publicFiltre, setPublicFiltre] = useState<PublicId | "tous">("tous");
  const [gratuitUniquement, setGratuitUniquement] = useState(false);
  const [calmeUniquement, setCalmeUniquement] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { calendrierComplet } = useEspaceStore();

  const allerAccueil = () => {
    setPage("accueil");
    if (
      window.location.hash &&
      !["#programme", "#roles", "#faq"].includes(window.location.hash)
    ) {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  const ouvrirMois = (id: string) => {
    setMoisActif(id);
    setPage("mois");
    window.history.pushState(null, "", `#mois/${id}`);
  };

  const ouvrirEspace = (onglet = "apercu") => {
    setEspaceOnglet(onglet);
    setPage("espace");
    window.history.pushState(null, "", `#espace/${onglet}`);
  };

  const ouvrirAcces = () => {
    setPage("acces");
    window.history.pushState(null, "", "#acces");
  };

  /* Synchronisation bouton Précédent / Suivant du navigateur */
  useEffect(() => {
    const onHashOrPop = () => {
      const r = parserHash();
      setPage(r.page);
      if (r.mois) setMoisActif(r.mois);
      if (r.onglet) setEspaceOnglet(r.onglet);
    };
    window.addEventListener("popstate", onHashOrPop);
    window.addEventListener("hashchange", onHashOrPop);
    return () => {
      window.removeEventListener("popstate", onHashOrPop);
      window.removeEventListener("hashchange", onHashOrPop);
    };
  }, []);

  /* Slides du Hero synchronisés avec le filtre de mois, public, gratuité, calme et saisie de recherche */
  const slidesAccueil = useMemo(() => {
    const source = calendrierComplet.length > 0 ? calendrierComplet : CALENDRIER;
    const q = searchQuery.trim().toLowerCase();
    const tous: {
      event: RendezVous;
      moisId: string;
      moisNom: string;
      surtitre: string;
    }[] = [];

    source.forEach((mois) => {
      if (moisFiltre !== "tous" && mois.id !== moisFiltre) return;
      mois.rendezVous.forEach((ev) => {
        if (publicFiltre !== "tous" && !ev.publics.includes(publicFiltre)) return;
        if (gratuitUniquement && ev.prix !== 0) return;
        if (calmeUniquement) {
          const s = sensorielDe(ev.id);
          if (s.bruit > 2 && !s.salleCalme) return;
        }
        if (q) {
          const u = UNIVERS_PAR_ID[ev.univers]?.nom ?? "";
          const hay = `${ev.nom} ${ev.format} ${ev.resume} ${mois.nom} ${u}`.toLowerCase();
          if (!hay.includes(q)) return;
        }
        tous.push({
          event: ev,
          moisId: mois.id,
          moisNom: mois.nom,
          surtitre: `${mois.nom} 2027 · ${UNIVERS_PAR_ID[ev.univers]?.nom ?? "Univers"}`,
        });
      });
    });

    if (tous.length > 0) return tous;

    return source.map((mois) => ({
      event: mois.rendezVous[0],
      moisId: mois.id,
      moisNom: mois.nom,
      surtitre: `${mois.nom} 2027 · ${UNIVERS_PAR_ID[mois.rendezVous[0].univers]?.nom ?? "Univers"}`,
    }));
  }, [
    calendrierComplet,
    moisFiltre,
    publicFiltre,
    gratuitUniquement,
    calmeUniquement,
    searchQuery,
  ]);

  useEffect(() => {
    document.body.style.overflow =
      modal || paletteOpen || jourJOpen || reserve ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal, paletteOpen, jourJOpen, reserve]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (page !== "accueil") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [page, moisActif]);

  /* ————— Superpositions communes & Dock universel ————— */
  const overlays = (
    <>
      <ScrollProgress />
      <CustomCursor />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenMonth={ouvrirMois}
        onAcces={ouvrirAcces}
        onEspace={ouvrirEspace}
        onReserve={setReserve}
        onOpenJourJ={() => setJourJOpen(true)}
      />
      <ModeJourJ
        open={jourJOpen}
        onClose={() => setJourJOpen(false)}
        onOpenMessages={() => ouvrirEspace("messages")}
      />
      <ModalReservation
        event={reserve}
        onClose={() => setReserve(null)}
        onEspace={(tab) => ouvrirEspace(tab ?? "billets")}
      />
    </>
  );

  /* ————— PAGE MOIS ————— */
  if (page === "mois") {
    return (
      <>
        <PageMois
          moisId={moisActif}
          onRetour={allerAccueil}
          onAcces={ouvrirAcces}
          onEspace={(tab) => ouvrirEspace(tab ?? "billets")}
          onChangeMonth={ouvrirMois}
          onSearch={() => setPaletteOpen(true)}
        />
        {overlays}
      </>
    );
  }

  /* ————— PAGE ACCÈS ————— */
  if (page === "acces") {
    return (
      <>
        <PageAcces
          onRetour={allerAccueil}
          onEspace={(tab) => ouvrirEspace(tab ?? "billets")}
          modal={modal}
          setModal={setModal}
        />
        {overlays}
      </>
    );
  }

  /* ————— PAGE ESPACE UNIVERSEL ————— */
  if (page === "espace") {
    return (
      <>
        <PageEspace
          onRetour={allerAccueil}
          onAcces={ouvrirAcces}
          onOpenMonth={ouvrirMois}
          onOpenJourJ={() => setJourJOpen(true)}
          onSearch={() => setPaletteOpen(true)}
          initialTab={espaceOnglet}
        />
        {overlays}
      </>
    );
  }

  /* ————— PAGE D'ACCUEIL ————— */
  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] antialiased">
      <StructuredData />

      <main id="top">
        {/* ═══════════ HERO — Carrousel de Tickets Carrés Blancs synchronisé avec la vidéo & les filtres ═══════════ */}
        <HeroVideo
          slides={slidesAccueil}
          onReserve={setReserve}
          onEspace={() => ouvrirEspace("participe")}
          moisFiltre={moisFiltre}
          onChangeMoisFiltre={setMoisFiltre}
          publicFiltre={publicFiltre}
          onChangePublicFiltre={setPublicFiltre}
          gratuitUniquement={gratuitUniquement}
          onToggleGratuit={() => setGratuitUniquement((v) => !v)}
          calmeUniquement={calmeUniquement}
          onToggleCalme={() => setCalmeUniquement((v) => !v)}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
        />

        {/* ═══════════ FAQ ÉDITORIALE ═══════════ */}
        <section
          id="faq"
          className="scroll-mt-20 bg-black px-[5vw] py-20 md:px-10 md:py-28"
          aria-label="Questions fréquentes"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <Reveal>
                <h2 className="font-display text-[clamp(2rem,4.2vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.035em] text-white">
                  Questions{" "}
                  <span className="text-white/45">fréquentes.</span>
                </h2>
              </Reveal>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {[
                {
                  q: "Qu'est-ce qu'AIME Event ?",
                  a: "Une plateforme universelle pour découvrir, réserver, organiser et accompagner tous les événements d'une saison culturelle ou citoyenne, sans aucun frais de billetterie.",
                },
                {
                  q: "Comment fonctionnent le Passeport sensoriel et Le Cercle ?",
                  a: "Chaque rendez-vous indique son ambiance sonore et lumineuse réelle. Si vous venez seul·e, vous pouvez activer Le Cercle en un clic lors de la réservation pour rejoindre un petit groupe bienveillant 20 minutes avant l'ouverture.",
                },
                {
                  q: "Comment réserver ou utiliser la Banque du temps ?",
                  a: "Vous réservez à la carte en un clic (0 € de frais), avec votre solde AIME Wallet, ou en convertissant 4 heures de bénévolat en une place offerte.",
                },
                {
                  q: "Puis-je proposer un événement ou créer une affiche ?",
                  a: "Oui. Depuis Mon Espace, l'onglet « J'organise » permet de publier un rendez-vous et de suivre l'émargement en direct, et l'onglet « Je crée » génère vos affiches officielles en haute définition.",
                },
              ].map((f, i) => (
                <FaqItem key={f.q} {...f} delay={i * 50} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════ PIED DE PAGE ÉPURÉ ═══════════ */}
      <footer
        className="border-t border-white/10 bg-[#050507] pb-28 pt-12"
        aria-label="Pied de page"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-[5vw] text-xs text-white/45 md:px-10">
          <button
            onClick={allerAccueil}
            className="font-display text-sm font-bold tracking-tight text-white"
          >
            AIME EVENT
          </button>
          <p>© 2027 · 0 € de frais de service</p>
          <div className="flex items-center gap-2">
            {[Camera, AtSign, Clapperboard].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Réseau social"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/30 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {overlays}
    </div>
  );
}

/* ————— Accordéon FAQ ————— */
function FaqItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={delay}>
      <div className="py-5">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-6 text-left"
        >
          <span className="font-display text-lg font-semibold tracking-[-0.015em] text-white md:text-xl">
            {q}
          </span>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] transition-all duration-300 ${
              open ? "rotate-45 bg-white text-black" : "text-white/70"
            }`}
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
        <div
          className={`grid transition-all duration-500 ease-out ${
            open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <p className="max-w-2xl text-[14.5px] leading-relaxed text-white/60">{a}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
