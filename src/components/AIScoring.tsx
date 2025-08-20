import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Brain, TrendingUp, AlertCircle } from "lucide-react";

interface AIScoringProps {
  prompt: string;
  scenario: {
    title: string;
    context: string;
    goal: string;
    idealPrompt: string;
  };
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
    
    // Simulate AI scoring logic
    let calculatedScore = 50; // Base score
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for key elements
    if (lowerPrompt.includes("tone") || lowerPrompt.includes("professional") || lowerPrompt.includes("empathetic")) {
      calculatedScore += 15;
    }
    
    if (lowerPrompt.includes("specific") || lowerPrompt.includes("include") || lowerPrompt.includes("structure")) {
      calculatedScore += 15;
    }
    
    if (lowerPrompt.includes("context") || lowerPrompt.includes(scenario.title.toLowerCase().split(" ")[0])) {
      calculatedScore += 10;
    }
    
    if (prompt.length > 100) {
      calculatedScore += 10;
    }
    
    if (lowerPrompt.includes("1)") || lowerPrompt.includes("-") || lowerPrompt.includes("•")) {
      calculatedScore += 10;
    }
    
    // Add randomness for realism
    calculatedScore += Math.floor(Math.random() * 20) - 10;
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
    
    // Generate feedback
    const generatedFeedback = generateFeedback(calculatedScore, prompt, scenario);
    const generatedSuggestions = generateSuggestions(calculatedScore, prompt);
    
    setScore(calculatedScore);
    setFeedback(generatedFeedback);
    setSuggestions(generatedSuggestions);
    setIsLoading(false);
    
    onScoreReceived(calculatedScore, generatedFeedback, generatedSuggestions);
  };

  const generateFeedback = (score: number, prompt: string, scenario: any): string => {
    if (score >= 80) {
      return "Excellent prompt! You've included most of the key elements needed for this scenario. Your prompt is specific, well-structured, and addresses the context appropriately.";
    } else if (score >= 60) {
      return "Good foundation! Your prompt covers some important aspects, but there's room for improvement in specificity and structure.";
    } else if (score >= 40) {
      return "Your prompt has potential but needs more detail. Consider being more specific about the desired output format and including more context.";
    } else {
      return "This prompt needs significant improvement. Focus on being more specific, providing clear context, and structuring your request more clearly.";
    }
  };

  const generateSuggestions = (score: number, prompt: string): string[] => {
    const suggestions = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (!lowerPrompt.includes("tone") && !lowerPrompt.includes("professional")) {
      suggestions.push("Specify the desired tone (e.g., professional, empathetic, formal)");
    }
    
    if (!lowerPrompt.includes("include") && !lowerPrompt.includes("structure")) {
      suggestions.push("Provide a clear structure or list of elements to include");
    }
    
    if (prompt.length < 50) {
      suggestions.push("Add more context and specific details to your prompt");
    }
    
    if (!lowerPrompt.includes("1)") && !lowerPrompt.includes("-") && !lowerPrompt.includes("•")) {
      suggestions.push("Consider using numbered points or bullet points for clarity");
    }
    
    if (score < 60) {
      suggestions.push("Reference the specific scenario context in your prompt");
      suggestions.push("Be more explicit about the expected output format");
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", className: "bg-success text-white" };
    if (score >= 60) return { text: "Good", className: "bg-warning text-white" };
    if (score >= 40) return { text: "Fair", className: "bg-secondary text-secondary-foreground" };
    return { text: "Needs Work", className: "bg-destructive text-white" };
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Evaluation
          </h3>
          {hasRefinementLeft && score !== null && score < 80 && (
            <Badge variant="outline" className="text-primary border-primary">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refinement Available
            </Badge>
          )}
        </div>

        {score === null ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Ready to get AI-powered feedback on your prompt? Our advanced language model will analyze your prompt for clarity, specificity, and effectiveness.
            </p>
            <Button
              onClick={simulateAIScoring}
              disabled={isLoading || prompt.trim().length < 20}
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-button w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI is analyzing your prompt...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Score
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
                AI Feedback
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
                  Improvement Suggestions
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
                  <strong>💡 Tip:</strong> You have one refinement opportunity left! Use the suggestions above to improve your prompt and potentially achieve a higher score.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}