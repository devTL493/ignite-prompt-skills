import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, RefreshCw, Award, Users, TrendingUp, Clock } from "lucide-react";
import { UserProgress } from "@/types";
import { ProgressTracker } from "./ProgressTracker";
import { CompletionCertificate } from "./CompletionCertificate";

interface DashboardProps {
  progress: UserProgress;
  totalScenarios: number;
  onStartNewSession: () => void;
  onBackToQuiz: () => void;
}

export function Dashboard({ progress, totalScenarios, onStartNewSession, onBackToQuiz }: DashboardProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  
  const completionPercentage = Math.round((progress.completedScenarios.length / totalScenarios) * 100);
  const isCompleted = progress.completedScenarios.length === totalScenarios;

  // Prepare chart data
  const scoreData = progress.completedScenarios.map((scenario, index) => ({
    name: `Szenario ${scenario.scenarioId}`,
    initial: scenario.initialScore,
    final: scenario.finalScore,
    improvement: scenario.finalScore - scenario.initialScore
  }));

  const categoryData = progress.completedScenarios.reduce((acc, scenario) => {
    // This would need category mapping from scenario ID - simplified for demo
    const categories = ['Bürgerkommunikation', 'Strategieentwicklung', 'KI & Technologie', 'Rechtskommunikation', 'Inklusive Kommunikation'];
    const category = categories[(scenario.scenarioId - 1) % categories.length];
    
    if (!acc[category]) {
      acc[category] = { category, avgScore: 0, count: 0 };
    }
    acc[category].avgScore += scenario.finalScore;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const categoryChartData = Object.values(categoryData).map((item: any) => ({
    category: item.category,
    avgScore: Math.round(item.avgScore / item.count)
  }));

  const skillDistribution = [
    { name: 'Exzellent (80-100%)', value: progress.completedScenarios.filter(s => s.finalScore >= 80).length, color: '#10b981' },
    { name: 'Gut (60-79%)', value: progress.completedScenarios.filter(s => s.finalScore >= 60 && s.finalScore < 80).length, color: '#f59e0b' },
    { name: 'Verbesserungsbedarf (<60%)', value: progress.completedScenarios.filter(s => s.finalScore < 60).length, color: '#ef4444' }
  ];

  const getSkillLevel = (): "Grundkenntnisse" | "Kompetent" | "Experte" => {
    if (progress.averageScore >= 80) return "Experte";
    if (progress.averageScore >= 65) return "Kompetent";
    return "Grundkenntnisse";
  };

  const exportResults = () => {
    const csvContent = [
      ['Szenario ID', 'Initiale Bewertung', 'Finale Bewertung', 'Verbesserung', 'Verfeinert', 'Zeit (Min)', 'Abgeschlossen am'].join(','),
      ...progress.completedScenarios.map(scenario => [
        scenario.scenarioId,
        scenario.initialScore,
        scenario.finalScore,
        scenario.finalScore - scenario.initialScore,
        scenario.hasRefined ? 'Ja' : 'Nein',
        Math.round(scenario.timeSpent / 60),
        scenario.completedAt.toLocaleDateString('de-DE')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prompt-skills-ergebnisse-${progress.userName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showCertificate && isCompleted) {
    return (
      <CompletionCertificate
        userName={progress.userName}
        completionDate={new Date()}
        totalScore={progress.averageScore}
        scenariosCompleted={progress.completedScenarios.length}
        skillLevel={getSkillLevel()}
        department="Öffentlicher Sektor"
        onClose={() => setShowCertificate(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard - {progress.userName}</h1>
            <p className="text-muted-foreground">
              Ihre Entwicklung in der KI-Prompt-Erstellung für den öffentlichen Sektor
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Ergebnisse exportieren
            </Button>
            {isCompleted ? (
              <Button onClick={() => setShowCertificate(true)} className="bg-gradient-primary">
                <Award className="h-4 w-4 mr-2" />
                Zertifikat anzeigen
              </Button>
            ) : (
              <Button onClick={onBackToQuiz} className="bg-gradient-primary">
                Training fortsetzen
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Tracker */}
          <div className="lg:col-span-1">
            <ProgressTracker progress={progress} totalScenarios={totalScenarios} />
          </div>

          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Over Time */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Leistungsentwicklung
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value}%`, 
                          name === 'initial' ? 'Erste Bewertung' : 'Finale Bewertung'
                        ]}
                      />
                      <Bar dataKey="initial" fill="hsl(var(--muted))" name="initial" />
                      <Bar dataKey="final" fill="hsl(var(--primary))" name="final" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Category Performance */}
            {categoryChartData.length > 0 && (
              <Card className="bg-gradient-card border-0 shadow-card">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Leistung nach Kategorie</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => [`${value}%`, 'Durchschnittsscore']} />
                        <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            )}

            {/* Skill Distribution */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Bewertungsverteilung</h3>
                <div className="flex items-center gap-8">
                  <div className="h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={skillDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {skillDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {skillDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}: {item.value} Szenarien
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="bg-gradient-card border-0 shadow-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Nächste Schritte</h3>
                <div className="space-y-4">
                  {!isCompleted && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary mb-3">
                        <strong>Training fortsetzen:</strong> Sie haben noch {totalScenarios - progress.completedScenarios.length} Szenarien zu absolvieren.
                      </p>
                      <Button onClick={onBackToQuiz} className="bg-gradient-primary">
                        Weiter trainieren
                      </Button>
                    </div>
                  )}
                  
                  <div className="p-4 bg-accent-soft rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Möchten Sie Ihre Fähigkeiten in anderen Bereichen testen oder das Training wiederholen?
                    </p>
                    <Button variant="outline" onClick={onStartNewSession}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Neues Training starten
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}