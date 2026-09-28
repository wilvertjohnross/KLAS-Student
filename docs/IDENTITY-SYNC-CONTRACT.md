# KLAS Identity and Sync Contract

Status: architecture baseline for v0.2.0.

## Authority
KLAS Teacher is the operational source of learner, enrollment and academic records. KLAS Student is a learner-facing client. It must not create or independently alter authoritative grades, SF9 records, enrollment or section membership.

## Identity chain
```
Student Account -> Learner ID -> LRN -> Enrollment(s) -> Published Academic Records
```

- **learner_id**: internal immutable KLAS identifier (UUID).
- **LRN**: unique learner matching key supplied by the authoritative school record.
- **student_account_id**: authentication identity. It is linked to exactly one learner identity in the normal student flow.
- **LRN is never a password, session credential, or sufficient proof of account ownership.**

## Matching
Teacher sync resolves an LRN to one learner identity. A matching LRN updates/associates records with that learner rather than creating a second student account. Conflicting or ambiguous identity data must stop automatic linking and require authorized resolution.

## Account activation
A learner may claim/activate an account only after an additional verification step beyond knowing the LRN. Authentication credentials are maintained separately from learner records.

## Publication boundary
Teacher records remain local-first. Only records explicitly eligible for Student access are synchronized/published. Draft/unfinalized grades remain Teacher-side.

```
Teacher local record
 -> finalize/validate
 -> sync queue
 -> secure cloud sync
 -> publication state
 -> authorized Student read
```

## Authorization invariants
1. A Student session may read only records whose learner_id is linked to that authenticated student_account_id.
2. Client-supplied LRN must never be trusted as authorization.
3. Student clients cannot write authoritative grades, SF9, enrollment or section data.
4. Every published academic record carries school year, source record identity, revision/version and publication timestamp.
5. Re-sync is idempotent: the same Teacher source record must update its cloud counterpart rather than duplicate it.
6. LRN values and learner records are protected data and must not be exposed in public source, logs or test fixtures using real learners.

## Enrollment model
A learner persists across school years. Grade level, section and subjects belong to an enrollment, not directly to the account.

```
Learner
  -> Enrollment 2026-2027
       -> Section
       -> Subjects
       -> Terms
       -> Published grades
       -> SF9
  -> Enrollment 2027-2028
       -> ...
```

## v0.2.0 boundary
v0.2.0 implements the authentication/identity foundation against this contract. Cloud academic synchronization is introduced in the subsequent data/sync milestones.
