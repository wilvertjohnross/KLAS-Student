import React,{useState} from "react";
import{Link}from"react-router-dom";
import{ArrowRight,GraduationCap}from"lucide-react";
import{supabase}from"../supabase";

export default function Login(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setError("");
  const{error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
  if(error)setError(error.message);setBusy(false);
 }
 return <div className="auth-page">
  <section className="auth-brand"><img src="/assets/klas-banner.png" alt="KLAS — The One Place for Every Class"/><span className="portal-chip"><GraduationCap size={16}/> Student Portal</span></section>
  <section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to KLAS</h2><p className="muted">Use the email and password registered to your KLAS Student account.</p>
   <form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com" autoComplete="email"/></label><label>Password<input type="password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/></label>{error&&<div className="error-note">{error}</div>}<button className="primary" disabled={busy} type="submit">{busy?"Signing in…":"Sign In"} <ArrowRight size={18}/></button></form>
   <p className="auth-footer">First time using KLAS? <Link to="/activate">Activate your account</Link></p><p className="dev-note">KLAS Student v0.2.0 — Supabase authentication</p>
  </section>
 </div>
}
