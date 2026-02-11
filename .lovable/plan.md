

# Competition File Repository, Kategorie Dropdown, and Direct Gemini API

## Overview

1. Switch `generate-ideal-prompt` from Lovable AI Gateway to direct Gemini API (using `GEMINI_API_KEY`)
2. Add a `competition_files` table and Supabase Storage bucket for uploading PDFs/images to competitions
3. Admin UI for managing competition files
4. Contestant "Hilfsmaterialien" button to view/download files during prompting
5. Kategorie dropdown with fixed values: Recherche, Vorbereitung, Analyse, Entscheidung
6. Enhanced `evaluate-prompt` that considers Kontext, Ziel, Abteilung, Kategorie, Idealer Prompt, and file metadata

---

## Database Migration

### Storage Bucket

Create a public `competition-files` bucket for storing uploaded documents.

### New Table: `competition_files`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| competition_id | uuid | NOT NULL, FK to competitions |
| file_name | text | NOT NULL, original filename |
| file_path | text | NOT NULL, storage path |
| file_type | text | MIME type |
| file_size | integer | bytes |
| uploaded_at | timestamptz | default now() |
| uploaded_by | uuid | nullable |

### RLS Policies
- SELECT: anyone (contestants need file access)
- INSERT/UPDATE/DELETE: admins only

### Storage RLS
- SELECT on objects in `competition-files`: public
- INSERT/DELETE: authenticated users (admins)

---

## Change 1: Rewrite `generate-ideal-prompt` to Direct Gemini API

**File**: `supabase/functions/generate-ideal-prompt/index.ts`

- Replace `LOVABLE_API_KEY` with `GEMINI_API_KEY`
- Replace Lovable AI Gateway URL with direct Gemini API: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`
- Convert from OpenAI chat format to Gemini native format (contents array with role/parts)
- Keep the same system prompt and department guidance logic

---

## Change 2: Kategorie Dropdown in AdminScenarios

**File**: `src/pages/AdminScenarios.tsx` (line 217-218)

Replace the free-text `<Input>` for "Kategorie" with a `<Select>` dropdown:

| Value | Label |
|---|---|
| Recherche | Recherche |
| Vorbereitung | Vorbereitung |
| Analyse | Analyse |
| Entscheidung | Entscheidung |

---

## Change 3: File Upload UI in AdminCompetitionDetail

**File**: `src/pages/AdminCompetitionDetail.tsx`

Add a new "Dateien" card section:
- File input accepting PDF, JPG, PNG, DOCX
- Upload handler: uploads to `competition-files/{competition_id}/{filename}` in storage, then inserts metadata into `competition_files` table
- List of uploaded files with name, type, size, and a delete button
- Fetch files from `competition_files` table on load
- Add `CompetitionFile` interface to types

---

## Change 4: Contestant Help Button

**File**: `src/pages/CompeteInterface.tsx`

Add a "Hilfsmaterialien" button in the scenario area:
- Fetches files from `competition_files` where `competition_id` matches
- Opens a dialog listing all files with download links (public Supabase Storage URLs)
- Uses a FileText icon and clearly labeled button

---

## Change 5: Enhanced `evaluate-prompt`

**File**: `supabase/functions/evaluate-prompt/index.ts`

Add to the request interface:
- `category?: string`
- `competitionFiles?: { file_name: string; file_type: string }[]`

Update the system prompt to include:
- `KATEGORIE: ${category}` with category-specific scoring guidance:
  - Recherche: source depth, systematic information gathering
  - Vorbereitung: structured planning, completeness, prioritization
  - Analyse: analytical depth, data interpretation, conclusions
  - Entscheidung: decision logic, weighing alternatives, risk assessment
- `VERFUGBARE HILFSMATERIALIEN: ${fileNames}` so the LLM knows what reference materials were available and can assess whether the prompt appropriately leverages them

---

## Change 6: Pass New Fields from Frontend

**Files**: `src/pages/CompeteInterface.tsx`, `src/components/AIScoring.tsx`

- Pass `department`, `category`, and `competitionFiles` metadata to `evaluate-prompt`
- Fetch competition files once when CompeteInterface loads and include their metadata in the evaluation call

---

## Change 7: Update Types

**File**: `src/types/index.ts`

Add `CompetitionFile` interface:
```text
CompetitionFile {
  id: string
  competition_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  uploaded_at: string
  uploaded_by: string | null
}
```

---

## Implementation Sequence

1. Database migration (storage bucket + competition_files table + RLS)
2. Rewrite `generate-ideal-prompt` to use GEMINI_API_KEY directly
3. Update `evaluate-prompt` with category + file awareness
4. Update types
5. Update `AdminScenarios.tsx` with Kategorie dropdown
6. Update `AdminCompetitionDetail.tsx` with file upload UI
7. Update `CompeteInterface.tsx` with help button + enhanced scoring call
8. Update `AIScoring.tsx` to pass category
9. Deploy edge functions

