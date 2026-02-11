import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DBScenario } from "@/types";
import { ArrowLeft, Plus, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  title: "",
  description: "",
  context: "",
  goal: "",
  difficulty: "Anfänger" as string,
  category: "",
  department: "",
  ideal_prompt: "",
  hints: "" as string, // comma-separated for editing
  criteria: "",
  sampleGoodPrompt: "",
  commonMistakes: "",
  keyPhrases: "",
};

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState<DBScenario[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const { user } = useAuth();

  useEffect(() => { fetchScenarios(); }, []);

  const fetchScenarios = async () => {
    const { data } = await supabase.from("scenarios").select("*").order("created_at", { ascending: false });
    if (data) setScenarios(data as DBScenario[]);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (s: DBScenario) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      context: s.context,
      goal: s.goal,
      difficulty: s.difficulty,
      category: s.category,
      department: s.department,
      ideal_prompt: s.ideal_prompt,
      hints: (s.hints || []).join("\n"),
      criteria: (s.evaluation?.criteria || []).join("\n"),
      sampleGoodPrompt: s.evaluation?.sampleGoodPrompt || "",
      commonMistakes: (s.evaluation?.commonMistakes || []).join("\n"),
      keyPhrases: (s.evaluation?.keyPhrases || []).join(", "),
    });
    setShowDialog(true);
  };

  const save = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      context: form.context,
      goal: form.goal,
      difficulty: form.difficulty,
      category: form.category,
      department: form.department,
      ideal_prompt: form.ideal_prompt,
      hints: form.hints.split("\n").map(h => h.trim()).filter(Boolean),
      evaluation: {
        criteria: form.criteria.split("\n").map(c => c.trim()).filter(Boolean),
        sampleGoodPrompt: form.sampleGoodPrompt,
        commonMistakes: form.commonMistakes.split("\n").map(m => m.trim()).filter(Boolean),
        keyPhrases: form.keyPhrases.split(",").map(k => k.trim()).filter(Boolean),
      },
      created_by: user?.id,
    };

    const { error } = editingId
      ? await supabase.from("scenarios").update(payload).eq("id", editingId)
      : await supabase.from("scenarios").insert(payload);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Aktualisiert" : "Erstellt" });
      setShowDialog(false);
      fetchScenarios();
    }
  };

  const deleteScenario = async (id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    await supabase.from("scenarios").delete().eq("id", id);
    fetchScenarios();
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const generateIdealPrompt = async () => {
    if (!form.context || !form.goal) {
      toast({ title: "Fehler", description: "Kontext und Ziel sind erforderlich.", variant: "destructive" });
      return;
    }
    setIsGeneratingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ideal-prompt', {
        body: {
          context: form.context,
          goal: form.goal,
          department: form.department,
          title: form.title,
          description: form.description,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setForm(prev => ({ ...prev, ideal_prompt: data.idealPrompt }));
      toast({ title: "Idealer Prompt generiert" });
    } catch (err: any) {
      toast({ title: "Generierung fehlgeschlagen", description: err.message || "Bitte versuchen Sie es erneut.", variant: "destructive" });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-2" />Zurück</Link></Button>
            <h1 className="text-3xl font-bold">Szenario-Bibliothek</h1>
          </div>
          <Button onClick={openCreate} className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Neues Szenario</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map(s => (
            <Card key={s.id} className="p-6 bg-gradient-card border-0 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">{s.difficulty}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteScenario(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{s.description}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                <Badge variant="secondary" className="text-xs">{s.department}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "Szenario bearbeiten" : "Neues Szenario"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel *</label>
                <Input value={form.title} onChange={f("title")} />
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung</label>
                <Textarea value={form.description} onChange={f("description")} />
              </div>
              <div>
                <label className="text-sm font-medium">Kontext</label>
                <Textarea value={form.context} onChange={f("context")} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Ziel</label>
                <Textarea value={form.goal} onChange={f("goal")} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Schwierigkeit</label>
                  <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anfänger">Anfänger</SelectItem>
                      <SelectItem value="Mittelstufe">Mittelstufe</SelectItem>
                      <SelectItem value="Fortgeschritten">Fortgeschritten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Kategorie</label>
                  <Input value={form.category} onChange={f("category")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Abteilung</label>
                  <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Abteilung wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Führungsaufgabe">Führungsaufgabe</SelectItem>
                      <SelectItem value="Fachlich - Leistung">Fachlich - Leistung</SelectItem>
                      <SelectItem value="Fachlich - MuI">Fachlich - MuI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Idealer Prompt</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateIdealPrompt}
                    disabled={isGeneratingPrompt || !form.context || !form.goal}
                  >
                    {isGeneratingPrompt ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generiert...</>
                    ) : (
                      <><Sparkles className="h-3 w-3 mr-1" />KI generieren</>
                    )}
                  </Button>
                </div>
                <Textarea value={form.ideal_prompt} onChange={f("ideal_prompt")} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Hinweise (ein pro Zeile)</label>
                <Textarea value={form.hints} onChange={f("hints")} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Bewertungskriterien (ein pro Zeile)</label>
                <Textarea value={form.criteria} onChange={f("criteria")} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Beispiel guter Prompt</label>
                <Textarea value={form.sampleGoodPrompt} onChange={f("sampleGoodPrompt")} />
              </div>
              <div>
                <label className="text-sm font-medium">Häufige Fehler (ein pro Zeile)</label>
                <Textarea value={form.commonMistakes} onChange={f("commonMistakes")} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Schlüsselbegriffe (kommagetrennt)</label>
                <Input value={form.keyPhrases} onChange={f("keyPhrases")} />
              </div>
              <Button onClick={save} className="w-full bg-gradient-primary">
                {editingId ? "Aktualisieren" : "Erstellen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
