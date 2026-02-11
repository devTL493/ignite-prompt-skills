import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Competition, Contestant, Submission, DBScenario } from "@/types";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RankedContestant {
  contestant: Contestant;
  avgScore: number;
  submissions: number;
  scores: Record<string, number>;
}

export default function Leaderboard() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [ranked, setRanked] = useState<RankedContestant[]>([]);
  const [scenarios, setScenarios] = useState<DBScenario[]>([]);

  useEffect(() => {
    if (competitionId) fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    const [compRes, contRes, subRes, csRes] = await Promise.all([
      supabase.from("competitions").select("*").eq("id", competitionId!).single(),
      supabase.from("contestants").select("*").eq("competition_id", competitionId!),
      supabase.from("submissions").select("*").eq("competition_id", competitionId!),
      supabase.from("competition_scenarios").select("scenario_id, sort_order").eq("competition_id", competitionId!).order("sort_order"),
    ]);

    if (compRes.data) setCompetition(compRes.data as Competition);

    if (csRes.data && csRes.data.length > 0) {
      const ids = csRes.data.map((cs: any) => cs.scenario_id);
      const { data: scenData } = await supabase.from("scenarios").select("*").in("id", ids);
      if (scenData) {
        const orderMap = new Map(csRes.data.map((cs: any) => [cs.scenario_id, cs.sort_order]));
        setScenarios((scenData as DBScenario[]).sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)));
      }
    }

    if (contRes.data && subRes.data) {
      const contestants = contRes.data as Contestant[];
      const submissions = subRes.data as Submission[];

      const ranking: RankedContestant[] = contestants.map(c => {
        const subs = submissions.filter(s => s.contestant_id === c.id);
        // Keep only the best submission per scenario
        const bestPerScenario: Record<string, number> = {};
        subs.forEach(s => {
          if (!bestPerScenario[s.scenario_id] || s.final_score > bestPerScenario[s.scenario_id]) {
            bestPerScenario[s.scenario_id] = s.final_score;
          }
        });
        const scores = Object.values(bestPerScenario);
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        return { contestant: c, avgScore: avg, submissions: scores.length, scores: bestPerScenario };
      }).sort((a, b) => b.avgScore - a.avgScore);

      setRanked(ranking);
    }
  };

  const medalIcon = (i: number) => {
    if (i === 0) return <Medal className="h-5 w-5 text-warning" />;
    if (i === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (i === 2) return <Medal className="h-5 w-5 text-primary" />;
    return <span className="text-sm text-muted-foreground font-mono">{i + 1}</span>;
  };

  if (!competition) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Startseite</Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{competition.name} — Leaderboard</h1>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-card border-0 shadow-card overflow-hidden">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Teilnehmer</TableHead>
                  {scenarios.map(s => (
                    <TableHead key={s.id} className="text-center text-xs">{s.title}</TableHead>
                  ))}
                  <TableHead className="text-center">Ø Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((r, i) => (
                  <TableRow key={r.contestant.id} className={i < 3 ? "bg-primary/5" : ""}>
                    <TableCell>{medalIcon(i)}</TableCell>
                    <TableCell className="font-medium">{r.contestant.full_name}</TableCell>
                    {scenarios.map(s => (
                      <TableCell key={s.id} className="text-center">
                        {r.scores[s.id] !== undefined ? (
                          <Badge className={
                            r.scores[s.id] >= 80 ? "bg-success text-white" :
                            r.scores[s.id] >= 60 ? "bg-warning text-white" :
                            "bg-destructive text-white"
                          }>
                            {r.scores[s.id]}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <span className="text-lg font-bold">{r.avgScore}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {ranked.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={scenarios.length + 3} className="text-center py-12 text-muted-foreground">
                      Noch keine Teilnehmer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
