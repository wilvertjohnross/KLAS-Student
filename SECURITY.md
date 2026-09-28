# KLAS Student Security Baseline

- Never commit real learner records, LRNs, grades, passwords, tokens, private keys, service-role keys, or production environment files.
- Browser-visible configuration is not a secret. Privileged backend credentials must never be shipped to the Student client.
- LRN is an identity matching attribute, not an authentication secret.
- Authorization is enforced server-side using the authenticated account-to-learner link.
- Use synthetic learner data for development and tests.
- KLAS Teacher remains authoritative for academic records; Student access is read-only for those records.
- Future account activation must verify more than possession/knowledge of an LRN.
- Log security-relevant actions without logging protected learner data unnecessarily.
