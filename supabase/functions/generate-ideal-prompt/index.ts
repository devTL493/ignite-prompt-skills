import "https://deno.land/std@0.168.0/dotenv/load.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateRequest {
  context: string;
  goal: string;
  department: string;
  title: string;
  description: string;
}

const departmentGuidance: Record<string, string> = {
  "Führungsaufgabe": "Der Prompt soll auf Führungskommunikation, Delegation, Teamsteuerung und strategische Ausrichtung ausgelegt sein. Verwende klare Anweisungen, die ein Führungsstil widerspiegeln.",
  "Fachlich - Leistung": "Der Prompt soll technisch präzise sein, messbare KPIs und Leistungskennzahlen berücksichtigen und auf Optimierung und Effizienz abzielen.",
  "Fachlich - MuI": "Der Prompt soll Change-Management-Aspekte, Integrationsfähigkeit, Nachhaltigkeit und Modernisierungsgedanken berücksichtigen.",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GenerateRequest = await req.json();
    const { context, goal, department, title, description } = body;

    if (!context || !goal) {
      return new Response(
        JSON.stringify({ error: 'Kontext und Ziel sind erforderlich.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deptGuide = departmentGuidance[department] || "";

    const systemPrompt = `Du bist ein Experte für Behördenkommunikation und KI-Prompting im deutschen öffentlichen Dienst.
Deine Aufgabe ist es, den perfekten, idealen Prompt zu formulieren, den ein Behördenmitarbeiter an eine KI schreiben sollte, um das gegebene Ziel im gegebenen Kontext optimal zu erreichen.

SZENARIO-TITEL: ${title}
BESCHREIBUNG: ${description}
KONTEXT: ${context}
ZIEL: ${goal}
ABTEILUNG: ${department}

${deptGuide}

Schreibe den idealen Prompt direkt – ohne Erklärungen, ohne Einleitung, ohne Metakommentare. 
Der Prompt soll:
- Klar, spezifisch und professionell formuliert sein
- Alle relevanten Kontextinformationen enthalten
- Das Ziel präzise adressieren
- Strukturiert und gut gegliedert sein
- Konkrete Schlüsselbegriffe und fachliche Terminologie verwenden
- Zwischen 200-500 Wörtern lang sein

Antworte NUR mit dem idealen Prompt-Text, nichts anderes.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nErstelle den idealen Prompt für das Szenario "${title}".` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Prompt-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const idealPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!idealPrompt) {
      return new Response(
        JSON.stringify({ error: 'Keine Antwort vom KI-Modell erhalten.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ idealPrompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler bei der Prompt-Generierung.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
