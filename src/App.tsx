import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, AtSign, Camera, Clapperboard, Command, FileText, Heart, ImagePlus, Menu, Plus, Search, Ticket, X } from "lucide-react";
import HeroVideo from "./components/HeroVideo";
import ModalReservation from "./components/ModalReservation";
import PageMois from "./components/PageMois";
import PageEspace from "./components/PageEspace";
import ProgrammeAnnuel from "./components/ProgrammeAnnuel";
import PageAcces from "./components/PageAcces";
import CommandPalette from "./components/CommandPalette";
import CustomCursor from "./components/CustomCursor";
import FavoritesTray from "./components/FavoritesTray";
import ScrollProgress from "./components/ScrollProgress";
import StructuredData from "./components/StructuredData";
import { Reveal } from "./components/Reveal";
import { CALENDRIER, UNIVERS_PAR_ID, type RendezVous } from "./data/annee";

/* ————————————————————————— NAV ————————————————————————— */

const NAV = [
  { label: "Calendrier", id: "programme" },
  { label: "FAQ", id: "faq" },
];

/* ————————————————————————— APP ————————————————————————— */

export default function App() {
  const [page, setPage] = useState<"accueil" | "mois" | "acces" | "espace">("accueil");
  const [moisActif, setMoisActif] = useState<string>("mars");
  const [espaceOnglet, setEspaceOnglet] = useState("apercu");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<{ name: string; price: number; note: string } | null>(null);
  const [reserve, setReserve] = useState<RendezVous | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const ouvrirMois = (id: string) => {
    setMoisActif(id);
    setPage("mois");
  };

  const ouvrirEspace = (onglet = "apercu") => {
    setEspaceOnglet(onglet);
    setPage("espace");
  };

  /* Un rendez-vous phare par mois, pour la rotation du hero */
  const slidesAccueil = useMemo(
    () => CALENDRIER.map((mois) => ({
      event: mois.rendezVous[0],
      surtitre: `À venir · ${mois.nom} 2027 · ${UNIVERS_PAR_ID[mois.rendezVous[0].univers].nom}`,
    })),
    [],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || modal || paletteOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, modal, paletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
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
  }, [page]);

  /* ————— Superpositions communes. Le plateau « Mon programme » n'a pas de sens dans l'Espace,
     où l'onglet Mes billets fait déjà ce travail. ————— */
  const overlays = (
    <>
      <ScrollProgress />
      <CustomCursor />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onOpenMonth={ouvrirMois} onAcces={() => setPage("acces")} />
      {page !== "espace" && <FavoritesTray onOpenMonth={ouvrirMois} />}
    </>
  );

  /* ————— PAGE MOIS ————— */
  if (page === "mois") {
    return (
      <>
        <PageMois moisId={moisActif} onRetour={() => setPage("accueil")} onAcces={() => setPage("acces")} onEspace={() => ouvrirEspace("billets")} />
        {overlays}
      </>
    );
  }

  /* ————— PAGE ACCÈS ————— */
  if (page === "acces") {
    return (
      <>
        <PageAcces onRetour={() => setPage("accueil")} modal={modal} setModal={setModal} />
        {overlays}
      </>
    );
  }

  /* ————— PAGE ESPACE UNIVERSEL ————— */
  if (page === "espace") {
    return (
      <>
        <PageEspace onRetour={() => setPage("accueil")} onAcces={() => setPage("acces")} initialTab={espaceOnglet} />
        {overlays}
      </>
    );
  }

  /* ————— PAGE D'ACCUEIL ————— */
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <StructuredData />
      <a href="#top" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-black">
        Aller au contenu
      </a>
      {/* ═══════════ NAV ═══════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/75 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"}`}>
        <nav className="flex h-[68px] md:h-[76px] items-center justify-between px-[5vw] md:px-[2.6vw]" aria-label="Navigation principale">
          <button onClick={() => setPage("accueil")} className="group flex items-baseline gap-1.5" aria-label="Accueil AIME EVENT">
            <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] leading-none text-white">AIME</span>
            <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] leading-none text-event-gradient">EVENT</span>
            <sup className="text-[9px] text-white/40 font-medium -translate-y-1">®</sup>
          </button>
          <div className="hidden lg:flex items-center gap-8 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
            {NAV.map((l) => (
              <a key={l.label} href={`#${l.id}`} className="relative transition-colors duration-300 hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-event-gradient after:transition-all after:duration-300 hover:after:w-full">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              data-cursor="Chercher"
              className="hidden items-center gap-2 rounded-full border border-white/12 px-3.5 py-2 text-[11px] font-semibold text-white/50 transition hover:border-white/30 hover:text-white md:flex"
              aria-label="Recherche rapide (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex items-center gap-1 rounded border border-white/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]">
                <Command className="h-2.5 w-2.5" />K
              </span>
            </button>
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-event-gradient animate-pulse-dot" />
              Saison 2027
            </div>
            <button onClick={() => setPage("acces")} className="group hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-black transition-all duration-300 hover:bg-event-gradient hover:text-white hover:shadow-[0_8px_32px_-8px_rgba(255,78,107,0.6)]">
              Accès
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => ouvrirEspace()}
              data-cursor="Mon espace"
              className="group hidden items-center gap-2.5 rounded-full border border-white/20 py-1.5 pl-1.5 pr-4 transition hover:border-white/50 sm:inline-flex"
              aria-label="Ouvrir mon espace"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-event-gradient font-display text-[10px] font-extrabold text-white">CR</span>
              <span className="text-[11.5px] font-bold uppercase tracking-[0.12em]">Mon espace</span>
            </button>
            <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-black">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Menu mobile */}
      <div className={`fixed inset-0 z-[60] flex flex-col bg-black transition-all duration-500 lg:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute -bottom-32 -right-20 h-[420px] w-[420px] rounded-full bg-[#ff4e6b]/20 blur-[130px]" />
        <div className="flex h-[68px] items-center justify-between px-[5vw]">
          <span className="font-display text-lg font-extrabold tracking-tight">AIME <span className="text-event-gradient">EVENT</span></span>
          <button onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:bg-white hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-[7vw] pt-6">
          <button
            onClick={() => { setMenuOpen(false); setPaletteOpen(true); }}
            className="flex w-full items-center gap-2.5 rounded-full border border-white/15 px-4 py-3 text-[13px] font-semibold text-white/60 transition hover:border-white/35 hover:text-white"
          >
            <Search className="h-4 w-4" /> Chercher un rendez-vous…
          </button>
          <button
            onClick={() => { setMenuOpen(false); ouvrirEspace(); }}
            className="mt-2 flex w-full items-center gap-2.5 rounded-full border border-white/15 px-4 py-3 text-[13px] font-semibold text-white transition hover:border-white/35"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-event-gradient font-display text-[8.5px] font-extrabold">CR</span>
            Mon espace — Camille
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 px-[7vw]">
          {[...NAV, { label: "Accès", id: "" }].map((l, i) => (
            <a
              key={l.label}
              href={l.id ? `#${l.id}` : undefined}
              onClick={() => { setMenuOpen(false); if (!l.id) setPage("acces"); }}
              className={`group flex items-center justify-between border-b border-white/10 py-4 transition-all duration-500 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${120 + i * 70}ms` }}
            >
              <span className="font-display text-4xl font-bold tracking-tight transition-colors group-hover:text-event-gradient">{l.label}</span>
              <ArrowUpRight className="h-6 w-6 text-white/30 transition-all group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          ))}
        </div>
        <div className="px-[7vw] pb-10 text-sm text-white/50">Tout type d'événement · Toute l'année · Pour tous</div>
      </div>

      <main id="top">
        {/* ═══════════ HERO — vidéo plein écran, les prochains rendez-vous tournent ═══════════ */}
        <HeroVideo
          slides={slidesAccueil}
          compteurLabel="AIME EVENT"
          onReserve={setReserve}
          cta={{ label: "Voir le calendrier", onClick: () => document.getElementById("programme")?.scrollIntoView({ behavior: "smooth" }) }}
          topRight={
            <span className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> Saison 2027 en cours
            </span>
          }
        />

        {/* ═══════════ LE CALENDRIER ANNUEL ═══════════ */}
        <ProgrammeAnnuel onOpenMonth={ouvrirMois} onAcces={() => setPage("acces")} />

        {/* ═══════════ UNE SEULE APP POUR TOUT FAIRE ═══════════ */}
        <section className="relative overflow-hidden bg-[#050506] px-[5vw] py-20 md:px-[2.6vw] md:py-28" aria-label="Mon espace, une seule app">
          <div className="pointer-events-none absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-[#ff4e6b]/10 blur-[150px]" />
          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Mon espace · Une seule app</p></Reveal>
                <Reveal delay={60}>
                  <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.1rem,5vw,4.2rem)] font-bold leading-[0.94] tracking-[-0.03em]">
                    VOUS N'AUREZ PLUS<br /><span className="text-event-gradient">RIEN D'AUTRE À OUVRIR.</span>
                  </h2>
                </Reveal>
              </div>
              <Reveal delay={110}>
                <p className="max-w-md text-sm leading-relaxed text-white/55">
                  Un identifiant unique pour tout : participer, organiser, aider, créer.
                  Billets, messages, documents, visuels et paiements vivent au même endroit.
                </p>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { ic: Ticket, t: "Je participe", d: "Billets avec QR, programme personnel exportable vers votre agenda, transfert en 1 clic.", tab: "billets" },
                { ic: Heart, t: "J'aide", d: "Missions de bénévolat, heures validées, attestation générée automatiquement.", tab: "missions" },
                { ic: FileText, t: "J'organise", d: "Documents administratifs, conventions et factures produits sur place, sans e-mail.", tab: "documents" },
                { ic: ImagePlus, t: "Je crée", d: "Affiches Story, Post et Bannière générées en 10 s, avec légende prête à poster.", tab: "creations" },
              ].map((c, i) => (
                <Reveal key={c.t} delay={i * 70} scale>
                  <button
                    onClick={() => ouvrirEspace(c.tab)}
                    data-cursor="Ouvrir"
                    className="group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-[#09090b] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] transition-all duration-300 group-hover:bg-event-gradient">
                      <c.ic className="h-5 w-5" />
                    </span>
                    <p className="mt-5 font-display text-lg font-extrabold tracking-tight">{c.t}</p>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/50">{c.d}</p>
                    <span className="mt-4 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-white/40 transition-colors group-hover:text-white">
                      Ouvrir mon espace <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal delay={150}>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { n: "1", l: "Identifiant unique pour tous vos rôles" },
                  { n: "0 €", l: "Frais de service, à jamais" },
                  { n: "100 %", l: "De vos données, à vous et exportables" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/10 bg-[#09090b] px-6 py-5">
                    <p className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{s.n}</p>
                    <p className="mt-1 text-[10.5px] font-semibold uppercase leading-tight tracking-[0.16em] text-white/40">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 flex flex-col items-center gap-3 text-center">
                <button
                  onClick={() => ouvrirEspace()}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-[12px] font-extrabold uppercase tracking-[0.14em] text-black transition hover:bg-event-gradient hover:text-white"
                >
                  Entrer dans mon espace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/35">Messagerie · Documents · Créations · Paiements — au même endroit</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" className="scroll-mt-20 bg-black px-[5vw] py-24 md:px-[2.6vw] md:py-32" aria-label="FAQ">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <Reveal><p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Bon à savoir</p></Reveal>
              <Reveal delay={80}><h2 className="mt-4 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-bold leading-[0.95] tracking-[-0.03em]">QUESTIONS ?<br />ON RÉPOND À TOUT.</h2></Reveal>
              <Reveal delay={140}>
                <button onClick={() => setPage("acces")} className="group mt-8 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:text-white">
                  Voir les accès <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:border-transparent group-hover:bg-event-gradient"><ArrowUpRight className="h-4 w-4" /></span>
                </button>
              </Reveal>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {[
                { q: "AIME EVENT, c'est un festival ?", a: "Non. C'est une plateforme universelle pour programmer n'importe quel événement : salle de spectacle, cinéma, école, club sportif, entreprise, association, mariage ou sortie entre proches." },
                { q: "Qui peut programmer ?", a: "Tout le monde : une salle, un cinéma, un festival, une école, un club, une association, une entreprise, une collectivité, un artiste ou une famille. La catégorie décrit ce que c'est ; le profil indique qui l'organise." },
                { q: "C'est pour qui ?", a: "Pour tout le monde, mais pas au même moment. 0–12 ans le dimanche et le samedi matin. Ados le mercredi et le samedi après-midi. 18+ après 23h. 55+ ont leurs salons, récitals et tablées." },
                { q: "Comment connaître les horaires ?", a: "Chaque rendez-vous du calendrier affiche son jour, son heure et son format. Ouvrez le mois qui vous intéresse pour voir le programme détaillé et les publics concernés." },
                { q: "Comment on entre ?", a: "Trois façons : le Pass Saison (toute la programmation, 490 €), le Carnet 4 rendez-vous (190 €) et le Pass Âges (0–12 ans gratuits le dimanche, ados et 55+ à 19 €). Les rendez-vous gratuits demandent une simple inscription." },
                { q: "Et après ma réservation ?", a: "Votre billet avec son QR apparaît dans Mon Espace, onglet Mes billets. Vous l'ajoutez à votre agenda, le transférez, ou générez le document correspondant — sans quitter le site." },
                { q: "Je peux aider ou organiser ?", a: "Oui, c'est le cœur de Mon Espace : vous choisissez une mission, vos heures sont validées et l'attestation de bénévolat se génère automatiquement. Les organisateurs y retrouvent leurs conventions et leurs visuels de communication." },
              ].map((f, i) => (
                <FaqItem key={f.q} {...f} delay={i * 60} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <ModalReservation event={reserve} onClose={() => setReserve(null)} onEspace={() => ouvrirEspace("billets")} />

      {/* ═══════════ PIED DE PAGE ═══════════ */}
      <footer className="border-t border-white/10 bg-black" aria-label="Pied de page">
        <div className="px-[5vw] pt-14 md:px-[2.6vw]">
          <button onClick={() => setPage("accueil")} className="block select-none" aria-label="Retour en haut">
            <p className="hero-display text-[13.5vw] leading-[0.85] md:text-[11.5vw]">
              <span className="block text-white transition-colors">AIME</span>
              <span className="text-event-gradient block">EVENT</span>
            </p>
          </button>
          <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/35">Le principe</p>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                Toute programmation, pour tous les organisateurs<br />et tous les publics — dans une seule app
                pour participer, organiser, aider et créer.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/35">Explorer</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-white/65">
                <li><a href="#programme" className="transition hover:text-white">Le programme</a></li>
                <li><button onClick={() => setPage("mois")} className="transition hover:text-white">Les 12 mois</button></li>
                <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
                <li><button onClick={() => ouvrirEspace()} className="transition hover:text-white">Mon espace</button></li>
                <li><button onClick={() => setPage("acces")} className="transition hover:text-white">Accès</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/35">Contact</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-white/65">
                <li><a href="#" className="transition hover:text-white">bonjour@aime-event.com</a></li>
                <li><a href="#" className="transition hover:text-white">Presse & partenaires</a></li>
                <li><a href="#" className="transition hover:text-white">Accessibilité</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/35">Suivre</p>
              <div className="mt-4 flex gap-2.5">
                {[Camera, AtSign, Clapperboard].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Lien social" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-transparent hover:bg-event-gradient hover:text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
              <p className="mt-5 text-[13px] text-white/40">@aime.event — annonces quotidiennes</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35 sm:flex-row">
            <p>© 2027 AIME EVENT — Tous droits réservés</p>
            <p className="flex items-center gap-5"><a href="#" className="transition hover:text-white">Confidentialité</a><a href="#" className="transition hover:text-white">CGV</a><a href="#" className="transition hover:text-white">Cookies</a></p>
          </div>
        </div>
      </footer>

      {overlays}
    </div>
  );
}

/* ————————————————————————— FAQ ————————————————————————— */

function FaqItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={delay}>
      <div>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
          <span className={`font-display text-[17px] font-bold tracking-tight transition-colors duration-300 md:text-xl ${open ? "text-white" : "text-white/80 group-hover:text-white"}`}>{q}</span>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${open ? "border-transparent bg-event-gradient rotate-45" : "border-white/20 group-hover:border-white/60"}`}>
            <Plus className="h-4 w-4" />
          </span>
        </button>
        <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <p className="max-w-2xl pb-7 text-[14.5px] leading-relaxed text-white/55">{a}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
