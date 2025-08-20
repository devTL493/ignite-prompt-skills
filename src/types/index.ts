export interface Scenario {
  id: number;
  title: string;
  description: string;
  context: string;
  goal: string;
  difficulty: "Anfänger" | "Mittelstufe" | "Fortgeschritten";
  category: string;
  department: string;
  idealPrompt: string;
  hints: string[];
  evaluation: {
    criteria: string[];
    sampleGoodPrompt: string;
    commonMistakes: string[];
    keyPhrases: string[];
  };
}

export interface UserProgress {
  userId: string;
  userName: string;
  startedAt: Date;
  completedScenarios: ScenarioResult[];
  currentScenario: number;
  isCompleted: boolean;
  totalScore: number;
  averageScore: number;
}

export interface ScenarioResult {
  scenarioId: number;
  userPrompt: string;
  refinedPrompt?: string;
  initialScore: number;
  finalScore: number;
  completedAt: Date;
  hasRefined: boolean;
  timeSpent: number; // in seconds
  feedback: string;
  suggestions: string[];
}

export interface AIScoreResult {
  score: number;
  breakdown: {
    clarity: number;
    specificity: number;
    context: number;
    structure: number;
    domainKnowledge: number;
  };
  feedback: string;
  suggestions: string[];
  keyStrengths: string[];
  criticalIssues: string[];
}

export interface CertificateData {
  userName: string;
  completionDate: Date;
  totalScore: number;
  scenariosCompleted: number;
  skillLevel: "Grundkenntnisse" | "Kompetent" | "Experte";
  department: string;
}