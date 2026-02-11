import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useContestantSession } from "@/hooks/useContestantSession";
import { DBScenario, Submission, CompetitionFile } from "@/types";
import { ArrowLeft, ChevronLeft, ChevronRight, Lightbulb, Target, Brain, Loader2, Check, TrendingUp, AlertCircle, FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CompeteInterface() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { contestant, loading: sessionLoading } = useContestantSession(competitionId || "");
  const [scenarios, setScenarios] = useState<DBScenario[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentResult, setCurrentResult] = useState<{ score: number; feedback: string; suggestions: string[] } | null>(null);
  const [competitionFiles, setCompetitionFiles] = useState<CompetitionFile[]>([]);
  const [showFilesDialog, setShowFilesDialog] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !contestant) {
      navigate(`/join/${competitionId}`);
    }
  }, [sessionLoading, contestant, competitionId, navigate]);

  useEffect(() => {
    if (competitionId && contestant) {
      fetchData();
      fetchFiles();
    }
  }, [competitionId, contestant]);

  const fetchData = async () => {
    const [scenRes, subRes] = await Promise.all([
      supabase.from("competition_scenarios")
        .select("scenario_id, sort_order")
        .eq("competition_id", competitionId!)
        .order("sort_order"),
      supabase.from("submissions")
        .select("*")
        .eq("competition_id", competitionId!)
        .eq("contestant_id", contestant!.id),
    ]);

    if (scenRes.data) {
      const ids = scenRes.data.map((cs: any) => cs.scenario_id);
      if (ids.length > 0) {
        const { data: scenarioData } = await supabase
          .from("scenarios")
          .select("*")
          .in("id", ids);
        if (scenarioData) {
          const orderMap = new Map(scenRes.data.map((cs: any, i: number) => [cs.scenario_id, cs.sort_order]));
          const sorted = (scenarioData as DBScenario[]).sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
          setScenarios(sorted);
        }
      }
    }
    if (subRes.data) setSubmissions(subRes.data as Submission[]);
  };

  const fetchFiles = async () => {
    const { data } = await supabase
      .from("competition_files")
      .select("*")
      .eq("competition_id", competitionId!);
    if (data) setCompetitionFiles(data as unknown as CompetitionFile[]);
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("competition-files").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const scenario = scenarios[currentIndex];
  const existingSubmission = scenario ? submissions.find(s => s.scenario_id === scenario.id) : null;

  const handleEvaluate = async () => {
    if (!scenario || !contestant || userPrompt.trim().length < 20) return;
    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-prompt", {
        body: {
          prompt: userPrompt,
          scenarioTitle: scenario.title,
          scenarioContext: scenario.context,
          scenarioGoal: scenario.goal,
          idealPrompt: scenario.ideal_prompt,
          evaluationCriteria: scenario.evaluation?.criteria || [],
          keyPhrases: scenario.evaluation?.keyPhrases || [],
          commonMistakes: scenario.evaluation?.commonMistakes || [],
          department: scenario.department,
          category: scenario.category,
          competitionFiles: competitionFiles.map(f => ({ file_name: f.file_name, file_type: f.file_type })),
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const result = { score: data.score, feedback: data.feedback, suggestions: data.suggestions || [] };
      setCurrentResult(result);

      await supabase.from("submissions").insert({
        contestant_id: contestant.id,
        scenario_id: scenario.id,
        competition_id: competitionId!,
        user_prompt: userPrompt,
        initial_score: result.score,
        final_score: result.score,
        ai_feedback: result.feedback,
        ai_suggestions: result.suggestions,
      });

      const { data: subs } = await supabase.from("submissions")
        .select("*")
        .eq("competition_id", competitionId!)
        .eq("contestant_id", contestant.id);
      if (subs) setSubmissions(subs as Submission[]);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  };

  const goToScenario = (index: number) => {
    setCurrentIndex(index);
    setUserPrompt("");
    setCurrentResult(null);
    setShowHints(false);
  };

  if (sessionLoading || !contestant) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );

  if (scenarios.length === 0) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-muted-foreground">Keine Szenarien für diesen Wettbewerb konfiguriert.</p>
      <Button variant="outline" onClick={() => navigate(`/join/${competitionId}`)}>Zurück</Button>
    </div>
  );

  const progressPct = ((submissions.length) / scenarios.length) * 100;

  const getDifficultyColor = (d: string) => {
    if (d === "Anfänger") return "bg-success text-white";
    if (d === "Mittelstufe") return "bg-warning text-white";
    return "bg-primary text-primary-foreground";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/leaderboard/${competitionId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Leaderboard
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Teilnehmer: <strong>{contestant.full_name}</strong></p>
              <p className="text-xs text-muted-foreground">Code: {contestant.access_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {competitionFiles.length > 0 && (
              <Button variant="outline" onClick={() => setShowFilesDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />Hilfsmaterialien ({competitionFiles.length})
              </Button>
            )}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Szenario {currentIndex + 1} von {scenarios.length}</p>
              <Progress value={progressPct} className="w-32" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => goToScenario(currentIndex - 1)} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />Vorheriges
          </Button>
          <div className="flex gap-1">
            {scenarios.map((s, i) => {
              const done = submissions.some(sub => sub.scenario_id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => goToScenario(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    i === currentIndex
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3 w-3 mx-auto" /> : i + 1}
                </button>
              );
            })}
          </div>
          <Button variant="outline" onClick={() => goToScenario(currentIndex + 1)} disabled={currentIndex >= scenarios.length - 1}>
            Nächstes<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Scenario */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
                <Badge variant="outline">{scenario.category}</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-4">{scenario.title}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Szenario</h3>
                  <p className="text-muted-foreground">{scenario.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Kontext</h3>
                  <p className="text-muted-foreground text-sm bg-accent-soft p-3 rounded-lg">{scenario.context}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ihr Ziel</h3>
                  <p className="text-primary">{scenario.goal}</p>
                </div>
              </div>
            </Card>

            {scenario.hints && scenario.hints.length > 0 && (
              <Card className="bg-gradient-card border-0 shadow-card p-6">
                <Button variant="ghost" onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" />{showHints ? "Hinweise ausblenden" : "Hinweise anzeigen"}
                </Button>
                {showHints && (
                  <div className="space-y-1">
                    {scenario.hints.map((h, i) => (
                      <p key={i} className="text-sm text-muted-foreground">• {h}</p>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Input + Results */}
          <div className="space-y-6">
            {existingSubmission && !currentResult ? (
              <Card className="bg-gradient-card border-0 shadow-card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />Bereits eingereicht
                </h3>
                <div className="text-center mb-4">
                  <span className={`text-4xl font-bold ${getScoreColor(existingSubmission.final_score)}`}>{existingSubmission.final_score}%</span>
                </div>
                <p className="text-sm text-muted-foreground bg-accent-soft p-3 rounded-lg">{existingSubmission.ai_feedback}</p>
              </Card>
            ) : (
              <>
                <Card className="bg-gradient-card border-0 shadow-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Schreiben Sie Ihren Prompt</h3>
                  <Textarea
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="Schreiben Sie Ihren Prompt hier..."
                    className="min-h-48 bg-background/50 border-muted resize-none"
                    disabled={!!currentResult}
                  />
                  <p className="text-sm text-muted-foreground mt-2">{userPrompt.length} Zeichen</p>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-card p-6">
                  {!currentResult ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Bereit für die KI-Bewertung?</p>
                      <Button
                        onClick={handleEvaluate}
                        disabled={isEvaluating || userPrompt.trim().length < 20}
                        className="w-full bg-gradient-primary shadow-button"
                      >
                        {isEvaluating ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analysiert...</>
                        ) : (
                          <><Brain className="h-4 w-4 mr-2" />KI-Bewertung erhalten</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${getScoreColor(currentResult.score)}`}>{currentResult.score}%</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />KI-Feedback</h4>
                        <p className="text-muted-foreground bg-accent-soft p-3 rounded-lg">{currentResult.feedback}</p>
                      </div>
                      {currentResult.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary" />Vorschläge</h4>
                          {currentResult.suggestions.map((s, i) => (
                            <p key={i} className="text-sm text-muted-foreground">• {s}</p>
                          ))}
                        </div>
                      )}
                      {currentIndex < scenarios.length - 1 && (
                        <Button onClick={() => goToScenario(currentIndex + 1)} className="w-full bg-gradient-primary">
                          Nächstes Szenario
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Hilfsmaterialien
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {competitionFiles.map(f => (
              <a
                key={f.id}
                href={getFileUrl(f.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-accent-soft hover:bg-accent transition-colors"
              >
                <Download className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{f.file_name}</p>
                  <p className="text-xs text-muted-foreground">{f.file_type || "Datei"}</p>
                </div>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
