-- KLAS Student v0.3.0: tighten learner-scoped read policies.
drop policy if exists student_read_own_report_card_grades on public.report_card_grades;
create policy student_read_own_report_card_grades on public.report_card_grades for select to authenticated using (
 exists (select 1 from public.report_cards rc join public.enrollments e on e.id=rc.enrollment_id join public.student_accounts sa on sa.learner_id=e.learner_id where rc.id=report_card_grades.report_card_id and rc.status='published' and sa.user_id=auth.uid() and sa.status='active')
);
drop policy if exists student_read_schedule on public.class_schedules;
create policy student_read_schedule on public.class_schedules for select to authenticated using (
 status='published' and exists (select 1 from public.section_subjects ss join public.enrollments e on e.section_id=ss.section_id join public.student_accounts sa on sa.learner_id=e.learner_id where ss.id=class_schedules.section_subject_id and sa.user_id=auth.uid() and sa.status='active')
);
drop policy if exists student_read_subjects on public.subjects;
create policy student_read_subjects on public.subjects for select to authenticated using (
 exists (select 1 from public.section_subjects ss join public.enrollments e on e.section_id=ss.section_id join public.student_accounts sa on sa.learner_id=e.learner_id where ss.subject_id=subjects.id and sa.user_id=auth.uid() and sa.status='active')
);
