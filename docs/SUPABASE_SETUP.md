# 🐾 Huellitas — Supabase Setup Guide

This document walks you through everything you need to do in the Supabase dashboard for the project (`vqbkmdvhvqwasvdwjdtf`) so that the migrated app boots cleanly.

---

## 1. Paste the SQL schema (one time)

1. Open the **SQL Editor**:
   `https://supabase.com/dashboard/project/vqbkmdvhvqwasvdwjdtf/sql/new`
2. Paste the entire SQL from the migration plan:
   - enums `report_type`, `pet_species`, `pet_status`
   - tables `profiles`, `reports`, `report_images`
   - indexes (including `pg_trgm` GIN index on `location`)
   - `set_updated_at` trigger
   - `handle_new_user` trigger (auto-creates a `profiles` row on signup)
   - RLS policies for all three tables
   - Storage bucket `pet-images` (public read, owner-only writes)
   - Storage RLS policies (insert / update / delete only inside your own folder)
3. Click **Run**. You should see "Success. No rows returned" or similar.

---

## 1.1. Contact request tracking

Run this SQL after the base schema to store contact/reclaim requests from public report pages. The app inserts with the server-side `service_role` key; RLS stays enabled with no client policies so browser clients cannot read or write this table directly.

```sql
create extension if not exists pgcrypto;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  report_owner_id uuid not null references public.profiles(id) on delete cascade,
  requester_name text not null,
  requester_contact text not null,
  requester_message text,
  requester_email text,
  requester_phone text,
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists contact_requests_report_id_idx
  on public.contact_requests (report_id);

create index if not exists contact_requests_report_owner_id_idx
  on public.contact_requests (report_owner_id);

create index if not exists contact_requests_rate_limit_idx
  on public.contact_requests (report_id, ip_hash, created_at desc);

alter table public.contact_requests enable row level security;
```

---

## 2. Get the API keys

1. Go to `https://supabase.com/dashboard/project/vqbkmdvhvqwasvdwjdtf/settings/api`
2. Copy these two values and paste them into `.env.local`:
   - **`anon public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role`** (⚠️ server-only, never expose) → `SUPABASE_SERVICE_ROLE_KEY`
3. Save the file.

---

## 3. Configure auth providers

### 3.1. Email (default enabled)

`Auth → Providers → Email` — should be **on** out of the box. Make sure **Confirm email** is **OFF** for local dev (otherwise users have to click a confirmation link before they can sign in with the OTP code).

### 3.2. Phone (Twilio) 📱

`Auth → Providers → Phone` → **Enable**.

You'll need a Twilio account:

1. Create a project at https://console.twilio.com.
2. Copy these three values from the Twilio dashboard:
   - **Account SID** — looks like `AC…`
   - **Auth Token** — under the Account SID
   - **Messaging Service SID** — `Messaging → Services → Create new`. Pick a sender, copy the SID (looks like `MG…`).
3. Back in Supabase, paste them into the corresponding fields and click **Save**.

The free Twilio trial only sends SMS to verified numbers — verify your own phone in **Twilio → Phone Numbers → Verified Caller IDs** before testing locally.

### 3.3. Google OAuth

`Auth → Providers → Google` → **Enable**.

1. Open https://console.cloud.google.com and create a project.
2. **APIs & Services → OAuth consent screen** → External → fill in app name ("Huellitas") and support email.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `https://vqbkmdvhvqwasvdwjdtf.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**, paste them into Supabase → Save.

### 3.4. Facebook OAuth (optional)

`Auth → Providers → Facebook` → **Enable**.

1. Go to https://developers.facebook.com → **My Apps → Create App** → Consumer.
2. **Settings → Basic** → copy App ID and App Secret.
3. **Facebook Login → Settings → Valid OAuth Redirect URIs**:
   `https://vqbkmdvhvqwasvdwjdtf.supabase.co/auth/v1/callback`
4. Paste App ID/Secret into Supabase → Save.

---

## 4. Set redirect URLs

`Auth → URL Configuration`:

- **Site URL**: `http://localhost:3000`
- **Additional Redirect URLs** (one per line):
  ```
  http://localhost:3000
  http://localhost:3000/api/auth/callback
  https://your-production-domain.com
  https://your-production-domain.com/api/auth/callback
  ```

---

## 5. Local environment

`/Volumes/WD_BLACK/Personal Projects/huellitas/.env.local` should look like:

```ini
NEXT_PUBLIC_SUPABASE_URL="https://vqbkmdvhvqwasvdwjdtf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ…"
SUPABASE_SERVICE_ROLE_KEY="eyJ…"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
CONTACT_REQUEST_IP_SALT="change-me-in-production"

# Optional: enables real transactional emails. Without it, emails are logged.
RESEND_API_KEY="re_..."
SENDER_EMAIL="Huellitas <noreply@your-domain.com>"
```

Then run:

```bash
pnpm install
pnpm dev
```

---

## 6. Smoke-test checklist

- [ ] `pnpm build` passes with no type errors
- [ ] Visit `/` — landing page renders, recent reports (if any) show public images from Storage
- [ ] `/login` → enter email → check your **inbox** (or **Supabase → Auth → Users** for the magic link)
- [ ] `/login` → enter phone → you should receive a real SMS (after Twilio is wired)
- [ ] `/login` → "Continuar con Google" → OAuth round-trip
- [ ] Sign in, visit `/reportes/nuevo` (was protected by middleware — confirms auth)
- [ ] Create a report with an image → confirm the file lands in **Storage → pet-images** under your `<user_id>/` folder
- [ ] View the report on `/reportes` and `/reportes/<id>`
- [ ] Submit the contact form on a report → confirm a row lands in `contact_requests`
- [ ] Confirm owner/internal contact emails are delivered or logged when `RESEND_API_KEY` is absent
- [ ] Mark it as REUNITED (owner-only — RLS will block other users)
- [ ] Sign out, visit `/reportes/nuevo` → redirects to `/login?callback=…`

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Invalid API key` on every request | Wrong anon key in `.env.local` | Re-copy from Supabase → Settings → API |
| Phone OTP not received | Twilio creds not set, or trial-number not verified | Set Twilio creds, verify your number in Twilio |
| `permission denied for table profiles` | RLS not enabled / policies not applied | Re-run the SQL in step 1 |
| Image upload fails with `new row violates row-level security policy` | The signed-in user is uploading to a folder that doesn't start with their own `auth.uid()` | The client code uploads to `${user.id}/…` — confirm the session is fresh (`supabase.auth.getUser()` works) |
| `relation "report_images" does not exist` | SQL not run yet | Run the SQL in step 1 |
| Google button does nothing | Redirect URI not whitelisted in Google Cloud Console | Add the Supabase callback URL (step 3.3) |
| Build complains about `process.env.NEXT_PUBLIC_SUPABASE_URL` being `undefined` | `.env.local` not loaded | Restart `pnpm dev` after editing env files |
