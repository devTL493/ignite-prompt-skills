import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Target, Zap } from "lucide-react";

interface HeroProps {
  onStartQuiz: () => void;
}

export function Hero({ onStartQuiz }: HeroProps) {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-accent-foreground bg-clip-text text-transparent">
              Prompt-Fähigkeiten Entwickeln
            </h1>
            <p className="text-xl lg:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Meistern Sie die Kunst des KI-Promptings durch interaktive Szenarien. 
              Trainieren Sie Ihr Team, perfekte Prompts zu erstellen, die außergewöhnliche Ergebnisse liefern.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-up">
            <Card className="bg-gradient-card border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4 animate-float">
                  <Brain className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Intelligentes Lernen</h3>
                <p className="text-muted-foreground">
                  Interaktive Szenarien, entwickelt von KI-Experten, um zu fordern und zu lehren
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.2s' }}>
                  <Target className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Echte Szenarien</h3>
                <p className="text-muted-foreground">
                  Üben Sie mit tatsächlichen Geschäftsfällen und realen Herausforderungen
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.4s' }}>
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sofortiges Feedback</h3>
                <p className="text-muted-foreground">
                  Erhalten Sie unmittelbare Erkenntnisse und Verbesserungen für Ihre Prompts
                </p>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              onClick={onStartQuiz}
              size="lg"
              className="bg-gradient-accent hover:bg-gradient-accent/90 text-accent-foreground font-semibold px-12 py-6 text-lg shadow-button hover:shadow-glow transition-all duration-300 hover:scale-105 animate-glow"
            >
              Starten Sie Ihre Reise
            </Button>
            <p className="text-sm text-foreground/60 mt-4">
              Keine Anmeldung erforderlich • Kostenlos testen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}