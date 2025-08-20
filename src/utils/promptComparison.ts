import { Scenario } from "@/types";

interface PromptGap {
  type: 'missing_keyword' | 'missing_structure' | 'missing_concept' | 'insufficient_detail';
  element: string;
  importance: 'high' | 'medium' | 'low';
  suggestion: string;
}

export class PromptComparator {
  
  static compareWithIdeal(userPrompt: string, scenario: Scenario): {
    gaps: PromptGap[];
    similarity: number;
    contextualHints: string[];
  } {
    const idealPrompt = scenario.idealPrompt.toLowerCase();
    const userPromptLower = userPrompt.toLowerCase();
    
    const gaps = this.identifyGaps(userPromptLower, idealPrompt, scenario);
    const similarity = this.calculateSimilarity(userPromptLower, idealPrompt);
    const contextualHints = this.generateContextualHints(gaps, scenario);
    
    return { gaps, similarity, contextualHints };
  }

  private static identifyGaps(userPrompt: string, idealPrompt: string, scenario: Scenario): PromptGap[] {
    const gaps: PromptGap[] = [];
    
    // Check for missing key phrases from evaluation criteria
    const keyPhrases = scenario.evaluation.keyPhrases || [];
    keyPhrases.forEach(phrase => {
      if (!userPrompt.includes(phrase.toLowerCase())) {
        gaps.push({
          type: 'missing_keyword',
          element: phrase,
          importance: 'high',
          suggestion: `Berücksichtigen Sie "${phrase}" in Ihrem Prompt`
        });
      }
    });

    // Check for structural elements
    const structuralElements = this.extractStructuralElements(idealPrompt);
    structuralElements.forEach(element => {
      if (!this.hasStructuralElement(userPrompt, element)) {
        gaps.push({
          type: 'missing_structure',
          element: element.name,
          importance: element.importance,
          suggestion: element.suggestion
        });
      }
    });

    // Check for specific domain concepts
    const domainConcepts = this.extractDomainConcepts(idealPrompt, scenario);
    domainConcepts.forEach(concept => {
      if (!userPrompt.includes(concept.term.toLowerCase())) {
        gaps.push({
          type: 'missing_concept',
          element: concept.term,
          importance: concept.importance,
          suggestion: concept.suggestion
        });
      }
    });

    // Check for detail level
    if (this.isInsufficientDetail(userPrompt, idealPrompt)) {
      gaps.push({
        type: 'insufficient_detail',
        element: 'Detaillierungsgrad',
        importance: 'medium',
        suggestion: 'Fügen Sie mehr spezifische Details und Anforderungen hinzu'
      });
    }

    return gaps.sort((a, b) => {
      const importance = { high: 3, medium: 2, low: 1 };
      return importance[b.importance] - importance[a.importance];
    });
  }

  private static extractStructuralElements(idealPrompt: string) {
    const elements = [];
    
    // Check for numbered structure
    if (/\d+\)/g.test(idealPrompt)) {
      elements.push({
        name: 'Nummerierte Struktur',
        importance: 'high' as const,
        suggestion: 'Strukturieren Sie Ihren Prompt mit nummerierten Punkten (1), 2), 3)...)'
      });
    }

    // Check for specific formatting requests
    if (idealPrompt.includes('struktur:') || idealPrompt.includes('beinhalte:')) {
      elements.push({
        name: 'Explizite Strukturangabe',
        importance: 'high' as const,
        suggestion: 'Geben Sie eine klare Struktur vor (z.B. "Struktur: 1) Einleitung, 2) Hauptteil...")'
      });
    }

    // Check for tone specification
    if (idealPrompt.includes('ton:') || idealPrompt.includes('empathisch') || idealPrompt.includes('professionell')) {
      elements.push({
        name: 'Tonangabe',
        importance: 'medium' as const,
        suggestion: 'Spezifizieren Sie den gewünschten Ton (z.B. "Ton: empathisch aber professionell")'
      });
    }

