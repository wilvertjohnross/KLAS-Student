import React,{useState}from"react";
import{Link,useNavigate}from"react-router-dom";
import{supabase}from"../supabase";

export default function Activate({session,onActivated}){
 const nav=useNavigate();const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[lrn,setLrn]=useState("");const[code,setCode]=useState("");const[error,setError]=useState("");const[info,setInfo]=useState("");const[busy,setBusy]=useState(false);
 async function createAccount(e){e.preventDefault();setBusy(true);setError("");setInfo("");
  const{data,error}=await supabase.auth.signUp({email:email.trim(),password});
  if(error)setError(error.message);else if(!data.session)setInfo("Account created. Check your email to confirm it, then return to KLAS and sign in before activating.");else setInfo("Account created. Now enter your 12-digit LRN and school-issued activation code.");
  setBusy(false);
 }
 async function activate(e){e.preventDefault();setBusy(true);setError("");setInfo("");
  const clean=lrn.replace(/\D/g,"");if(!/^\d{12}$/.test(clean)){setError("LRN must contain exactly 12 digits.");setBusy(false);return}
  const{data,error}=await supabase.functions.invoke("activate-student-account",{body:{lrn:clean,activationCode:code}});
  if(error){let message=error.message;try{const body=await error.context?.json();message=body?.error||message}catch{}setError(message);setBusy(false);return}
  if(!data?.ok){setError(data?.error||"Activation failed.");setBusy(false);return}
  await onActivated?.();setInfo("Account activated successfully.");setBusy(false);nav("/",{replace:true});
 }
 return <div className="auth-page"><section className="auth-card standalone">
  <p className="eyebrow">ACCOUNT ACTIVATION</p><h2>{session?"Link your learner record":"Create your Student account"}</h2>
  {!session?<><p className="muted">Create your secure KLAS login first. Your LRN is not your password.</p><form onSubmit={createAccount}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="student@example.com"/></label><label>Password<input type="password" required minLength="8" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters"/></label>{error&&<div className="error-note">{error}</div>}{info&&<div className="success-note">{info}</div>}<button className="primary" disabled={busy}>{busy?"Creating…":"Create Account"}</button></form><p className="auth-footer">Already registered? <Link to="/">Sign in</Link></p></>
  :<><p className="muted">Enter the 12-digit LRN and one-time activation code issued for your learner record.</p><form onSubmit={activate}><label>LRN<input inputMode="numeric" pattern="[0-9]{12}" maxLength="12" required value={lrn} onChange={e=>setLrn(e.target.value.replace(/\D/g,"").slice(0,12))} placeholder="12-digit LRN"/></label><label>Activation Code<input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} autoCapitalize="characters" placeholder="School-issued code"/></label>{error&&<div className="error-note">{error}</div>}{info&&<div className="success-note">{info}</div>}<button className="primary" disabled={busy}>{busy?"Activating…":"Activate Account"}</button></form></>}
 </section></div>
}