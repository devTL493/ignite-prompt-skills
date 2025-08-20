import { AIScoreResult, Scenario } from "@/types";

export class AdvancedAIScorer {
  private static analyzeClarity(prompt: string): number {
    let score = 50;
    
    // Check for clear structure
    if (prompt.includes("1)") || prompt.includes("-") || prompt.includes("•") || prompt.includes(":")) {
      score += 15;
    }
    
    // Check for appropriate length
    if (prompt.length > 100 && prompt.length < 800) {
      score += 10;
    } else if (prompt.length < 50) {
      score -= 15;
    }
    
    // Check for clear instructions
    const instructionWords = ["erstelle", "schreibe", "entwickle", "verfasse", "spezifiziere"];
    if (instructionWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeSpecificity(prompt: string, scenario: Scenario): number {
    let score = 40;
    
    // Check for specific tone mentions
    const toneWords = ["empathisch", "professionell", "klar", "verständlich", "amtlich"];
    if (toneWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 15;
    }
    
    // Check for target audience specification
    const audienceWords = ["bürger", "antragsteller", "arbeitslose", "zielgruppe"];
    if (audienceWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 10;
    }
    
    // Check for format specification
    const formatWords = ["struktur", "format", "aufbau", "gliederung"];
    if (formatWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 15;
    }
    
    // Check for domain-specific requirements
    const governmentWords = ["rechtssicher", "dsgvo", "barrierefrei", "rechtsgrundlage"];
    if (governmentWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeContext(prompt: string, scenario: Scenario): number {
    let score = 30;
    
    // Check if scenario context is referenced
    const contextWords = scenario.context.toLowerCase().split(" ").slice(0, 10);
    const matchedWords = contextWords.filter(word => 
      word.length > 3 && prompt.toLowerCase().includes(word)
    );
    score += Math.min(30, matchedWords.length * 5);
    
    // Check for department-specific context
    if (prompt.toLowerCase().includes(scenario.department.toLowerCase())) {
      score += 15;
    }
    
    // Check for category-specific elements
    if (prompt.toLowerCase().includes(scenario.category.toLowerCase())) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeStructure(prompt: string): number {
    let score = 35;
    
    // Check for numbered lists
    const numberedPattern = /\d+\)/g;
    const numberedMatches = prompt.match(numberedPattern);
    if (numberedMatches && numberedMatches.length >= 3) {
      score += 25;
    } else if (numberedMatches && numberedMatches.length >= 1) {
      score += 15;
    }
    
    // Check for bullet points
    if (prompt.includes("•") || prompt.includes("-")) {
      score += 10;
    }
    
    // Check for clear sections
    const sectionWords = ["beinhalte", "struktur", "aufbau", "gliederung"];
    if (sectionWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 15;
    }
    
    // Check for logical flow indicators
    const flowWords = ["zunächst", "dann", "anschließend", "abschließend"];
    if (flowWords.some(word => prompt.toLowerCase().includes(word))) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static analyzeDomainKnowledge(prompt: string, scenario: Scenario): number {
    let score = 25;
    
    // Check for key domain phrases
    const keyPhrases = scenario.evaluation.keyPhrases || [];
    const mentionedPhrases = keyPhrases.filter(phrase => 
      prompt.toLowerCase().includes(phrase.toLowerCase())
    );
    score += Math.min(40, mentionedPhrases.length * 8);
    
    // Government-specific knowledge
    const govTerms = ["sgb", "bürgergeld", "arbeitslosengeld", "jobcenter", "arbeitsagentur"];
    const govMatches = govTerms.filter(term => prompt.toLowerCase().includes(term));
    score += Math.min(20, govMatches.length * 5);
    
    // Legal/compliance terms
    const legalTerms = ["rechtsgrundlage", "widerspruch", "dsgvo", "rechtssicher"];
    const legalMatches = legalTerms.filter(term => prompt.toLowerCase().includes(term));
    score += Math.min(15, legalMatches.length * 5);
    
    return Math.max(0, Math.min(100, score));
  }

  public static scorePrompt(prompt: string, scenario: Scenario): AIScoreResult {
    const breakdown = {
      clarity: this.analyzeClarity(prompt),
      specificity: this.analyzeSpecificity(prompt, scenario),
      context: this.analyzeContext(prompt, scenario),
      structure: this.analyzeStructure(prompt),
      domainKnowledge: this.analyzeDomainKnowledge(prompt, scenario)
    };

    // Weighted average (domain knowledge is most important for government scenarios)
    const totalScore = Math.round(
      (breakdown.clarity * 0.15) +
      (breakdown.specificity * 0.25) +
      (breakdown.context * 0.20) +
      (breakdown.structure * 0.15) +
      (breakdown.domainKnowledge * 0.25)
    );

    const feedback = this.generateFeedback(totalScore, breakdown);
    const suggestions = this.generateSuggestions(breakdown, prompt, scenario);
    const keyStrengths = this.identifyStrengths(breakdown);
    const criticalIssues = this.identifyCriticalIssues(breakdown);

    return {
      score: totalScore,
      breakdown,
      feedback,
      suggestions,
      keyStrengths,
      criticalIssues
    };
  }

  private static generateFeedback(score: number, breakdown: any): string {
    if (score >= 85) {
      return "Exzellenter Prompt! Sie demonstrieren tiefes Verständnis für behördliche Kommunikation und haben alle wesentlichen Elemente für effektive KI-Anweisungen berücksichtigt.";
    } else if (score >= 70) {
      return "Guter Prompt mit solider Grundlage. Sie zeigen Verständnis für die Anforderungen des öffentlichen Sektors, könnten aber in einigen Bereichen spezifischer werden.";
    } else if (score >= 55) {
      return "Akzeptabler Prompt mit Verbesserungspotenzial. Fokussieren Sie sich auf mehr Spezifität und berücksichtigen Sie stärker die behördlichen Anforderungen.";
    } else {
      return "Dieser Prompt benötigt erhebliche Überarbeitung. Berücksichtigen Sie die spezifischen Anforderungen des öffentlichen Sektors und strukturieren Sie Ihre Anweisungen klarer.";
    }
  }

  private static generateSuggestions(breakdown: any, prompt: string, scenario: Scenario): string[] {
    const suggestions: string[] = [];

    if (breakdown.clarity < 60) {
      suggestions.push("Strukturieren Sie Ihren Prompt mit nummerierten Punkten oder Aufzählungen");
    }
    
    if (breakdown.specificity < 60) {
      suggestions.push("Spezifizieren Sie den gewünschten Ton und die Zielgruppe deutlicher");
    }
    
    if (breakdown.context < 60) {
      suggestions.push("Beziehen Sie sich explizit auf den Szenario-Kontext und die Abteilung");
    }
    
    if (breakdown.structure < 60) {
      suggestions.push("Verwenden Sie eine klare Struktur mit logischen Abschnitten");
    }
    
    if (breakdown.domainKnowledge < 60) {
      suggestions.push("Berücksichtigen Sie spezifische behördliche Anforderungen (Rechtssicherheit, Barrierefreiheit, DSGVO)");
    }

    return suggestions.slice(0, 4);
  }

  private static identifyStrengths(breakdown: any): string[] {
    const strengths: string[] = [];
    
    if (breakdown.clarity >= 75) strengths.push("Klare und verständliche Formulierung");
    if (breakdown.specificity >= 75) strengths.push("Hohe Spezifität der Anforderungen");
    if (breakdown.context >= 75) strengths.push("Gute Kontextberücksichtigung");
    if (breakdown.structure >= 75) strengths.push("Excellente Strukturierung");
    if (breakdown.domainKnowledge >= 75) strengths.push("Starkes Fachwissen für öffentlichen Sektor");
    
    return strengths;
  }

  private static identifyCriticalIssues(breakdown: any): string[] {
    const issues: string[] = [];
    
    if (breakdown.domainKnowledge < 40) issues.push("Mangelnde Berücksichtigung behördlicher Anforderungen");
    if (breakdown.specificity < 40) issues.push("Zu vage Anweisungen");
    if (breakdown.context < 40) issues.push("Unzureichende Kontextberücksichtigung");
    if (breakdown.structure < 40) issues.push("Fehlende logische Struktur");
    
    return issues;
  }
}