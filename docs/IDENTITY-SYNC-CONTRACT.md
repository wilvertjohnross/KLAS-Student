# KLAS Identity and Sync Contract

Status: architecture baseline for v0.2.1.

## Authority
KLAS Teacher is the operational source of learner, enrollment and academic records. KLAS Student is a learner-facing client. It must not create or independently alter authoritative grades, SF9 records, enrollment or section membership.

The learner's **current class adviser** is the school-level identity verifier. Adviser authority is derived from the learner's active enrollment and advisory section; it is not a general teacher permission. A subject teacher has no student-account verification authority unless that teacher is also the current adviser.

## Identity chain
```
Student Account -> Learner ID -> LRN -> Enrollment(s) -> Published Academic Records
                                      |
                                      -> Advisory Section -> Current Adviser
```

- **learner_id**: internal immutable KLAS identifier (UUID).
- **LRN**: unique 12-digit learner matching/login identifier supplied by the authoritative school record.
- **student account**: authentication identity linked to exactly one learner.
- LRN is never a password or sufficient proof of account ownership.

## Adviser-verified activation
1. Teacher/Adviser maintains the authoritative advisory roster.
2. Only the adviser assigned to the learner's active advisory section may issue or revoke that learner's activation credential.
3. The learner enters LRN + one-time adviser-issued activation code.
4. After verification, the learner privately creates a password.
5. KLAS links the authentication identity to the existing learner UUID.
6. The adviser never sees or stores the learner password.
7. Activation credentials are hashed at rest, expire, are one-time-use and are auditable.

Authority follows enrollment. When an active learner enrollment moves to another advisory section, verification/recovery authority moves to that section's current adviser.

## Password recovery
Recovery is school-managed. The current adviser may authorize a one-time password-reset credential for a learner in the adviser's active section. The learner chooses the replacement password privately. Adviser authorization and completion are audited.

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
1. A Student session may read only records linked to its learner_id.
2. Client-supplied LRN must never be trusted as authorization by itself.
3. Student clients cannot write authoritative grades, SF9, enrollment or section data.
4. Adviser verification operations require an active enrollment whose section has that authenticated user as current adviser.
5. Identity-verification permission and school-form publication permission remain distinct capabilities even when both belong to the adviser.
6. Every security-relevant identity operation is audited.
7. Real learner data, credentials and private keys must never be committed to source control.

## v0.2.1 boundary
v0.2.1 replaces email-dependent student onboarding with adviser-verified school identity. The Student UX is LRN + password. Backend implementation must keep any Supabase-internal authentication identifier private and must not make LRN alone an authentication secret.