    return elements;
  }

  private static extractDomainConcepts(idealPrompt: string, scenario: Scenario) {
    const concepts = [];
    
    // Government-specific terms
    const govTerms = [
      { term: 'rechtsgrundlage', importance: 'high' as const, suggestion: 'Erwähnen Sie die relevante Rechtsgrundlage' },
      { term: 'dsgvo', importance: 'high' as const, suggestion: 'Berücksichtigen Sie DSGVO-Anforderungen' },
      { term: 'barrierefrei', importance: 'high' as const, suggestion: 'Denken Sie an Barrierefreiheit' },
      { term: 'widerspruch', importance: 'medium' as const, suggestion: 'Erwähnen Sie das Widerspruchsrecht' },
      { term: 'beratung', importance: 'medium' as const, suggestion: 'Bieten Sie Beratungsangebote an' }
    ];

    govTerms.forEach(term => {
      if (idealPrompt.includes(term.term)) {
        concepts.push(term);
      }
    });

    // Department-specific concepts
    if (scenario.department.toLowerCase().includes('jobcenter')) {
      concepts.push({
        term: 'bürgergeld',
        importance: 'high' as const,
        suggestion: 'Berücksichtigen Sie Bürgergeld-spezifische Aspekte'
      });
    }

    return concepts;
  }

  private static hasStructuralElement(userPrompt: string, element: { name: string }) {
    switch (element.name) {
      case 'Nummerierte Struktur':
        return /\d+\)/g.test(userPrompt) || userPrompt.includes('1.') || userPrompt.includes('punkt');
      case 'Explizite Strukturangabe':
        return userPrompt.includes('struktur') || userPrompt.includes('beinhalte') || userPrompt.includes('gliederung');
      case 'Tonangabe':
        return userPrompt.includes('ton') || userPrompt.includes('empathisch') || userPrompt.includes('professionell');
      default:
        return false;
    }
  }

  private static isInsufficientDetail(userPrompt: string, idealPrompt: string): boolean {
    const userWords = userPrompt.split(' ').length;
    const idealWords = idealPrompt.split(' ').length;
    return userWords < idealWords * 0.3; // Less than 30% of ideal length
  }

  private static calculateSimilarity(userPrompt: string, idealPrompt: string): number {
    const userWords = new Set(userPrompt.split(' ').filter(word => word.length > 2));
    const idealWords = new Set(idealPrompt.split(' ').filter(word => word.length > 2));
    
    const intersection = new Set([...userWords].filter(word => idealWords.has(word)));
    const union = new Set([...userWords, ...idealWords]);
    
    return Math.round((intersection.size / union.size) * 100);
  }

  private static generateContextualHints(gaps: PromptGap[], scenario: Scenario): string[] {
    const hints: string[] = [];
    
    // Prioritize high-importance gaps
    const highPriorityGaps = gaps.filter(gap => gap.importance === 'high').slice(0, 2);
    const mediumPriorityGaps = gaps.filter(gap => gap.importance === 'medium').slice(0, 1);
    
    [...highPriorityGaps, ...mediumPriorityGaps].forEach(gap => {
      hints.push(gap.suggestion);
    });

    // Add scenario-specific contextual hints
    if (gaps.some(gap => gap.type === 'missing_structure')) {
      hints.push(`Orientieren Sie sich an der Struktur: "${this.extractStructureExample(scenario.idealPrompt)}"`);
    }

    return hints.slice(0, 4); // Limit to 4 hints
  }

  private static extractStructureExample(idealPrompt: string): string {
    const match = idealPrompt.match(/struktur:?\s*([^.]{0,100})/i);
    if (match) {
      return match[1].trim().substring(0, 80) + '...';
    }
    
    // Fallback: extract first numbered elements
    const numberedMatches = idealPrompt.match(/\d+\)\s*[^,\d)]{10,40}/g);
    if (numberedMatches && numberedMatches.length >= 2) {
      return numberedMatches.slice(0, 2).join(', ') + '...';
    }
    
    return 'Strukturierte Gliederung verwenden';
  }

  static generateIdealPromptBasedSuggestions(userPrompt: string, scenario: Scenario): string[] {
    const comparison = this.compareWithIdeal(userPrompt, scenario);
    
    if (comparison.similarity > 70) {
      return ['Ihr Prompt ist bereits sehr nah am idealen Prompt! Kleine Verfeinerungen können noch helfen.'];
    } else if (comparison.similarity > 50) {
      return comparison.contextualHints;
    } else {
      return [
        'Ihr Prompt unterscheidet sich erheblich vom optimalen Ansatz.',
        ...comparison.contextualHints.slice(0, 2),
        `Vergleichen Sie mit dem idealen Ansatz: "${scenario.idealPrompt.substring(0, 120)}..."`
      ];
    }
  }
}