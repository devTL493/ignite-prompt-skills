import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Download, X, Calendar, User, Trophy } from "lucide-react";
import { CertificateData } from "@/types";

interface CompletionCertificateProps extends CertificateData {
  onClose: () => void;
}

export function CompletionCertificate({ 
  userName, 
  completionDate, 
  totalScore, 
  scenariosCompleted, 
  skillLevel, 
  department,
  onClose 
}: CompletionCertificateProps) {

  const downloadCertificate = () => {
    // Create a simple text certificate for download
    const certificateText = `
ZERTIFIKAT
Prompt-Engineering Fähigkeiten für den öffentlichen Sektor

Hiermit wird bestätigt, dass

${userName}

erfolgreich das Training "KI-Prompt-Engineering für Behörden" absolviert hat.

Leistungsnachweis:
- Abgeschlossene Szenarien: ${scenariosCompleted}/5
- Durchschnittliche Bewertung: ${totalScore}%
- Erreichte Kompetenzstufe: ${skillLevel}
- Fachbereich: ${department}

Abgeschlossen am: ${completionDate.toLocaleDateString('de-DE')}

Dieses Zertifikat bescheinigt Kompetenzen in:
✓ Behördlicher Kommunikation mit KI
✓ Rechtssichere Prompt-Erstellung
✓ Barrierefreie und inklusive KI-Anwendung
✓ Datenschutzkonforme KI-Nutzung

Ausgestellt durch: Prompt-Skills Trainingssystem
Datum: ${new Date().toLocaleDateString('de-DE')}
    `.trim();

    const blob = new Blob([certificateText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zertifikat-prompt-skills-${userName.replace(/\s+/g, '-')}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSkillColor = () => {
    switch (skillLevel) {
      case "Experte": return "text-success";
      case "Kompetent": return "text-warning";
      default: return "text-primary";
    }
  };

  const getScoreColor = () => {
    if (totalScore >= 80) return "text-success";
    if (totalScore >= 65) return "text-warning";
    return "text-primary";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full bg-gradient-card border-0 shadow-glow relative overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ef4444%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative p-12 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
              <Award className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              ZERTIFIKAT
            </h1>
            <p className="text-lg text-muted-foreground">
              Prompt-Engineering Fähigkeiten für den öffentlichen Sektor
            </p>
          </div>

          {/* Achievement Statement */}
          <div className="mb-8">
            <p className="text-lg mb-4">Hiermit wird bestätigt, dass</p>
            <h2 className="text-3xl font-bold text-primary mb-4">{userName}</h2>
            <p className="text-lg">
              erfolgreich das Training <strong>"KI-Prompt-Engineering für Behörden"</strong> absolviert hat.
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Durchschnittsbewertung</div>
                  <div className={`text-2xl font-bold ${getScoreColor()}`}>{totalScore}%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Kompetenzstufe</div>
                  <div className={`text-xl font-semibold ${getSkillColor()}`}>{skillLevel}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Abgeschlossene Szenarien</div>
                  <div className="text-2xl font-bold text-primary">{scenariosCompleted}/5</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Abgeschlossen am</div>
                  <div className="text-lg font-semibold">{completionDate.toLocaleDateString('de-DE')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Competencies */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Nachgewiesene Kompetenzen</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Behördliche Kommunikation mit KI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Rechtssichere Prompt-Erstellung</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Barrierefreie und inklusive KI-Anwendung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm">Datenschutzkonforme KI-Nutzung</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Ausgestellt durch: Prompt-Skills Trainingssystem<br />
              Datum: {new Date().toLocaleDateString('de-DE')}
            </p>
            
            <Button onClick={downloadCertificate} className="bg-gradient-primary shadow-button">
              <Download className="h-4 w-4 mr-2" />
              Zertifikat herunterladen
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}