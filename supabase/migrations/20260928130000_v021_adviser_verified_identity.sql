-- KLAS Student v0.2.1: adviser-verified learner identity
-- Authority follows the learner's active advisory enrollment.
-- Applied to cloud as migration v021_adviser_verified_identity.

create table if not exists public.advisory_assignments (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  adviser_user_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  check ((active and ended_at is null) or (not active))
);
create unique index if not exists advisory_assignments_one_active_adviser_per_section
  on public.advisory_assignments(section_id) where active;
create index if not exists advisory_assignments_adviser_idx
  on public.advisory_assignments(adviser_user_id) where active;
alter table public.advisory_assignments enable row level security;
revoke all on public.advisory_assignments from anon, authenticated;

alter table public.account_activation_codes
  add column if not exists enrollment_id uuid references public.enrollments(id) on delete cascade,
  add column if not exists issued_by uuid references auth.users(id) on delete set null,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null,
  add column if not exists revoked_reason text;
create index if not exists account_activation_codes_enrollment_idx on public.account_activation_codes(enrollment_id);
create index if not exists account_activation_codes_issued_by_idx on public.account_activation_codes(issued_by);

alter table public.account_activation_audit
  add column if not exists enrollment_id uuid references public.enrollments(id) on delete set null,
  add column if not exists actor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists action text,
  add column if not exists activation_code_id uuid references public.account_activation_codes(id) on delete set null;

create table if not exists public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  code_hash text not null unique,
  issued_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);
create index if not exists password_reset_codes_learner_idx on public.password_reset_codes(learner_id);
alter table public.password_reset_codes enable row level security;
revoke all on public.password_reset_codes from anon, authenticated;

create table if not exists public.student_identity_audit (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  learner_id uuid references public.learners(id) on delete set null,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  action text not null check (action in ('activation_code_issued','activation_code_revoked','account_activated','password_reset_authorized','password_reset_completed')),
  occurred_at timestamptz not null default now()
);
alter table public.student_identity_audit enable row level security;
revoke all on public.student_identity_audit from anon, authenticated;

create or replace function private.is_current_adviser(p_user_id uuid, p_enrollment_id uuid)
returns boolean language sql stable security definer set search_path = public, private, pg_temp as $$
  select exists (
    select 1
    from public.enrollments e
    join public.advisory_assignments aa on aa.section_id=e.section_id and aa.active
    where e.id=p_enrollment_id
      and e.status='active'::public.enrollment_status
      and aa.adviser_user_id=p_user_id
  );
$$;
revoke all on function private.is_current_adviser(uuid,uuid) from public, anon, authenticated;