import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Competition } from "@/types";
import { 
  Trophy, 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  Users
} from "lucide-react";

export default function Landing() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    supabase.from("competitions").select("*").eq("status", "active").order("event_date")
      .then(({ data }) => { if (data) setCompetitions(data as Competition[]); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-red-500/20">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-red-400 mb-8 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Die #1 Plattform für Prompt-Battles</span>
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-bold mb-8 tracking-tight text-white animate-slide-up">
            Prompt<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">CUP</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Der ultimative Prompting-Wettbewerb für den öffentlichen Dienst. 
            Messen Sie Ihre KI-Skills in realistischen Verwaltungsszenarien.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-500 text-white font-semibold h-14 px-8 text-lg shadow-[0_0_30px_-10px_rgba(220,38,38,0.5)] transition-all hover:scale-105">
              <a href="#competitions">
                Jetzt antreten <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
              <Link to="/leaderboard/global">Globales Ranking</Link>
            </Button>
          </div>
        </div>

        {/* Floating Stats Strip */}
        <div className="absolute bottom-0 w-full translate-y-1/2 px-6">
          <div className="container mx-auto max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">KI-Jury</div>
                <div className="text-sm text-slate-500">Objektive Bewertung mit Gemini</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Live PvP</div>
                <div className="text-sm text-slate-500">Echtzeit Multiplayer Battles</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">GovTech</div>
                <div className="text-sm text-slate-500">Spezialisiert auf Verwaltung</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-24">
        
        {/* Features Bento Grid */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Warum PromptCUP?</h2>
            <p className="text-slate-500">Trainieren Sie die Fähigkeit der Zukunft.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="text-red-400" /> Deep Learning Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-lg">
                  Erhalten Sie nicht nur einen Score, sondern detailliertes Feedback zu Ihren Prompts. 
                  Unsere KI analysiert Kontext, Präzision und Kreativität Ihrer Eingaben in Sekunden.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-yellow-500 group-hover:scale-110 transition-transform" /> 
                  Leaderboards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Steigen Sie im Rang auf und vergleichen Sie Ihre Fähigkeiten mit Kollegen aus anderen Behörden.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-red-500 group-hover:rotate-12 transition-transform" /> 
                  Real-World Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Keine abstrakte Theorie. Wir nutzen anonymisierte, echte Fälle aus dem Verwaltungsalltag.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-gradient-to-br from-red-50 to-white border-red-100 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Zap className="text-red-600" /> Instant Skill-Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-900/70">
                  Die schnellste Art, KI-Kompetenz in Ihrer Organisation aufzubauen. 
                  Spielerisch, messbar und kompetitiv.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Competitions Section */}
        <div id="competitions" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Aktive Wettbewerbe</h2>
            <div className="h-1 flex-1 bg-slate-100 ml-6 rounded-full"></div>
          </div>

          {competitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map(c => (
                <Card key={c.id} className="group hover:-translate-y-1 transition-all duration-300 border-slate-200 shadow-sm hover:shadow-xl hover:border-red-200 bg-white">
                  <div className="h-2 w-full bg-gradient-to-r from-red-500 to-orange-500 rounded-t-xl" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                        Live
                      </Badge>
                      {c.event_date && (
                        <span className="text-xs font-medium text-slate-400 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                          {new Date(c.event_date).toLocaleDateString("de-DE")}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-red-600 transition-colors">
                      {c.name}
                    </h3>
                    
                    {c.description && (
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      {c.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4 text-red-400" />
                          {c.location}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button asChild className="w-full bg-slate-900 hover:bg-red-600 transition-colors">
                          <Link to={`/join/${c.id}`}>Teilnehmen</Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                          <Link to={`/leaderboard/${c.id}`}>Ranking</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Keine aktiven Wettbewerbe</h3>
              <p className="text-slate-500">Schauen Sie später wieder vorbei oder kontaktieren Sie Ihren Administrator.</p>
            </div>
          )}
        </div>

        {/* Footer / Admin Link */}
        <div className="mt-24 text-center pt-12 border-t border-slate-200">
          <Button variant="ghost" asChild className="text-slate-400 hover:text-red-600 hover:bg-red-50">
            <Link to="/admin/login">
              <Shield className="h-4 w-4 mr-2" /> Admin Zugang
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
