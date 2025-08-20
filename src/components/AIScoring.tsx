import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { PromptComparator } from "@/utils/promptComparison";
import { Scenario } from "@/types";

interface AIScoringProps {
  prompt: string;
  scenario: Scenario;
  onScoreReceived: (score: number, feedback: string, suggestions: string[]) => void;
  hasRefinementLeft: boolean;
}

export function AIScoring({ prompt, scenario, onScoreReceived, hasRefinementLeft }: AIScoringProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const simulateAIScoring = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use new comparison-based scoring
    const comparison = PromptComparator.compareWithIdeal(prompt, scenario);
    
    // Base score calculation with ideal prompt comparison
    let calculatedScore = 40; // Lower base score
    const lowerPrompt = prompt.toLowerCase();
    
    // Similarity to ideal prompt is the primary factor
    calculatedScore += Math.round(comparison.similarity * 0.4); // Up to 40 points for similarity
    
    // Check for key elements from the scenario
    const keyPhrases = scenario.evaluation.keyPhrases || [];
    const foundKeyPhrases = keyPhrases.filter(phrase => 
      lowerPrompt.includes(phrase.toLowerCase())
    );
    calculatedScore += Math.min(20, foundKeyPhrases.length * 4); // Up to 20 points for key phrases
    
    // Structure bonus
    if (lowerPrompt.includes("1)") || lowerPrompt.includes("-") || lowerPrompt.includes("struktur")) {
      calculatedScore += 10;
    }
    
    // Length and detail bonus
    if (prompt.length > 150) {
      calculatedScore += 8;
    }
    
    // Domain-specific elements
    if (lowerPrompt.includes("rechtsgrundlage") || lowerPrompt.includes("dsgvo") || lowerPrompt.includes("barrierefrei")) {
      calculatedScore += 12;
    }
    
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
    
    // Generate feedback and suggestions based on comparison
    const generatedFeedback = generateComparisonBasedFeedback(calculatedScore, comparison, scenario);
    const generatedSuggestions = PromptComparator.generateIdealPromptBasedSuggestions(prompt, scenario);
    
    setScore(calculatedScore);
    setFeedback(generatedFeedback);
    setSuggestions(generatedSuggestions);
    setIsLoading(false);
    
    onScoreReceived(calculatedScore, generatedFeedback, generatedSuggestions);
  };

  const generateComparisonBasedFeedback = (score: number, comparison: any, scenario: Scenario): string => {
    const similarityText = comparison.similarity > 70 ? "sehr nah am idealen Ansatz" :
                          comparison.similarity > 50 ? "auf einem guten Weg" :
                          comparison.similarity > 30 ? "grundlegend richtig, aber ausbaufähig" :
                          "deutlich vom optimalen Ansatz entfernt";

    if (score >= 80) {
      return `Ausgezeichnet! Ihr Prompt ist ${similarityText} und berücksichtigt die wichtigsten Anforderungen für "${scenario.title}". Die Struktur und Spezifität sind sehr gut.`;
    } else if (score >= 60) {
      return `Gute Basis! Ihr Prompt ist ${similarityText}. Mit einigen gezielten Ergänzungen können Sie noch näher an den idealen Prompt heranreichen.`;
    } else if (score >= 40) {
      return `Ihr Prompt ist ${similarityText}, aber es fehlen wichtige Elemente. Schauen Sie sich die Verbesserungsvorschläge an, um näher an den Golden Shot zu kommen.`;
    } else {
      return `Ihr Prompt ist ${similarityText}. Orientieren Sie sich stärker am Szenario-Kontext und den spezifischen Anforderungen für "${scenario.title}".`;
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "Ausgezeichnet", className: "bg-success text-white" };
    if (score >= 60) return { text: "Gut", className: "bg-warning text-white" };
    if (score >= 40) return { text: "Akzeptabel", className: "bg-secondary text-secondary-foreground" };
    return { text: "Verbesserungsbedarf", className: "bg-destructive text-white" };
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            KI-Bewertung
          </h3>
          {hasRefinementLeft && score !== null && score < 80 && (
            <Badge variant="outline" className="text-primary border-primary">
              <RefreshCw className="h-3 w-3 mr-1" />
              Verfeinerung verfügbar
            </Badge>
          )}
        </div>

        {score === null ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Bereit für KI-gestütztes Feedback zu Ihrem Prompt? Unser fortschrittliches Sprachmodell wird Ihren Prompt auf Klarheit, Spezifität und Effektivität analysieren.
            </p>
            <Button
              onClick={simulateAIScoring}
              disabled={isLoading || prompt.trim().length < 20}
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-button w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  KI analysiert Ihren Prompt...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  KI-Bewertung erhalten
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Score Display */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-4xl font-bold">
                  <span className={getScoreColor(score)}>{score}%</span>
                </div>
                <Badge className={getScoreBadge(score).className}>
                  {getScoreBadge(score).text}
                </Badge>
              </div>
              <Progress value={score} className="w-full max-w-md mx-auto" />
            </div>

            {/* Feedback */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                KI-Feedback
              </h4>
              <p className="text-muted-foreground bg-accent-soft p-4 rounded-lg">
                {feedback}
              </p>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Verbesserungsvorschläge
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span className="text-muted-foreground">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refinement Notice */}
            {hasRefinementLeft && score < 80 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  <strong>💡 Tipp:</strong> Sie haben noch eine Verfeinerungsmöglichkeit! Nutzen Sie die obigen Vorschläge, um Ihren Prompt zu verbessern und möglicherweise eine höhere Punktzahl zu erreichen.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}