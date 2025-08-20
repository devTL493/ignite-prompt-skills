import { Scenario } from "@/types";

export const governmentScenarios: Scenario[] = [
  {
    id: 1,
    title: "Arbeitslosengeld-Ablehnungsbescheid kommunizieren",
    description: "Erstellen Sie eine empathische Kommunikation für die Ablehnung von Arbeitslosengeld",
    context: "Ein Bürger hat Arbeitslosengeld beantragt, aber die Voraussetzungen sind nicht erfüllt (unzureichende Beitragszeiten). Der Antragsteller ist alleinerziehend mit zwei Kindern und in einer schwierigen finanziellen Lage. Die Ablehnung muss rechtlich korrekt, aber menschlich kommuniziert werden.",
    goal: "Generieren Sie einen professionellen, empathischen Ablehnungsbescheid, der alternative Unterstützungsmöglichkeiten aufzeigt",
    difficulty: "Mittelstufe",
    category: "Bürgerkommunikation",
    department: "Arbeitsagentur",
    idealPrompt: "Verfasse einen offiziellen Ablehnungsbescheid für einen Arbeitslosengeld-Antrag aufgrund unzureichender Beitragszeiten. Der Ton soll empathisch aber rechtlich präzise sein. Struktur: 1) Höfliche Anrede, 2) Klare Begründung der Ablehnung mit Rechtsgrundlage, 3) Aufzählung alternativer Unterstützungsmöglichkeiten (Bürgergeld, Beratungsangebote), 4) Hinweis auf Widerspruchsrecht, 5) Kontaktdaten für Rückfragen. Berücksichtige die besondere Situation als Alleinerziehende/r.",
    hints: [
      "Spezifizieren Sie den Ton (empathisch, aber amtlich korrekt)",
      "Erwähnen Sie die Rechtsgrundlage für die Ablehnung",
      "Bieten Sie konkrete Alternativen an",
      "Berücksichtigen Sie die persönliche Situation",
      "Strukturieren Sie den Brief logisch"
    ],
    evaluation: {
      criteria: [
        "Empathischer aber amtlicher Ton",
        "Klare Rechtsgrundlage genannt",
        "Alternative Unterstützungsmöglichkeiten aufgezeigt",
        "Widerspruchsrecht erwähnt",
        "Strukturierte und verständliche Darstellung"
      ],
      sampleGoodPrompt: "Verfasse einen offiziellen Ablehnungsbescheid für einen Arbeitslosengeld-Antrag aufgrund unzureichender Beitragszeiten...",
      commonMistakes: [
        "Zu kalt und bürokratisch",
        "Keine Alternativen angeboten",
        "Rechtsgrundlage nicht erwähnt",
        "Unstrukturierte Darstellung"
      ],
      keyPhrases: ["empathisch", "Rechtsgrundlage", "alternative", "Widerspruch", "Beratung", "strukturiert"]
    }
  },
  {
    id: 2,
    title: "Digitale Jobvermittlungsstrategie entwickeln",
    description: "Konzipieren Sie eine digitale Strategie zur Verbesserung der Jobvermittlung für Langzeitarbeitslose",
    context: "Die Arbeitsagentur möchte ihre Jobvermittlung digitalisieren, um Langzeitarbeitslose besser zu erreichen. Viele der Zielgruppe haben begrenzte Digitalkompetenzen, sind über 50 Jahre alt oder haben Migrationshintergrund. Das Budget beträgt 500.000€ für 18 Monate. Ziel ist es, die Vermittlungsquote um 25% zu steigern.",
    goal: "Entwickeln Sie eine umfassende digitale Jobvermittlungsstrategie, die auf die spezifischen Bedürfnisse von Langzeitarbeitslosen eingeht",
    difficulty: "Fortgeschritten",
    category: "Strategieentwicklung",
    department: "Digitalisierung & Innovation",
    idealPrompt: "Entwickle eine 18-monatige digitale Jobvermittlungsstrategie für Langzeitarbeitslose mit 500.000€ Budget. Zielgruppe: Über 50-Jährige, Menschen mit Migrationshintergrund, begrenzte Digitalkompetenzen. Ziel: 25% höhere Vermittlungsquote. Beinhalte: 1) Zielgruppenanalyse mit digitalen Barrieren, 2) Barrierefreie Plattformkonzeption, 3) Mehrsprachige Unterstützung, 4) Digital-Coaching-Programme, 5) Kooperationen mit Bildungsträgern, 6) Mobile-First-Ansatz, 7) Erfolgsmessung und KPIs, 8) Implementierungsroadmap mit Meilensteinen, 9) Risikomanagement. Fokus auf Benutzerfreundlichkeit und Inklusion.",
    hints: [
      "Berücksichtigen Sie die spezifische Zielgruppe",
      "Denken Sie an digitale Barrieren",
      "Planen Sie Schulungsmaßnahmen ein",
      "Definieren Sie messbare Ziele",
      "Berücksichtigen Sie das Budget und den Zeitrahmen"
    ],
    evaluation: {
      criteria: [
        "Zielgruppenspezifische Ansätze definiert",
        "Barrierefreiheit und Inklusion berücksichtigt",
        "Klare Budget- und Zeitplanung",
        "Messbare KPIs definiert",
        "Implementierungsroadmap erstellt",
        "Risikomanagement einbezogen"
      ],
      sampleGoodPrompt: "Entwickle eine 18-monatige digitale Jobvermittlungsstrategie für Langzeitarbeitslose...",
      commonMistakes: [
        "Zielgruppe nicht spezifisch genug berücksichtigt",
        "Keine Barrieren analysiert",
        "Unrealistische Ziele gesetzt",
        "Budget nicht eingeplant"
      ],
      keyPhrases: ["Zielgruppe", "barrierefrei", "Budget", "KPIs", "Implementierung", "Inklusion", "mehrsprachig"]
    }
  },
  {
    id: 3,
    title: "KI-Bewerbungscheck für Jobsuchende",
    description: "Entwickeln Sie KI-gestützte Bewerbungsoptimierung für das Jobcenter",
    context: "Das Jobcenter möchte ein KI-System einführen, das Bewerbungsunterlagen von Arbeitssuchenden automatisch analysiert und Verbesserungsvorschläge macht. Das System soll datenschutzkonform arbeiten, verschiedene Branchen berücksichtigen und auch für Menschen mit Behinderungen zugänglich sein. 15.000 Bewerbungen pro Monat sollen verarbeitet werden.",
    goal: "Erstellen Sie Spezifikationen für ein KI-System zur Bewerbungsoptimierung im öffentlichen Sektor",
    difficulty: "Fortgeschritten",
    category: "KI & Technologie",
    department: "Digitale Services",
    idealPrompt: "Spezifiziere ein KI-gestütztes Bewerbungsoptimierungssystem für das Jobcenter mit 15.000 monatlichen Bewerbungen. Anforderungen: 1) DSGVO-konforme Datenverarbeitung, 2) Barrierefreie Benutzeroberfläche (BITV 2.0), 3) Branchenspezifische Analyse (Handwerk, Büro, Pflege, IT), 4) Mehrsprachige Unterstützung (DE, EN, TR, AR), 5) Automatische Qualitätsbewertung (Vollständigkeit, Rechtschreibung, Struktur), 6) Personalisierte Verbesserungsvorschläge, 7) Integration in bestehende Jobcenter-IT, 8) Reportingfunktionen für Berater, 9) Qualitätssicherung und Bias-Vermeidung. Berücksichtige ethische KI-Prinzipien und Transparenz der Algorithmen.",
    hints: [
      "Berücksichtigen Sie Datenschutz (DSGVO)",
      "Denken Sie an Barrierefreiheit",
      "Planen Sie verschiedene Branchen ein",
      "Erwähnen Sie ethische KI-Aspekte",
      "Definieren Sie technische Anforderungen"
    ],
    evaluation: {
      criteria: [
        "DSGVO-Compliance erwähnt",
        "Barrierefreiheit spezifiziert",
        "Branchenspezifische Anforderungen",
        "Ethische KI-Prinzipien berücksichtigt",
        "Technische Integration geplant",
        "Qualitätssicherung definiert"
      ],
      sampleGoodPrompt: "Spezifiziere ein KI-gestütztes Bewerbungsoptimierungssystem für das Jobcenter...",
      commonMistakes: [
        "Datenschutz nicht berücksichtigt",
        "Keine Barrierefreiheit erwähnt",
        "Zu generisch, nicht branchenspezifisch",
        "Ethische Aspekte ignoriert"
      ],
      keyPhrases: ["DSGVO", "barrierefrei", "branchenspezifisch", "ethisch", "transparent", "Integration", "mehrsprachig"]
    }
  },
  {
    id: 4,
    title: "Bürgergeld-Sanktionen erklären",
    description: "Kommunizieren Sie Sanktionsmaßnahmen beim Bürgergeld verständlich und rechtssicher",
    context: "Ein Bürgergeld-Empfänger hat wiederholt Termine nicht wahrgenommen und Bewerbungsauflagen nicht erfüllt. Eine Sanktion von 30% für 3 Monate muss verhängt werden. Der Betroffene hat zwei minderjährige Kinder und Deutsch ist nicht seine Muttersprache. Die Kommunikation muss rechtssicher sein und Hilfsangebote enthalten.",
    goal: "Verfassen Sie eine klare, verständliche Sanktionsmitteilung, die rechtliche Vorgaben erfüllt und Unterstützung anbietet",
    difficulty: "Mittelstufe",
    category: "Rechtskommunikation",
    department: "Jobcenter",
    idealPrompt: "Verfasse eine Sanktionsmitteilung für Bürgergeld-Empfänger (30% Kürzung, 3 Monate) wegen Terminversäumnissen und fehlender Bewerbungen. Zielgruppe: Nicht-Muttersprachler mit Kindern. Struktur: 1) Verständliche Einleitung, 2) Klare Auflistung der Pflichtverletzungen mit Daten, 3) Erläuterung der Rechtsgrundlage (§31a SGB II), 4) Präzise Sanktionsdetails (Betrag, Zeitraum), 5) Schutz der Kinder (Sozialgeld bleibt), 6) Beratungsangebote und Hilfsmöglichkeiten, 7) Informationen zur Aufhebung der Sanktion, 8) Widerspruchsbelehrung. Ton: Klar aber unterstützend, einfache Sprache verwenden.",
    hints: [
      "Verwenden Sie einfache, klare Sprache",
      "Erklären Sie die Rechtsgrundlage verständlich",
      "Erwähnen Sie den Kinderschutz explizit",
      "Bieten Sie konkrete Hilfe an",
      "Strukturieren Sie die Informationen logisch"
    ],
    evaluation: {
      criteria: [
        "Einfache, verständliche Sprache verwendet",
        "Rechtsgrundlage klar erklärt",
        "Kinderschutz erwähnt",
        "Konkrete Hilfsangebote gemacht",
        "Widerspruchsrecht erklärt",
        "Strukturierte Darstellung"
      ],
      sampleGoodPrompt: "Verfasse eine Sanktionsmitteilung für Bürgergeld-Empfänger wegen Terminversäumnissen...",
      commonMistakes: [
        "Zu komplizierte Rechtssprache",
        "Kinderschutz nicht erwähnt",
        "Keine Hilfsangebote",
        "Unstrukturierte Information"
      ],
      keyPhrases: ["einfache Sprache", "Rechtsgrundlage", "Kinderschutz", "Hilfsangebote", "Widerspruch", "verständlich"]
    }
  },
  {
    id: 5,
    title: "Inklusive Stellenausschreibung erstellen",
    description: "Entwickeln Sie eine barrierefreie, inklusive Stellenausschreibung für das öffentliche Jobportal",
    context: "Die Arbeitsagentur möchte eine Stellenausschreibung für eine IT-Stelle bei einem kommunalen Arbeitgeber veröffentlichen. Die Ausschreibung soll explizit Menschen mit Behinderungen ansprechen, geschlechtsneutral formuliert sein und keine unbewussten Vorurteile (Bias) enthalten. Sie soll auch für Menschen mit kognitiven Einschränkungen verständlich sein.",
    goal: "Erstellen Sie eine vollständig inklusive Stellenausschreibung, die alle Zielgruppen anspricht und rechtliche Vorgaben erfüllt",
    difficulty: "Anfänger",
    category: "Inklusive Kommunikation",
    department: "Arbeitgeberservice",
    idealPrompt: "Erstelle eine inklusive Stellenausschreibung für eine IT-Support-Position (Vollzeit, TV-L E9) bei der Stadtverwaltung. Anforderungen: 1) Geschlechtsneutrale Sprache (* oder : verwenden), 2) Explizite Ermutigung für Menschen mit Behinderungen, 3) Einfache, klare Sprache (B1-Niveau), 4) Bias-freie Formulierungen (keine Alters-, Herkunfts- oder Persönlichkeitsklischees), 5) Barrierefreie Bewerbungsmöglichkeiten erwähnen, 6) Flexible Arbeitsmodelle hervorheben, 7) Unterstützungsangebote am Arbeitsplatz erwähnen, 8) Klare Struktur: Aufgaben, Anforderungen, Angebote, Bewerbung. Vermeiden: 'Belastbarkeit', 'jung und dynamisch', 'Muttersprache Deutsch'.",
    hints: [
      "Verwenden Sie geschlechtsneutrale Sprache",
      "Ermutigen Sie Menschen mit Behinderungen explizit",
      "Verwenden Sie einfache, klare Sprache",
      "Vermeiden Sie stereotype Formulierungen",
      "Erwähnen Sie Unterstützungsangebote"
    ],
    evaluation: {
      criteria: [
        "Geschlechtsneutrale Sprache verwendet",
        "Menschen mit Behinderungen explizit angesprochen",
        "Einfache Sprache (B1-Niveau)",
        "Keine Bias-Formulierungen",
        "Barrierefreie Bewerbung erwähnt",
        "Unterstützungsangebote genannt"
      ],
      sampleGoodPrompt: "Erstelle eine inklusive Stellenausschreibung für eine IT-Support-Position...",
      commonMistakes: [
        "Nicht geschlechtsneutral",
        "Menschen mit Behinderungen nicht erwähnt",
        "Zu komplizierte Sprache",
        "Stereotype Formulierungen verwendet"
      ],
      keyPhrases: ["geschlechtsneutral", "Menschen mit Behinderungen", "einfache Sprache", "barrierefrei", "Unterstützung", "inklusiv"]
    }
  }
];