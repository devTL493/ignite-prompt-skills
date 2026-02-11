import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Competition, DBScenario, Contestant, Submission, CompetitionFile } from "@/types";
import { ArrowLeft, Plus, Trash2, Users, FileText, ExternalLink, Upload, Loader2, File } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [assignedScenarios, setAssignedScenarios] = useState<(DBScenario & { sort_order: number })[]>([]);
  const [allScenarios, setAllScenarios] = useState<DBScenario[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [competitionFiles, setCompetitionFiles] = useState<CompetitionFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      fetchAll();
      fetchFiles();
    }
  }, [id]);

  const fetchAll = async () => {
    const [compRes, scenRes, allScenRes, contRes, subRes] = await Promise.all([
      supabase.from("competitions").select("*").eq("id", id!).single(),
      supabase.from("competition_scenarios").select("scenario_id, sort_order").eq("competition_id", id!).order("sort_order"),
      supabase.from("scenarios").select("*").order("title"),
      supabase.from("contestants").select("*").eq("competition_id", id!).order("created_at"),
      supabase.from("submissions").select("*").eq("competition_id", id!).order("submitted_at", { ascending: false }),
    ]);

    if (compRes.data) setCompetition(compRes.data as Competition);
    if (allScenRes.data) setAllScenarios(allScenRes.data as DBScenario[]);
    if (contRes.data) setContestants(contRes.data as Contestant[]);
    if (subRes.data) setSubmissions(subRes.data as Submission[]);

    if (scenRes.data && allScenRes.data) {
      const scenarioMap = new Map((allScenRes.data as DBScenario[]).map(s => [s.id, s]));
      const assigned = scenRes.data
        .map((cs: any) => {
          const scenario = scenarioMap.get(cs.scenario_id);
          return scenario ? { ...scenario, sort_order: cs.sort_order } : null;
        })
        .filter(Boolean) as (DBScenario & { sort_order: number })[];
      setAssignedScenarios(assigned);
    }
  };

  const fetchFiles = async () => {
    const { data } = await supabase
      .from("competition_files")
      .select("*")
      .eq("competition_id", id!)
      .order("uploaded_at", { ascending: false });
    if (data) setCompetitionFiles(data as unknown as CompetitionFile[]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const filePath = `${id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("competition-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("competition_files").insert({
          competition_id: id!,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        } as any);

        if (dbError) throw dbError;
      }
      toast({ title: "Dateien hochgeladen" });
      fetchFiles();
    } catch (err: any) {
      toast({ title: "Upload fehlgeschlagen", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteFile = async (file: CompetitionFile) => {
    if (!confirm(`"${file.file_name}" wirklich löschen?`)) return;
    await supabase.storage.from("competition-files").remove([file.file_path]);
    await supabase.from("competition_files").delete().eq("id", file.id);
    fetchFiles();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addScenario = async () => {
    if (!selectedScenario) return;
    const { error } = await supabase.from("competition_scenarios").insert({
      competition_id: id!,
      scenario_id: selectedScenario,
      sort_order: assignedScenarios.length,
    });
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      setSelectedScenario("");
      fetchAll();
    }
  };

  const removeScenario = async (scenarioId: string) => {
    await supabase.from("competition_scenarios")
      .delete()
      .eq("competition_id", id!)
      .eq("scenario_id", scenarioId);
    fetchAll();
  };

  const updateStatus = async (status: string) => {
    await supabase.from("competitions").update({ status }).eq("id", id!);
    fetchAll();
  };

  const exportCSV = () => {
    const contestantMap = new Map(contestants.map(c => [c.id, c]));
    const scenarioMap = new Map(assignedScenarios.map(s => [s.id, s]));
    const rows = [
      ["Teilnehmer", "E-Mail", "Szenario", "Score", "Eingereicht am"].join(","),
      ...submissions.map(s => [
        contestantMap.get(s.contestant_id)?.full_name || "Unbekannt",
        contestantMap.get(s.contestant_id)?.email || "",
        scenarioMap.get(s.scenario_id)?.title || s.scenario_id,
        s.final_score,
        new Date(s.submitted_at).toLocaleString("de-DE"),
      ].join(","))
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${competition?.name || "export"}-ergebnisse.csv`;
    a.click();
  };

  if (!competition) return null;

  const availableScenarios = allScenarios.filter(s => !assignedScenarios.find(a => a.id === s.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" asChild><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-2" />Zurück</Link></Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{competition.name}</h1>
            {competition.description && <p className="text-muted-foreground mt-1">{competition.description}</p>}
          </div>
          <Select value={competition.status} onValueChange={updateStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Entwurf</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 mb-8">
          <Button variant="outline" asChild>
            <Link to={`/join/${id}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" />Anmeldeseite</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/leaderboard/${id}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" />Leaderboard</Link>
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <FileText className="h-4 w-4 mr-2" />CSV Export
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scenarios */}
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <h2 className="text-xl font-semibold mb-4">Szenarien ({assignedScenarios.length})</h2>
            <div className="flex gap-2 mb-4">
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Szenario hinzufügen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableScenarios.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addScenario} disabled={!selectedScenario} size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              {assignedScenarios.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-accent-soft rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <Badge variant="outline" className="text-xs">{s.difficulty}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeScenario(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Contestants */}
          <Card className="p-6 bg-gradient-card border-0 shadow-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" /> Teilnehmer ({contestants.length})
            </h2>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Ø Score</TableHead>
                    <TableHead>Eingaben</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contestants.map(c => {
                    const subs = submissions.filter(s => s.contestant_id === c.id);
                    const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.final_score, 0) / subs.length) : 0;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.full_name}</TableCell>
                        <TableCell>{avg}%</TableCell>
                        <TableCell>{subs.length}/{assignedScenarios.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Files */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <File className="h-5 w-5" /> Hilfsmaterialien ({competitionFiles.length})
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Hochladen...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Dateien hochladen</>
              )}
            </Button>
          </div>
          {competitionFiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dateiname</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitionFiles.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.file_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.file_type || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatFileSize(f.file_size)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteFile(f)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Dateien hochgeladen.</p>
          )}
        </Card>

        {/* Submissions */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card mt-8">
          <h2 className="text-xl font-semibold mb-4">Alle Eingaben ({submissions.length})</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teilnehmer</TableHead>
                  <TableHead>Szenario</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Eingereicht</TableHead>
                  <TableHead>Prompt (Vorschau)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{contestants.find(c => c.id === s.contestant_id)?.full_name || "?"}</TableCell>
                    <TableCell>{assignedScenarios.find(sc => sc.id === s.scenario_id)?.title || "?"}</TableCell>
                    <TableCell><Badge className={s.final_score >= 80 ? "bg-success text-white" : s.final_score >= 60 ? "bg-warning text-white" : "bg-destructive text-white"}>{s.final_score}%</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(s.submitted_at).toLocaleString("de-DE")}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{s.user_prompt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
