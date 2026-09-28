import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getSession, saveSession, clearSession } from "./storage";
import Login from "./pages/Login";
import Activate from "./pages/Activate";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import Profile from "./pages/Profile";
import Shell from "./components/Shell";

export default function App() {
  const [session, setSession] = useState(getSession());

  function signIn(studentId) {
    const next = { role: "student", studentId, signedInAt: new Date().toISOString() };
    saveSession(next);
    setSession(next);
  }
  function signOut() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/activate" element={<Activate />} />
        <Route path="*" element={<Login onSignIn={signIn} />} />
      </Routes>
    );
  }

  return (
    <Shell onSignOut={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/grades" element={<Placeholder title="My Grades" text="Released grades will appear here once KLAS Cloud synchronization is connected." />} />
        <Route path="/report-card" element={<Placeholder title="My Report Card" text="Your released SF9/report card will be available here." />} />
        <Route path="/schedule" element={<Placeholder title="Class Schedule" text="Your class schedule will appear here." />} />
        <Route path="/feedback" element={<Placeholder title="Teacher Feedback" text="Secure student-to-teacher feedback will be added in a later development stage." />} />
        <Route path="/profile" element={<Profile session={session} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
