-- KLAS Student v0.3.0 — Academic Data Foundation
-- Applied to Supabase as migration 20260929150843.
-- Teacher remains authoritative; Student clients receive only published academic records.

create type public.academic_record_status as enum ('draft','published','withdrawn');

create table public.subjects (
 id uuid primary key default gen_random_uuid(),
 school_id uuid not null references public.schools(id) on delete cascade,
 code text not null, name text not null, display_name text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(school_id,code)
);
create table public.grading_terms (
 id uuid primary key default gen_random_uuid(),
 school_year_id uuid not null references public.school_years(id) on delete cascade,
 term_no smallint not null check(term_no between 1 and 3), name text not null,
 starts_on date, ends_on date, created_at timestamptz not null default now(),
 unique(school_year_id,term_no)
);
create table public.section_subjects (
 id uuid primary key default gen_random_uuid(),
 section_id uuid not null references public.sections(id) on delete cascade,
 subject_id uuid not null references public.subjects(id) on delete restrict,
 teacher_user_id uuid references auth.users(id) on delete set null, source_key text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(section_id,subject_id)
);
create table public.published_grades (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references public.enrollments(id) on delete cascade,
 section_subject_id uuid not null references public.section_subjects(id) on delete cascade,
 grading_term_id uuid not null references public.grading_terms(id) on delete cascade,
 grade smallint not null check(grade between 60 and 100),
 status public.academic_record_status not null default 'draft',
 source_version text, source_updated_at timestamptz, published_at timestamptz, withdrawn_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(enrollment_id,section_subject_id,grading_term_id)
);
create table public.class_schedules (
 id uuid primary key default gen_random_uuid(),
 section_subject_id uuid not null references public.section_subjects(id) on delete cascade,
 day_of_week smallint not null check(day_of_week between 1 and 7),
 starts_at time not null, ends_at time not null, room text,
 status public.academic_record_status not null default 'draft', published_at timestamptz,
 source_version text, source_updated_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at > starts_at), unique(section_subject_id,day_of_week,starts_at)
);
create table public.teacher_feedback (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references public.enrollments(id) on delete cascade,
 section_subject_id uuid references public.section_subjects(id) on delete set null,
 grading_term_id uuid references public.grading_terms(id) on delete set null,
 message text not null check(length(trim(message)) > 0),
 status public.academic_record_status not null default 'draft', published_at timestamptz,
 source_version text, source_updated_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.report_cards (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null references public.enrollments(id) on delete cascade,
 status public.academic_record_status not null default 'draft',
 source_version text, source_updated_at timestamptz, published_at timestamptz, withdrawn_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(enrollment_id)
);
create table public.report_card_grades (
 report_card_id uuid not null references public.report_cards(id) on delete cascade,
 section_subject_id uuid not null references public.section_subjects(id) on delete cascade,
 term1 smallint check(term1 between 60 and 100), term2 smallint check(term2 between 60 and 100),
 term3 smallint check(term3 between 60 and 100), final_grade smallint check(final_grade between 60 and 100),
 remarks text, primary key(report_card_id,section_subject_id)
);
create table public.sync_receipts (
 id uuid primary key default gen_random_uuid(),
 school_id uuid not null references public.schools(id) on delete cascade,
 source_client_id text not null, entity_type text not null, source_record_id text not null,
 source_version text not null, payload_hash text, synced_at timestamptz not null default now(),
 unique(source_client_id,entity_type,source_record_id,source_version)
);

create index published_grades_enrollment_status_idx on public.published_grades(enrollment_id,status);
create index teacher_feedback_enrollment_status_idx on public.teacher_feedback(enrollment_id,status);
create index report_cards_enrollment_status_idx on public.report_cards(enrollment_id,status);
create index section_subjects_section_idx on public.section_subjects(section_id);
create index class_schedules_section_subject_status_idx on public.class_schedules(section_subject_id,status);

alter table public.subjects enable row level security;
alter table public.grading_terms enable row level security;
alter table public.section_subjects enable row level security;
alter table public.published_grades enable row level security;
alter table public.class_schedules enable row level security;
alter table public.teacher_feedback enable row level security;
alter table public.report_cards enable row level security;
alter table public.report_card_grades enable row level security;
alter table public.sync_receipts enable row level security;

create policy student_read_own_published_grades on public.published_grades for select to authenticated using (
 status='published' and exists (select 1 from public.enrollments e join public.student_accounts sa on sa.learner_id=e.learner_id where e.id=published_grades.enrollment_id and sa.user_id=auth.uid() and sa.status='active'));
create policy student_read_own_feedback on public.teacher_feedback for select to authenticated using (
 status='published' and exists (select 1 from public.enrollments e join public.student_accounts sa on sa.learner_id=e.learner_id where e.id=teacher_feedback.enrollment_id and sa.user_id=auth.uid() and sa.status='active'));
create policy student_read_own_report_card on public.report_cards for select to authenticated using (
 status='published' and exists (select 1 from public.enrollments e join public.student_accounts sa on sa.learner_id=e.learner_id where e.id=report_cards.enrollment_id and sa.user_id=auth.uid() and sa.status='active'));
create policy student_read_own_report_card_grades on public.report_card_grades for select to authenticated using (
 exists (select 1 from public.report_cards rc where rc.id=report_card_grades.report_card_id));
create policy student_read_own_section_subjects on public.section_subjects for select to authenticated using (
 exists (select 1 from public.enrollments e join public.student_accounts sa on sa.learner_id=e.learner_id where e.section_id=section_subjects.section_id and sa.user_id=auth.uid() and sa.status='active'));
create policy student_read_subjects on public.subjects for select to authenticated using (
 exists (select 1 from public.section_subjects ss where ss.subject_id=subjects.id));
create policy student_read_terms on public.grading_terms for select to authenticated using (
 exists (select 1 from public.enrollments e join public.student_accounts sa on sa.learner_id=e.learner_id where e.school_year_id=grading_terms.school_year_id and sa.user_id=auth.uid() and sa.status='active'));
create policy student_read_schedule on public.class_schedules for select to authenticated using (
 status='published' and exists (select 1 from public.section_subjects ss where ss.id=class_schedules.section_subject_id));

comment on table public.published_grades is 'Teacher-owned term grades. Student clients may read only published records for their own enrollment.';
comment on table public.report_cards is 'Published SF9/report-card release boundary; detail rows are subordinate to the parent card.';
comment on table public.sync_receipts is 'Idempotency ledger for KLAS Teacher to Cloud synchronization; no ordinary client policies by design.';
