# KLAS Student Security Baseline

- Never commit real learner records, LRNs, grades, passwords, activation/reset codes, tokens, private keys, service-role keys, or production environment files.
- Browser-visible configuration is not a secret. Privileged backend credentials must never be shipped to the Student client.
- LRN is a 12-digit identity/login identifier, not a password and not sufficient proof of account ownership.
- Initial account activation requires a one-time credential issued by the learner's current class adviser.
- Adviser authority is derived from the learner's active enrollment and advisory section. Ordinary subject-teacher status does not grant identity-verification authority.
- Activation and password-reset codes are one-time, expiring, revocable and stored only as cryptographic hashes.
- Advisers never see learner passwords.
- Password recovery requires current-adviser authorization and a one-time reset credential.
- Authorization is enforced server-side using the authenticated account-to-learner link.
- Identity verification and school-form publication are separate permissions.
- Use synthetic learner data for development and tests.
- KLAS Teacher remains authoritative for academic records; Student access is read-only for those records.
- Log security-relevant actions without logging protected learner data unnecessarily.
