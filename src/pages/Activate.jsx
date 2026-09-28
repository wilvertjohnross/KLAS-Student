import React from "react";
import { Link } from "react-router-dom";

export default function Activate() {
  return <div className="simple-page auth-page">
    <section className="auth-card standalone">
      <p className="eyebrow">ACCOUNT ACTIVATION</p>
      <h2>Activate Student Account</h2>
      <p className="muted">In the connected release, students will use a school-issued activation code to securely link an account to an existing learner record.</p>
      <div className="notice">Activation is intentionally disabled in v0.1.2 until the identity and backend rules are implemented.</div>
      <Link className="button-link" to="/">Back to Sign In</Link>
    </section>
  </div>;
}
