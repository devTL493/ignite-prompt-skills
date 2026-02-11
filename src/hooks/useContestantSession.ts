import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Contestant } from "@/types";

const STORAGE_KEY = "promptcup_contestant";

interface StoredSession {
  contestantId: string;
  accessCode: string;
  competitionId: string;
}

export function useContestantSession(competitionId: string) {
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, [competitionId]);

  const restoreSession = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) { setLoading(false); return; }

      const session: StoredSession = JSON.parse(stored);
      if (session.competitionId !== competitionId) { setLoading(false); return; }

      const { data } = await supabase
        .from("contestants")
        .select("*")
        .eq("id", session.contestantId)
        .eq("access_code", session.accessCode)
        .single();

      if (data) setContestant(data as Contestant);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (fullName: string, email?: string) => {
    const { data, error } = await supabase
      .from("contestants")
      .insert({
        competition_id: competitionId,
        full_name: fullName,
        email: email || null,
      })
      .select()
      .single();

    if (error) throw error;

    const c = data as Contestant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      contestantId: c.id,
      accessCode: c.access_code,
      competitionId,
    }));
    setContestant(c);
    return c;
  };

  const resumeWithCode = async (accessCode: string) => {
    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("competition_id", competitionId)
      .eq("access_code", accessCode)
      .single();

    if (error || !data) throw new Error("Ungültiger Zugangscode");

    const c = data as Contestant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      contestantId: c.id,
      accessCode: c.access_code,
      competitionId,
    }));
    setContestant(c);
    return c;
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContestant(null);
  };

  return { contestant, loading, signUp, resumeWithCode, clearSession };
}
