import { TOUS_LES_EVENEMENTS, UNIVERS_PAR_ID } from "../data/annee";
import { categorieParId } from "../data/taxonomie";
import { datesEvenement } from "../utils/ics";

/**
 * Taxonomie machine : chaque rendez-vous est exposé avec le bon sous-type Schema.org.
 * Le public voit des mots simples ; Google, les calendriers et les agents voient une structure standard.
 */
export default function StructuredData() {
  const graph = TOUS_LES_EVENEMENTS.map(({ event, mois }) => {
    const programme = UNIVERS_PAR_ID[event.univers];
    const categorie = categorieParId(programme.categorieId);
    const { debut, fin } = datesEvenement(event, mois);
    return {
      "@type": categorie.schemaType,
      "@id": `https://aime-event.example/e/${event.id}`,
      name: event.nom,
      description: event.resume,
      startDate: debut.toISOString(),
      endDate: fin.toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: programme.image,
      typicalAgeRange: event.publics.join(", "),
      organizer: {
        "@type": "Organization",
        name: "AIME EVENT",
        url: "https://aime-event.example",
      },
      offers: {
        "@type": "Offer",
        url: `https://aime-event.example/e/${event.id}`,
        price: event.prix,
        priceCurrency: "EUR",
        availability: event.restantes > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      },
    };
  });

  const data = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
