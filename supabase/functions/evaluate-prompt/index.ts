import "https://deno.land/std@0.168.0/dotenv/load.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluationRequest {
  prompt: string;
  scenarioTitle: string;
  scenarioContext: string;
  scenarioGoal: string;
  idealPrompt: string;
  evaluationCriteria: string[];
  keyPhrases: string[];
  commonMistakes: string[];
}

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

    const body: EvaluationRequest = await req.json();
    const { prompt, scenarioTitle, scenarioContext, scenarioGoal, idealPrompt, evaluationCriteria, keyPhrases, commonMistakes } = body;

    if (!prompt || prompt.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Prompt muss mindestens 20 Zeichen lang sein.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Du bist ein Experte für Behördenkommunikation und KI-Prompting im deutschen öffentlichen Dienst. 
Du bewertest Prompts, die Behördenmitarbeiter schreiben, um KI-Systeme effektiv zu nutzen.

SZENARIO: "${scenarioTitle}"
KONTEXT: ${scenarioContext}
ZIEL: ${scenarioGoal}

IDEALER PROMPT (Golden Shot):
${idealPrompt}

BEWERTUNGSKRITERIEN:
${evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

WICHTIGE SCHLÜSSELBEGRIFFE: ${keyPhrases.join(', ')}

HÄUFIGE FEHLER: ${commonMistakes.join(', ')}

Bewerte den folgenden Prompt des Nutzers auf einer Skala von 0-100. Antworte NUR mit validem JSON in diesem Format:
{
  "score": <number 0-100>,
  "feedback": "<2-3 Sätze Gesamtbewertung auf Deutsch>",
  "suggestions": ["<Verbesserungsvorschlag 1>", "<Verbesserungsvorschlag 2>", "<Verbesserungsvorschlag 3>"],
  "strengths": ["<Stärke 1>", "<Stärke 2>"],
  "criticalIssues": ["<Kritisches Problem 1>"] 
}

Sei streng aber fair. Ein Score von 80+ bedeutet exzellent. Vergleiche immer mit dem idealen Prompt.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nNUTZER-PROMPT:\n${prompt}` }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'KI-Bewertung fehlgeschlagen. Bitte versuchen Sie es erneut.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return new Response(
        JSON.stringify({ error: 'Keine Antwort vom KI-Modell erhalten.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try {
      // Clean potential issues: remove control characters, fix truncated JSON
      const cleanedText = textContent
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control chars
        .trim();
      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error, raw text:', textContent.substring(0, 500));
      // Try to extract score and feedback with regex as fallback
      const scoreMatch = textContent.match(/"score"\s*:\s*(\d+)/);
      const feedbackMatch = textContent.match(/"feedback"\s*:\s*"([^"]+)"/);
      result = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        feedback: feedbackMatch ? feedbackMatch[1] : 'Bewertung konnte nicht vollständig verarbeitet werden.',
        suggestions: [],
        strengths: [],
        criticalIssues: [],
      };
    }

    // Validate and clamp score
    result.score = Math.max(0, Math.min(100, Math.round(result.score || 0)));
    result.feedback = result.feedback || 'Keine Bewertung verfügbar.';
    result.suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
    result.strengths = Array.isArray(result.strengths) ? result.strengths : [];
    result.criticalIssues = Array.isArray(result.criticalIssues) ? result.criticalIssues : [];

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler bei der Bewertung.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
