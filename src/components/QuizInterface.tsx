import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Lightbulb, Target, RefreshCw, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { AIScoring } from "./AIScoring";
import { ScenarioNavigator } from "./ScenarioNavigator";
import { Scenario } from "@/types";
import { useProgress } from "@/hooks/useProgress";

interface QuizInterfaceProps {
  onBack: () => void;
  scenarios: Scenario[];
}

export function QuizInterface({ onBack, scenarios }: QuizInterfaceProps) {
  const { progress, setCurrentScenario: updateCurrentScenario } = useProgress();
  const [currentScenario, setCurrentScenario] = useState(progress?.currentScenario || 0);
  const [userPrompt, setUserPrompt] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [hasRefined, setHasRefined] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const scenario = scenarios[currentScenario];
  const progressPercentage = ((currentScenario + 1) / scenarios.length) * 100;

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(userPrompt.length > 0 && !showFeedback);
  }, [userPrompt, showFeedback]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft' && currentScenario > 0) {
        e.preventDefault();
        handleScenarioChange(currentScenario - 1);
      } else if (e.key === 'ArrowRight' && currentScenario < scenarios.length - 1) {
        e.preventDefault();
        handleScenarioChange(currentScenario + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScenario, scenarios.length]);

  const handleScenarioChange = (newScenario: number) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Sie haben ungespeicherte Änderungen. Möchten Sie wirklich das Szenario wechseln?"
      );
      if (!confirmed) return;
    }

    setCurrentScenario(newScenario);
    updateCurrentScenario(newScenario);
    resetScenarioState();
  };

  const resetScenarioState = () => {
    setUserPrompt("");
    setShowFeedback(false);
    setShowHints(false);
    setAiScore(null);
    setAiFeedback("");
    setAiSuggestions([]);
    setHasRefined(false);
    setIsRefining(false);
    setHasUnsavedChanges(false);
  };

  const evaluatePrompt = () => {
    const criteria = scenario.evaluation.criteria;
    let matchedCriteria = 0;
    
    // Simple evaluation based on keyword matching and structure
    criteria.forEach(criterion => {
      if (criterion.toLowerCase().includes("tone") || criterion.toLowerCase().includes("empathetic")) {
        if (userPrompt.toLowerCase().includes("empathetic") || userPrompt.toLowerCase().includes("professional") || userPrompt.toLowerCase().includes("tone")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("specific") || criterion.toLowerCase().includes("context")) {
        if (userPrompt.toLowerCase().includes("damaged") || userPrompt.toLowerCase().includes("product") || userPrompt.toLowerCase().includes("customer")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("structure") || criterion.toLowerCase().includes("include")) {
        if (userPrompt.includes("1)") || userPrompt.includes("-") || userPrompt.includes("•")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("solution") || criterion.toLowerCase().includes("approach")) {
        if (userPrompt.toLowerCase().includes("solution") || userPrompt.toLowerCase().includes("resolve") || userPrompt.toLowerCase().includes("fix")) {
          matchedCriteria++;
        }
      } else if (criterion.toLowerCase().includes("time") || criterion.toLowerCase().includes("budget")) {
        if (userPrompt.toLowerCase().includes("90") || userPrompt.toLowerCase().includes("budget") || userPrompt.toLowerCase().includes("$")) {
          matchedCriteria++;
        }
      }
    });

    const currentScore = Math.round((matchedCriteria / criteria.length) * 100);
    setScore(currentScore);
    setShowFeedback(true);
  };

  const handleAIScoreReceived = (score: number, feedback: string, suggestions: string[]) => {
    setAiScore(score);
    setAiFeedback(feedback);
    setAiSuggestions(suggestions);
    setShowFeedback(true);
  };

  const handleRefinePrompt = () => {
    setIsRefining(true);
    setShowFeedback(false);
    setAiScore(null);
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      handleScenarioChange(currentScenario + 1);
    }
  };

  const previousScenario = () => {
    if (currentScenario > 0) {
      handleScenarioChange(currentScenario - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Anfänger": return "bg-success text-white";
      case "Mittelstufe": return "bg-warning text-white";
      case "Fortgeschritten": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowNavigator(!showNavigator)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              Szenario-Übersicht
            </Button>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Szenario {currentScenario + 1} von {scenarios.length}
              </p>
              <Progress value={progressPercentage} className="w-32" />
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={previousScenario}
            disabled={currentScenario === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorheriges
          </Button>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-warning border-warning">
                Ungespeicherte Änderungen
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Verwenden Sie ←/→ Pfeiltasten zur Navigation
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={nextScenario}
            disabled={currentScenario >= scenarios.length - 1}
            className="flex items-center gap-2"
          >
            Nächstes
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Scenario Navigator */}
        {showNavigator && (
          <div className="mb-8 animate-slide-up">
            <ScenarioNavigator
              scenarios={scenarios}
              currentScenario={currentScenario}
              onSelectScenario={(index) => {
                handleScenarioChange(index);
                setShowNavigator(false);
              }}
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scenario Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-accent">
                      {scenario.category}
                    </Badge>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">{scenario.title}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-accent" />
                        Szenario
                      </h3>
                      <p className="text-muted-foreground">{scenario.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Kontext</h3>
                      <p className="text-muted-foreground text-sm bg-accent-soft p-3 rounded-lg">
                        {scenario.context}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Ihr Ziel</h3>
                      <p className="text-accent">{scenario.goal}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Hints */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 mb-4 hover:bg-accent-soft"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHints ? "Hinweise ausblenden" : "Hinweise anzeigen"}
                  </Button>
                  
                  {showHints && (
                    <div className="space-y-2">
                      {scenario.hints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-accent">•</span>
                          {hint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Prompt Input Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Schreiben Sie Ihren Prompt</h3>
                  
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Schreiben Sie Ihren Prompt hier... Seien Sie spezifisch, klar und berücksichtigen Sie den bereitgestellten Kontext."
                    className="min-h-48 bg-background/50 border-muted resize-none"
                    disabled={showFeedback && !isRefining}
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        {userPrompt.length} Zeichen
                      </p>
                      {isRefining && (
                        <Badge variant="outline" className="text-primary border-primary">
                          Wird verfeinert
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {showFeedback && !hasRefined && aiScore !== null && aiScore < 80 && (
                        <Button
                          onClick={handleRefinePrompt}
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Prompt verfeinern
                        </Button>
                      )}
                      
                      {showFeedback ? (
                        <Button
                          onClick={nextScenario}
                          className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-button"
                          disabled={currentScenario >= scenarios.length - 1}
                        >
                          Nächstes Szenario
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Scoring */}
              <AIScoring
                prompt={userPrompt}
                scenario={scenario}
                onScoreReceived={(score, feedback, suggestions) => {
                  handleAIScoreReceived(score, feedback, suggestions);
                  if (isRefining) {
                    setHasRefined(true);
                    setIsRefining(false);
                  }
                }}
                hasRefinementLeft={!hasRefined}
              />

              {/* Reference Materials */}
              {showFeedback && (
                <Card className="bg-gradient-card border-0 shadow-card animate-slide-up">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Referenzmaterialien</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Bewertungskriterien</h4>
                        <div className="space-y-2">
                          {scenario.evaluation.criteria.map((criterion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-success mt-0.5" />
                              {criterion}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Beispiel Experten-Prompt</h4>
                        <p className="text-sm text-muted-foreground bg-accent-soft p-3 rounded-lg">
                          {scenario.evaluation.sampleGoodPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}