import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Competition } from "@/types";
import { 
  Trophy, 
  Brain, 
  Target, 
  Zap, 
  MapPin, 
  ArrowRight, 
  Shield 
} from "lucide-react";

export default function Landing() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    supabase.from("competitions").select("*").eq("status", "active").order("event_date")
      .then(({ data }) => { if (data) setCompetitions(data as Competition[]); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative selection:bg-red-500/30 overflow-hidden">
      
      {/* --- BACKGROUND ANIMATION START --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Main Red Blob */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] animate-blob" />
        
        {/* Secondary Orange Blob (Delayed) */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] animate-blob" 
             style={{ animationDelay: "2s" }} />
             
        {/* Tertiary Purple Blob (Bottom) */}
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-blob" 
             style={{ animationDelay: "4s" }} />
      </div>
      {/* --- BACKGROUND ANIMATION END --- */}

      <div className="relative z-10 container mx-auto px-6">
        
        {/* 1. Slim Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-red-400 text-sm mb-8 animate-fade-in backdrop-blur-sm">
            <Trophy className="w-3 h-3" />
            <span className="font-medium tracking-wide uppercase text-xs">Bundesagentur für Arbeit KI-Challenge</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-slide-up">
            Prompt<span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">CUP</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Der Wettbewerb für KI-Kompetenz im öffentlichen Dienst. <br className="hidden md:block" />
            Lösen Sie echte Verwaltungsszenarien mit präzisen Prompts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 h-12 text-base font-medium shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] transition-all hover:scale-105">
              <a href="#competitions">
                Wettbewerb wählen
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-full px-8 h-12">
              <Link to="/leaderboard/global">Globales Ranking</Link>
            </Button>
          </div>
        </div>

        {/* 2. Core Features */}
        <div className="grid md:grid-cols-3 gap-12 py-24 border-t border-white/5 relative">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center text-red-500 backdrop-blur-sm">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">KI-Analyse</h3>
            <p className="text-slate-400 leading-relaxed">
              Erhalten Sie sofortiges Feedback. Unsere Engine bewertet Kontext, Präzision und Effizienz Ihrer Prompts.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center text-orange-500 backdrop-blur-sm">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Reale Szenarien</h3>
            <p className="text-slate-400 leading-relaxed">
              Keine Theorie. Bearbeiten Sie echte, anonymisierte Fälle aus dem Verwaltungsalltag.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-center text-yellow-500 backdrop-blur-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Live Ranking</h3>
            <p className="text-slate-400 leading-relaxed">
              Vergleichen Sie Ihre Ergebnisse in Echtzeit mit Kollegen aus anderen Behörden.
            </p>
          </div>
        </div>

        {/* 3. Competitions Section */}
        <div id="competitions" className="py-24 scroll-mt-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Aktive Wettbewerbe</h2>
              <p className="text-slate-400">Wählen Sie einen Raum, um zu starten.</p>
            </div>
          </div>

          {competitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map(c => (
                <Card key={c.id} className="group bg-slate-900/40 border-white/5 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(220,38,38,0.2)] backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-0 uppercase tracking-wider text-[10px]">
                        Live
                      </Badge>
                      {c.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" /> {c.location}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                      {c.name}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-8 line-clamp-2 min-h-[40px]">
                      {c.description || "Treten Sie jetzt bei und stellen Sie Ihre Fähigkeiten unter Beweis."}
                    </p>

                    <Button asChild className="w-full bg-white text-black hover:bg-slate-200 font-medium">
                      <Link to={`/join/${c.id}`}>
                        Jetzt teilnehmen <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
              <p className="text-slate-400">Derzeit sind keine Wettbewerbe aktiv.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-12 text-center border-t border-white/5">
          <Link to="/admin/login" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-400 transition-colors">
            <Shield className="w-3 h-3 mr-2" /> Admin Zugang
          </Link>
        </div>
      </div>
    </div>
  );
}
