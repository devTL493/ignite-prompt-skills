import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Competition } from "@/types";
import { Trophy, Shield, Brain, Target, Zap, Calendar, MapPin } from "lucide-react";

export default function Landing() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    supabase.from("competitions").select("*").eq("status", "active").order("event_date")
      .then(({ data }) => { if (data) setCompetitions(data as Competition[]); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container mx-auto px-6 py-20 relative z-10 text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">PromptCUP</h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Prompting-Wettbewerbe für den öffentlichen Dienst. Treten Sie an, lernen Sie und verbessern Sie Ihre KI-Prompt-Fähigkeiten.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-gradient-card border-0 shadow-card text-center">
            <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">KI-gestützte Bewertung</h3>
            <p className="text-muted-foreground text-sm">Ihre Prompts werden von Google Gemini analysiert und bewertet.</p>
          </Card>
          <Card className="p-6 bg-gradient-card border-0 shadow-card text-center">
            <Target className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Realistische Szenarien</h3>
            <p className="text-muted-foreground text-sm">Üben Sie mit echten Anwendungsfällen aus dem öffentlichen Dienst.</p>
          </Card>
          <Card className="p-6 bg-gradient-card border-0 shadow-card text-center">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live-Leaderboard</h3>
            <p className="text-muted-foreground text-sm">Vergleichen Sie sich mit anderen Teilnehmern in Echtzeit.</p>
          </Card>
        </div>

        {/* Active Competitions */}
        <h2 className="text-3xl font-bold mb-8 text-center">Aktive Wettbewerbe</h2>
        {competitions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {competitions.map(c => (
              <Card key={c.id} className="p-6 bg-gradient-card border-0 shadow-card">
                <Badge className="bg-success text-white mb-3">Aktiv</Badge>
                <h3 className="text-xl font-semibold mb-2">{c.name}</h3>
                {c.description && <p className="text-sm text-muted-foreground mb-4">{c.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                  {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                  {c.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.event_date).toLocaleDateString("de-DE")}</span>}
                </div>
                <div className="flex gap-2">
                  <Button asChild className="bg-gradient-primary flex-1">
                    <Link to={`/join/${c.id}`}>Teilnehmen</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/leaderboard/${c.id}`}>Leaderboard</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mb-12">Derzeit keine aktiven Wettbewerbe.</p>
        )}

        {/* Admin link */}
        <div className="text-center">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to="/admin/login"><Shield className="h-4 w-4 mr-2" />Admin-Bereich</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
