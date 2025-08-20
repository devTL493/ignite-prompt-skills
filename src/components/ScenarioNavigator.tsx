import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, Circle, ChevronRight } from "lucide-react";
import { Scenario } from "@/types";
import { useProgress } from "@/hooks/useProgress";

interface ScenarioNavigatorProps {
  scenarios: Scenario[];
  currentScenario: number;
  onSelectScenario: (index: number) => void;
  className?: string;
}

export function ScenarioNavigator({ 
  scenarios, 
  currentScenario, 
  onSelectScenario,
  className = ""
}: ScenarioNavigatorProps) {
  const { progress, getScenarioResult, getScenarioStatus } = useProgress();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Anfänger": return "bg-success/10 text-success border-success";
      case "Mittelstufe": return "bg-warning/10 text-warning border-warning";
      case "Fortgeschritten": return "bg-primary/10 text-primary border-primary";
      default: return "bg-muted/10 text-muted-foreground border-muted";
    }
  };

  const getStatusIcon = (scenarioId: number) => {
    const status = getScenarioStatus(scenarioId);
    const isActive = scenarioId === currentScenario;
    
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-success" />;
      case "partial":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Circle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />;
    }
  };

  const overallProgress = progress ? (progress.completedScenarios.length / scenarios.length) * 100 : 0;

  return (
    <Card className={`bg-gradient-card border-0 shadow-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Szenario-Übersicht</h3>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">
              Gesamtfortschritt: {Math.round(overallProgress)}%
            </p>
            <Progress value={overallProgress} className="w-24" />
          </div>
        </div>

        <div className="space-y-3">
          {scenarios.map((scenario, index) => {
            const result = getScenarioResult(index);
            const status = getScenarioStatus(index);
            const isActive = index === currentScenario;
            
            return (
              <Button
                key={scenario.id}
                variant="ghost"
                onClick={() => onSelectScenario(index)}
                className={`w-full h-auto p-4 justify-start hover:bg-accent-soft ${
                  isActive ? 'bg-accent-soft border border-accent' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(index)}
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {index + 1}. {scenario.title}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}
                      >
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{scenario.category}</span>
                      {result && (
                        <span className="text-primary font-medium">
                          Score: {result.finalScore}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}