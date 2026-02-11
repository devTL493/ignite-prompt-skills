

# Real AI-Powered Prompt Evaluation via External Supabase

## Overview

Replace the simulated scoring in `AIScoring.tsx` with a real AI evaluation, using an **external Supabase project** (connected separately, not Lovable Cloud) to host an Edge Function that securely proxies calls to your chosen AI provider.

## Steps

### 1. Connect External Supabase Project

You'll connect your own Supabase project to this Lovable app via the project settings. This gives us:
- Edge Functions for secure API proxying
- Secrets management for your AI API key
- No dependency on Lovable Cloud

### 2. Store Your AI API Key as a Supabase Secret

Once connected, we'll store your AI provider's API key (e.g., OpenAI, Gemini, or Claude) as a secret in your Supabase project so it's never exposed in frontend code.

### 3. Create Edge Function: `supabase/functions/evaluate-prompt/index.ts`

This function will:
- Receive the user's prompt, scenario context, ideal prompt, and evaluation criteria from the frontend
- Build a German-language system prompt instructing the AI to act as a government communication expert evaluator
- Call your chosen AI provider's API using the stored secret
- Return structured JSON: `{ score, feedback, suggestions[], strengths[], criticalIssues[] }`
- Handle errors (rate limits, auth failures) gracefully

### 4. Update `supabase/config.toml`

Register the new function with `verify_jwt = false` (public training tool, no user auth required).

### 5. Update `AIScoring.tsx`

- Replace `simulateAIScoring` with a `fetch` call to the Edge Function endpoint
- Remove `PromptComparator` dependency for scoring
- Add error handling with toast notifications for failures (network errors, rate limits)
- Keep all existing UI rendering unchanged (score, badges, feedback, suggestions)

## What Changes

| File | Action |
|------|--------|
| `supabase/functions/evaluate-prompt/index.ts` | New -- Edge Function with AI evaluation |
| `supabase/config.toml` | New/Updated -- Function registration |
| `src/components/AIScoring.tsx` | Modified -- Real API call instead of simulation |

## What Stays the Same

- All UI components (score display, badges, progress bar, suggestions list)
- The `onScoreReceived` callback interface
- The refinement flow and `hasRefinementLeft` logic
- All other components and pages

## Before Implementation

You'll need to:
1. Have a Supabase project ready (or create one at supabase.com)
2. Connect it to this Lovable project via Settings
3. Decide which AI provider you want to use (OpenAI, Google Gemini, or Anthropic Claude)
4. Have your API key ready to store as a secret

