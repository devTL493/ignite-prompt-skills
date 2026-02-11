

# Admin Account Creation and Password Recovery

## Overview

Create a Supabase Edge Function to securely provision admin accounts (sign up + assign admin role), and add a "Forgot Password" flow to the Admin Login page using Supabase's built-in password recovery.

## Step 1: Edge Function -- `create-admin`

Create a new Edge Function `supabase/functions/create-admin/index.ts` that:

1. Accepts `{ email, password }` in the request body
2. Uses the Supabase Admin API (service role key) to create a user via `supabase.auth.admin.createUser()`
3. Inserts a row into `user_roles` with `role = 'admin'`
4. Returns the created user ID

This function will be invoked once to bootstrap the first admin. It will be protected by checking a shared secret or can be called directly via `supabase--curl_edge_functions` during setup.

## Step 2: Add Password Reset to Admin Login

Update `src/pages/AdminLogin.tsx` to add a "Passwort vergessen?" link that:

1. Shows an email input field
2. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/admin/reset-password' })`
3. Displays a success message

## Step 3: Password Reset Page

Create `src/pages/AdminResetPassword.tsx`:

1. Reads the recovery token from the URL (Supabase redirects with a hash fragment)
2. Shows a "New Password" form
3. Calls `supabase.auth.updateUser({ password })` to set the new password
4. Redirects to `/admin/login` on success

## Step 4: Route Registration

Add the new `/admin/reset-password` route to `src/App.tsx`.

## Step 5: Configure Supabase Auth Redirect

Ensure the Supabase project's Site URL and Redirect URLs include the preview domain so password reset emails link back correctly.

## Step 6: Bootstrap the Admin

After deploying the edge function, call it once to create the admin account with the desired email and password.

---

## Technical Details

### Edge Function (`create-admin`)
- Uses `SUPABASE_SERVICE_ROLE_KEY` (already configured as a secret)
- Creates user with `email_confirm: true` so no verification email is needed
- Inserts into `user_roles` table in a single transaction
- Should be called once and can optionally be deleted afterward

### Password Reset Flow
- Supabase handles the email sending automatically
- The recovery link contains a token in the URL hash
- `onAuthStateChange` with event `PASSWORD_RECOVERY` triggers the reset form
- `supabase.auth.updateUser({ password })` completes the reset

### Files to create
- `supabase/functions/create-admin/index.ts`
- `src/pages/AdminResetPassword.tsx`

### Files to modify
- `src/pages/AdminLogin.tsx` -- add "Forgot Password" toggle
- `src/App.tsx` -- add `/admin/reset-password` route
- `supabase/config.toml` -- register new edge function

