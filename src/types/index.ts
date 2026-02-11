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

// DB-backed types
export interface DBScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  goal: string;
  difficulty: string;
  category: string;
  department: string;
  ideal_prompt: string;
  hints: string[];
  evaluation: {
    criteria: string[];
    sampleGoodPrompt: string;
    commonMistakes: string[];
    keyPhrases: string[];
  };
  created_by: string | null;
  created_at: string;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  location: string;
  event_date: string | null;
  status: "draft" | "active" | "completed";
  created_by: string | null;
  created_at: string;
}

export interface Contestant {
  id: string;
  competition_id: string;
  full_name: string;
  email: string | null;
  access_code: string;
  created_at: string;
}

export interface Submission {
  id: string;
  contestant_id: string;
  scenario_id: string;
  competition_id: string;
  user_prompt: string;
  refined_prompt: string | null;
  initial_score: number;
  final_score: number;
  ai_feedback: string;
  ai_suggestions: string[];
  submitted_at: string;
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
  timeSpent: number;
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
