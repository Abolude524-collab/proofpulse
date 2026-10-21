import { EvidenceReport } from "./types";

export interface DemoSample {
  id: string;
  title: string;
  claim: string;
  report: EvidenceReport;
}

export const DEMO_SAMPLES: Record<string, DemoSample> = {
  exoplanet: {
    id: "exoplanet",
    title: "Webb Telescope & Exoplanet Water Vapor",
    claim:
      "NASA's James Webb Space Telescope detected atmospheric water vapor on the rocky exoplanet GJ 486 b.",
    report: {
      claim:
        "NASA's James Webb Space Telescope detected atmospheric water vapor on the rocky exoplanet GJ 486 b.",
      assessment: "Mixed evidence",
      summary:
        "Spectroscopic observations from Webb's NIRSpec instrument detected clear water vapor signals when GJ 486 b transited its star. However, science teams caution that the water vapor could originate from cool starspots on the host red dwarf star rather than a true planetary atmosphere, making the discovery tentative and subject to active debate.",
      supportingEvidence: [
        {
          title: "Webb Finds Water Vapor in Rocky Exoplanet System",
          publisher: "nasa.gov",
          url: "https://www.nasa.gov/universe/webb-finds-water-vapor-in-rocky-exoplanet-system/",
          date: "2023-05-01",
          relevance:
            "Confirms that NIRSpec observed water vapor signatures during transits of the rocky exoplanet GJ 486 b.",
          relationship: "supports",
          sourceExcerpt:
            "NASA's James Webb Space Telescope has observed the rocky exoplanet GJ 486 b and detected water vapor; however, scientists cannot yet say whether the water is associated with the planet or its host star.",
        },
      ],
      contradictingOrContextEvidence: [
        {
          title: "The Astrophysical Journal Letters: Stellar Contamination in GJ 486 b Spectra",
          publisher: "iopscience.iop.org",
          url: "https://iopscience.iop.org/article/10.3847/2041-8213/acd054",
          date: "2023-05-15",
          relevance:
            "Demonstrates that cool spots on the parent star can mimic water vapor absorption features in transit transmission spectroscopy.",
          relationship: "context",
          sourceExcerpt:
            "Water vapor is known to exist in cool starspots of M-dwarfs, creating spectral features that cannot yet be statistically distinguished from a planetary atmosphere without further MIRI observations.",
        },
      ],
      unknowns: [
        "Whether water vapor resides in a genuine secondary atmosphere or in unocculted stellar magnetic starspots.",
        "Follow-up MIRI thermal emission observations are required to measure dayside temperature and atmospheric presence.",
      ],
      limitations: [
        "M-dwarf stellar activity routinely complicates transmission spectroscopy of small exoplanets.",
      ],
      mode: "sample",
      analyzedAt: "2026-10-21T10:00:00.000Z",
    },
  },
  radiation: {
    id: "radiation",
    title: "Potassium-40 in Bananas",
    claim:
      "Bananas are naturally radioactive due to containing potassium-40 isotopes.",
    report: {
      claim:
        "Bananas are naturally radioactive due to containing potassium-40 isotopes.",
      assessment: "Supported",
      summary:
        "Bananas are rich in potassium, a small natural fraction (approx. 0.012%) of which consists of the radioactive isotope potassium-40 (40K). While measurable with sensitive scintillation detectors, the radiation dose is minute (around 0.1 µSv per banana) and the body strictly maintains homeostatic potassium equilibrium.",
      supportingEvidence: [
        {
          title: "EPA: Radionuclides in Food and Dietary Potassium",
          publisher: "epa.gov",
          url: "https://www.epa.gov/radtown/natural-radioactivity-food",
          date: "2024-02-14",
          relevance:
            "Explicitly identifies potassium-40 in bananas and other potassium-rich foods as a natural source of radioactivity.",
          relationship: "supports",
          sourceExcerpt:
            "Potassium-40 is a naturally occurring radioactive isotope of potassium found in everyday foods, notably bananas and potatoes.",
        },
        {
          title: "Health Physics Society: Banana Equivalent Dose Explanation",
          publisher: "hps.org",
          url: "https://hps.org/publicinformation/ate/q13098.html",
          date: "2023-09-10",
          relevance:
            "Details the radiation dosimetry of consuming natural potassium-40 in typical diet.",
          relationship: "supports",
          sourceExcerpt:
            "The Banana Equivalent Dose represents an informal measure of ionizing radiation exposure, roughly equal to 0.1 microsieverts.",
        },
      ],
      contradictingOrContextEvidence: [
        {
          title: "Biological Regulation of Human Potassium Levels",
          publisher: "nih.gov",
          url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6181280/",
          date: "2022-08-11",
          relevance:
            "Clarifies that ingesting dietary potassium does not increase internal radiation burden because physiological excretion balances intake.",
          relationship: "context",
          sourceExcerpt:
            "Human kidney function tightly regulates potassium balance; excess dietary potassium is excreted rapidly, preserving constant body burden.",
        },
      ],
      unknowns: [
        "Slight variance in potassium concentration based on soil fertilization and cultivar type.",
      ],
      limitations: [
        "Dosimetric comparisons like 'banana equivalent dose' do not reflect cumulative biological risk.",
      ],
      mode: "sample",
      analyzedAt: "2026-10-21T10:00:00.000Z",
    },
  },
  wifi: {
    id: "wifi",
    title: "School WiFi Ordinance Rumor",
    claim:
      "A new city ordinance bans residential WiFi routers within 500 meters of public elementary schools.",
    report: {
      claim:
        "A new city ordinance bans residential WiFi routers within 500 meters of public elementary schools.",
      assessment: "Insufficient evidence",
      summary:
        "No official government publications, municipal codes, city council minutes, or reputable journalistic outlets document an ordinance restricting home WiFi routers near schools. The claim matches recurrent ungrounded social media rumors.",
      supportingEvidence: [],
      contradictingOrContextEvidence: [
        {
          title: "FCC Guidelines for Human Exposure to Radiofrequency Fields",
          publisher: "fcc.gov",
          url: "https://www.fcc.gov/general/radio-frequency-safety-faq",
          date: "2023-11-01",
          relevance:
            "Explains that federal RF emissions standards preempt municipal bans on compliant consumer electronic devices.",
          relationship: "context",
          sourceExcerpt:
            "Consumer WiFi routers operate under FCC Part 15 rules within established safe exposure limits.",
        },
      ],
      unknowns: [
        "No specific municipality, city council date, or bill identifier was provided.",
        "Check local legislative registries directly if a specific locality was intended.",
      ],
      limitations: [
        "General web searches cannot disprove hypothetical unfiled draft memos in unmentioned cities, but confirm zero public record exists.",
      ],
      mode: "sample",
      analyzedAt: "2026-10-21T10:00:00.000Z",
    },
  },
};

export function getDemoSample(sampleId?: string): DemoSample {
  if (sampleId && DEMO_SAMPLES[sampleId]) {
    return DEMO_SAMPLES[sampleId];
  }
  return DEMO_SAMPLES.exoplanet;
}
