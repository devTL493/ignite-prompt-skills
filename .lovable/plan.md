

# PromptCUP Competition Platform

## Overview

Transform the current single-user prompt training tool into a multi-event competition platform where admins create events with scenarios, contestants sign up with just a name (and optional email), and all submissions are scored and stored in a database leaderboard.

## Database Schema

The following tables will be created in Supabase:

```text
+------------------+       +------------------+       +-------------------+
| competitions     |       | competition_     |       | scenarios         |
|------------------|       | scenarios        |       |-------------------|
| id (uuid, PK)   |<------| (junction)       |------>| id (uuid, PK)     |
| name             |       | competition_id   |       | title             |
| description      |       | scenario_id      |       | description       |
| location         |       | sort_order       |       | context           |
| event_date       |       +------------------+       | goal              |
| status           |                                  | difficulty        |
| created_by (uuid)|       +------------------+       | category          |
| created_at       |       | contestants      |       | department        |
+------------------+       |------------------|       | ideal_prompt      |
                           | id (uuid, PK)    |       | hints (jsonb)     |
                           | competition_id   |       | evaluation (jsonb)|
                           | full_name        |       | created_by (uuid) |
                           | email (nullable) |       | created_at        |
                           | access_code      |       +-------------------+
                           | created_at       |
                           +------------------+
                                    |
                           +------------------+
                           | submissions      |
                           |------------------|
                           | id (uuid, PK)    |
                           | contestant_id    |
                           | scenario_id      |
                           | competition_id   |
                           | user_prompt      |
                           | refined_prompt   |
                           | initial_score    |
                           | final_score      |
                           | ai_feedback      |
                           | ai_suggestions   |
                           | submitted_at     |
                           +------------------+
```

### Key design decisions:
- **No Supabase Auth for contestants** -- they sign up per event with just a name and optional email. An auto-generated `access_code` lets them resume their session.
- **Supabase Auth for admins only** -- admins log in with email/password to manage competitions and scenarios.
- **Scenarios are reusable** -- a junction table links scenarios to competitions, so the same scenario can appear in multiple events.
- **Admin role** stored in a `user_roles` table (per security best practices).

## Pages and Routes

| Route | Purpose |
|---|---|
| `/` | Landing page -- choose "Join Competition" or "Admin Login" |
| `/join/:competitionId` | Contestant sign-up (name + optional email) |
| `/compete/:competitionId` | Quiz interface for contestants (existing QuizInterface, adapted) |
| `/leaderboard/:competitionId` | Public leaderboard for a competition |
| `/admin/login` | Admin email/password login |
| `/admin` | Admin dashboard -- list competitions |
| `/admin/competitions/:id` | Manage a competition (scenarios, contestants, results) |
| `/admin/scenarios` | Scenario library (CRUD) |

## Implementation Steps

### Step 1: Database migration
- Create all tables: `competitions`, `scenarios`, `competition_scenarios`, `contestants`, `submissions`, `user_roles`
- Enable RLS on all tables
- Create a `has_role` security definer function
- RLS policies:
  - `scenarios`, `competitions`, `competition_scenarios`: public SELECT; admin-only INSERT/UPDATE/DELETE
  - `contestants`: public INSERT (sign-up); contestants can SELECT their own row; admins can SELECT all
  - `submissions`: contestants can INSERT/SELECT their own; admins can SELECT all
  - `user_roles`: only the function reads this table (no direct SELECT)

### Step 2: Seed default scenarios
- Migrate the 5 existing `governmentScenarios` from the TypeScript file into the `scenarios` table so they can be reused across competitions.

### Step 3: Admin authentication
- Create `/admin/login` page with email/password sign-in using Supabase Auth
- Protected route wrapper that checks `has_role(uid, 'admin')`
- No profile table needed -- admin identity comes from `auth.users` + `user_roles`

### Step 4: Admin panel pages
- **Competition management**: Create/edit competitions (name, description, location, date, status: draft/active/completed). Assign scenarios from the library. View contestants and their scores.
- **Scenario library**: Create/edit/delete scenarios with all fields (title, description, context, goal, difficulty, category, hints, evaluation criteria, etc.)
- **Results overview**: Table of all submissions per competition, sortable by score, exportable as CSV.

### Step 5: Contestant flow
- `/join/:competitionId` -- simple form: full name + optional email. On submit, creates a `contestants` row and generates a short `access_code`. The code is shown to the contestant and stored in localStorage for session persistence.
- `/compete/:competitionId` -- adapted `QuizInterface` that loads scenarios from DB (via `competition_scenarios`), saves each submission to `submissions` table, and calls the existing `evaluate-prompt` edge function.
- Resume session: if a contestant returns, they can enter their access code to continue.

### Step 6: Leaderboard
- `/leaderboard/:competitionId` -- public page showing ranked contestants by average score across all scenarios, with per-scenario breakdown.

### Step 7: Update Edge Function
- Modify `evaluate-prompt` to optionally accept a `submission_id` and persist the score back to the `submissions` table (or keep it client-driven -- the frontend writes to `submissions` after receiving the score).

## Technical Details

### Contestant session management
- No Supabase Auth for contestants. After sign-up, the `contestant` row ID and `access_code` are stored in localStorage.
- Supabase RLS for `contestants` and `submissions` uses a permissive approach: public INSERT for sign-up, and anon SELECT filtered by `access_code` or `contestant_id` passed as a request parameter.
- Since contestants are anonymous (no auth), submissions INSERT will use a permissive policy, but the `contestant_id` foreign key ensures data integrity.

### Admin auth flow
- Standard Supabase email/password auth
- `user_roles` table with `has_role()` security definer function
- You will need to manually insert the first admin user via SQL Editor after creating an account

### Files to create/modify
- **New files**: ~10 new component/page files for admin panel, contestant flow, leaderboard
- **Modified files**: `App.tsx` (routes), `types/index.ts` (updated types), `useProgress.ts` (replace localStorage with Supabase calls)
- **Database**: 1 migration with all tables, RLS policies, and helper functions
- **Edge function**: Minor update to `evaluate-prompt` (no breaking changes)

