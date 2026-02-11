import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Competition } from "@/types";
import { Plus, LogOut, Trophy, BookOpen, Calendar, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    const { data } = await supabase
      .from("competitions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCompetitions(data as Competition[]);
  };

  const createCompetition = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("competitions").insert({
      name,
      description,
      location,
      event_date: eventDate || null,
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Wettbewerb erstellt" });
      setShowCreate(false);
      setName(""); setDescription(""); setLocation(""); setEventDate("");
      fetchCompetitions();
    }
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-success text-white";
    if (s === "completed") return "bg-muted text-muted-foreground";
    return "bg-warning text-white";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/admin/scenarios"><BookOpen className="h-4 w-4 mr-2" />Szenario-Bibliothek</Link>
            </Button>
            <Button variant="ghost" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" />Abmelden
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Wettbewerbe</h2>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="h-4 w-4 mr-2" />Neuer Wettbewerb</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neuen Wettbewerb erstellen</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="PromptCUP 2026" />
                </div>
                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Ort</label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Berlin" />
                </div>
                <div>
                  <label className="text-sm font-medium">Datum</label>
                  <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </div>
                <Button onClick={createCompetition} className="w-full bg-gradient-primary">Erstellen</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map(c => (
            <Link key={c.id} to={`/admin/competitions/${c.id}`}>
              <Card className="p-6 bg-gradient-card border-0 shadow-card hover:shadow-glow transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <Badge className={statusColor(c.status)}>{c.status}</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{c.name}</h3>
                {c.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                  {c.event_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.event_date).toLocaleDateString("de-DE")}</span>}
                </div>
              </Card>
            </Link>
          ))}
          {competitions.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">Noch keine Wettbewerbe erstellt.</p>
          )}
        </div>
      </div>
    </div>
  );
}
