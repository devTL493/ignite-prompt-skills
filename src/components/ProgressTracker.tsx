import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { UserProgress } from "@/types";

interface ProgressTrackerProps {
  progress: UserProgress;
  totalScenarios: number;
}

export function ProgressTracker({ progress, totalScenarios }: ProgressTrackerProps) {
  const completionPercentage = Math.round((progress.completedScenarios.length / totalScenarios) * 100);
  const timeSpent = progress.completedScenarios.reduce((total, scenario) => total + scenario.timeSpent, 0);
  const avgTimePerScenario = progress.completedScenarios.length > 0 
    ? Math.round(timeSpent / progress.completedScenarios.length / 60) 
    : 0;

  const getSkillBadge = () => {
    if (progress.averageScore >= 80) return { text: "Experte", className: "bg-success text-white" };
    if (progress.averageScore >= 65) return { text: "Kompetent", className: "bg-warning text-white" };
    return { text: "Grundkenntnisse", className: "bg-secondary text-secondary-foreground" };
  };

  const skillBadge = getSkillBadge();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Ihr Fortschritt</h2>
        <p className="text-muted-foreground">Entwicklung Ihrer Prompt-Fähigkeiten im öffentlichen Sektor</p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-card border-0 shadow-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gesamtfortschritt</span>
            </div>
            <Badge className={skillBadge.className}>
              {skillBadge.text}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Abgeschlossene Szenarien</span>
                <span>{progress.completedScenarios.length} von {totalScenarios}</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div className="font-bold text-lg">{progress.averageScore}%</div>
                <div className="text-xs text-muted-foreground">Durchschnitt</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="font-bold text-lg">{avgTimePerScenario}min</div>
                <div className="text-xs text-muted-foreground">Ø pro Szenario</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="font-bold text-lg">{progress.completedScenarios.filter(s => s.hasRefined).length}</div>
                <div className="text-xs text-muted-foreground">Verfeinerungen</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Scenario Details */}
      {progress.completedScenarios.length > 0 && (
        <Card className="bg-gradient-card border-0 shadow-card">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Szenario-Details</h3>
            <div className="space-y-3">
              {progress.completedScenarios.map((scenario, index) => (
                <div key={scenario.scenarioId} className="flex items-center justify-between p-3 bg-accent-soft rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">Szenario {scenario.scenarioId}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(scenario.timeSpent / 60)} Min • 
                        {scenario.hasRefined ? " Verfeinert" : " Direkt abgeschlossen"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{scenario.finalScore}%</div>
                    {scenario.hasRefined && (
                      <div className="text-xs text-muted-foreground">
                        +{scenario.finalScore - scenario.initialScore} durch Verfeinerung
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}