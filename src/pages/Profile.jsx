import React from "react";
export default function Profile({session}) {
  return <div className="module-page">
    <section className="module-heading"><h1>My Profile</h1><p>Your learner information and account details.</p></section>
    <div className="profile-card"><span>Student ID</span><strong>{session.studentId}</strong><span>Account Type</span><strong>Student</strong></div>
  </div>;
}
