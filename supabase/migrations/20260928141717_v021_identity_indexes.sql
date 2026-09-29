-- Mirror of live Supabase migration 20260928141717 (v021_identity_indexes).
-- These indexes cover foreign-key/audit lookup paths added by the v0.2.1 identity model.

create index if not exists account_activation_audit_activation_code_id_idx on public.account_activation_audit (activation_code_id);
create index if not exists account_activation_audit_actor_user_id_idx on public.account_activation_audit (actor_user_id);
create index if not exists account_activation_audit_enrollment_id_idx on public.account_activation_audit (enrollment_id);
create index if not exists account_activation_codes_revoked_by_idx on public.account_activation_codes (revoked_by);
create index if not exists account_activation_codes_used_by_idx on public.account_activation_codes (used_by);
create index if not exists password_reset_codes_enrollment_id_idx on public.password_reset_codes (enrollment_id);
create index if not exists password_reset_codes_issued_by_idx on public.password_reset_codes (issued_by);
create index if not exists password_reset_codes_revoked_by_idx on public.password_reset_codes (revoked_by);
create index if not exists student_identity_audit_actor_user_id_idx on public.student_identity_audit (actor_user_id);
create index if not exists student_identity_audit_enrollment_id_idx on public.student_identity_audit (enrollment_id);
create index if not exists student_identity_audit_learner_id_idx on public.student_identity_audit (learner_id);
