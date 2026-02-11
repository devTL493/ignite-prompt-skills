
# LLM-Powered Ideal Prompt Generation with Gemini 3.0 Flash Preview

## Overview

This plan implements:
1. **Department Dropdown**: Replace free-text "Abteilung" with a fixed dropdown (Führungsaufgabe, Fachlich - Leistung, Fachlich - MuI)
2. **Ideal Prompt Generation**: Create a new edge function to auto-generate ideal prompts using Gemini 3.0 Flash Preview
3. **Enhanced Scoring**: Update the evaluate-prompt function to accept and use the department category for context-aware scoring
4. **Model Update**: Switch both edge functions to use `google/gemini-3-flash-preview` for better performance and cost efficiency

---

## Change 1: Update `evaluate-prompt` Edge Function

**File**: `supabase/functions/evaluate-prompt/index.ts`

**Changes**:
- Add `department` to the `EvaluationRequest` interface
- Update the Gemini API URL to use `gemini-3-flash-preview` instead of `gemini-2.0-flash`
- Include the department in the system prompt so scoring is context-aware:
  - For Führungsaufgabe: emphasize leadership tone, delegation, team communication
  - For Fachlich - Leistung: emphasize technical accuracy, performance metrics, optimization
  - For Fachlich - MuI: emphasize sustainability, change management, integration aspects
- The department will inform how strictly certain criteria are weighted

**Key Addition to System Prompt**:
```
ABTEILUNG/KONTEXT: ${department}
```
This helps the AI understand whether it's evaluating a leadership scenario, technical performance scenario, or technical change management scenario.

---

## Change 2: Create `generate-ideal-prompt` Edge Function

**File**: `supabase/functions/generate-ideal-prompt/index.ts` (NEW)

**Function**:
- Accepts: `{ context, goal, department, title, description }`
- Uses `google/gemini-3-flash-preview` to generate an ideal prompt
- Returns: `{ idealPrompt: string }`
- CORS-enabled for web requests
- Sets `verify_jwt = false` in config.toml

**System Prompt** will instruct the model to:
- Write a clear, specific, professional prompt that achieves the stated goal within the given context
- Tailor the style based on the department (leadership-focused, technically-detailed, or change-management-focused)
- Include concrete keywords and structural guidance if applicable
- Be concise but comprehensive (300-500 words typical)

**Error Handling**:
- Validate context and goal are not empty
- Return user-friendly error messages in German
- Handle API timeouts and rate limits gracefully

---

## Change 3: Update `src/pages/AdminScenarios.tsx`

**Changes**:
1. **Department Dropdown** (line 192-195):
   - Replace `<Input value={form.department} onChange={f("department")} />` with a `<Select>` dropdown
   - Options: "Führungsaufgabe", "Fachlich - Leistung", "Fachlich - MuI"

2. **Generate Button** (before the "Idealer Prompt" textarea):
   - Add a button next to the "Idealer Prompt" label with a sparkle/magic icon
   - On click: calls `generate-ideal-prompt` edge function with current form values
   - Shows loading spinner while generating
   - Disabled if context or goal are empty
   - On success: populates the `ideal_prompt` textarea
   - On error: shows a toast notification

3. **State Management**:
   - Add `isGeneratingPrompt: boolean` state to track loading state
   - Add handler function `generateIdealPrompt()` that calls the edge function

---

## Change 4: Update `src/components/AIScoring.tsx`

**Changes**:
- Add `department: string` to the function invocation body (line 28-38)
- Pass `scenario.department` when calling evaluate-prompt
- This ensures the LLM scores with full context of the department category

---

## Change 5: Update `supabase/config.toml`

**Changes**:
- Update the Gemini model reference in evaluate-prompt to use `gemini-3-flash-preview` (if exposed in environment)
- Add a new function entry:
  ```toml
  [functions.generate-ideal-prompt]
  verify_jwt = false
  ```

---

## Technical Details

### API Models
Both edge functions will use `google/gemini-3-flash-preview` which offers:
- Faster response times than Gemini 2.0 Flash
- Better structured output (JSON responses)
- Lower latency suitable for interactive UI workflows
- More efficient token usage for cost

### Department-Aware Scoring
The evaluate-prompt system prompt will now include:
```
ABTEILUNG: ${department}
```
And add department-specific guidance:
- **Führungsaufgabe**: "Bewerte besonders: Klarheit für Teamkommunikation, Delegationsfähigkeit, strategische Ausrichtung"
- **Fachlich - Leistung**: "Bewerte besonders: Technische Genauigkeit, Messbare KPIs, Optimierungspotentiale"
- **Fachlich - MuI**: "Bewerte besonders: Change Management Aspekte, Integrationsfähigkeit, Nachhaltigkeitsgedanken"

### Frontend Error Handling
- Toast notifications for generation failures
- User-friendly German error messages
- Graceful fallback if API is unavailable

### Files to Create
- `supabase/functions/generate-ideal-prompt/index.ts`

### Files to Modify
- `supabase/functions/evaluate-prompt/index.ts` (add department, update model, enhance system prompt)
- `src/pages/AdminScenarios.tsx` (department dropdown + generate button)
- `src/components/AIScoring.tsx` (pass department to edge function)
- `supabase/config.toml` (register new function)

---

## Implementation Sequence

1. Update `supabase/config.toml` to register the new function
2. Create `supabase/functions/generate-ideal-prompt/index.ts`
3. Update `supabase/functions/evaluate-prompt/index.ts` to accept department and use new model
4. Update `src/pages/AdminScenarios.tsx` with dropdown and generate button
5. Update `src/components/AIScoring.tsx` to pass department
6. Deploy edge functions
7. Test the workflow end-to-end

