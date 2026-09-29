// Deployed Supabase Edge Function: adviser-student-identity
// Authenticated adviser-only endpoint for issuing one-time activation/reset codes.
// Server verifies the caller is the current adviser of the learner's active enrollment before issuing a code.
// Plaintext code is returned once to the adviser; only SHA-256 digest is stored.
// Production implementation is deployed in Supabase; no service-role secret is committed here.