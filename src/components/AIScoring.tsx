import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Scenario } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  const evaluatePrompt = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-prompt', {
        body: {
          prompt,
          scenarioTitle: scenario.title,
          scenarioContext: scenario.context,
          scenarioGoal: scenario.goal,
          idealPrompt: scenario.idealPrompt,
          evaluationCriteria: scenario.evaluation.criteria,
          keyPhrases: scenario.evaluation.keyPhrases,
          commonMistakes: scenario.evaluation.commonMistakes,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const calculatedScore = data.score;
      const generatedFeedback = data.feedback;
      const generatedSuggestions = data.suggestions || [];

      setScore(calculatedScore);
      setFeedback(generatedFeedback);
      setSuggestions(generatedSuggestions);
      onScoreReceived(calculatedScore, generatedFeedback, generatedSuggestions);
    } catch (err: any) {
      console.error('Evaluation error:', err);
      toast({
        title: "Bewertung fehlgeschlagen",
        description: err.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              Bereit für KI-gestütztes Feedback zu Ihrem Prompt? Google Gemini wird Ihren Prompt auf Klarheit, Spezifität und Effektivität analysieren.
            </p>
            <Button
              onClick={evaluatePrompt}
              disabled={isLoading || prompt.trim().length < 20}
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-button w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gemini analysiert Ihren Prompt...
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

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                KI-Feedback
              </h4>
              <p className="text-muted-foreground bg-accent-soft p-4 rounded-lg">
                {feedback}
              </p>
            </div>

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
