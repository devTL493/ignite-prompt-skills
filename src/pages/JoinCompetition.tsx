import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useContestantSession } from "@/hooks/useContestantSession";
import { Competition } from "@/types";
import { Trophy, UserPlus, KeyRound, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function JoinCompetition() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [mode, setMode] = useState<"signup" | "resume">("signup");
  const [submitting, setSubmitting] = useState(false);
  const { contestant, loading, signUp, resumeWithCode } = useContestantSession(competitionId || "");

  useEffect(() => {
    if (competitionId) {
      supabase.from("competitions").select("*").eq("id", competitionId).single()
        .then(({ data }) => { if (data) setCompetition(data as Competition); });
    }
  }, [competitionId]);

  useEffect(() => {
    if (contestant && competitionId) {
      navigate(`/compete/${competitionId}`);
    }
  }, [contestant, competitionId, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSubmitting(true);
    try {
      const c = await signUp(fullName.trim(), email.trim() || undefined);
      toast({
        title: "Willkommen!",
        description: `Ihr Zugangscode: ${c.access_code} — Merken Sie sich diesen Code!`,
      });
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setSubmitting(true);
    try {
      await resumeWithCode(accessCode.trim());
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!competition) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Wettbewerb nicht gefunden.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-0 shadow-card">
        <div className="text-center mb-6">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          {competition.description && <p className="text-sm text-muted-foreground mt-2">{competition.description}</p>}
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "bg-gradient-primary flex-1" : "flex-1"}
          >
            <UserPlus className="h-4 w-4 mr-2" />Anmelden
          </Button>
          <Button
            variant={mode === "resume" ? "default" : "outline"}
            onClick={() => setMode("resume")}
            className={mode === "resume" ? "bg-gradient-primary flex-1" : "flex-1"}
          >
            <KeyRound className="h-4 w-4 mr-2" />Fortsetzen
          </Button>
        </div>

        {mode === "signup" ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Vollständiger Name *</label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Max Mustermann" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">E-Mail (optional)</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Teilnehmen
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResume} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Zugangscode</label>
              <Input value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="abc12345" required />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-primary">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sitzung fortsetzen
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
