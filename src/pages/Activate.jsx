import React,{useState}from"react";
import{Link,useNavigate}from"react-router-dom";
import{supabase,setServerSession,loadStudentContext}from"../supabase";

function learnerName(learner){
  if(!learner)return"Student";
  return [learner.first_name,learner.middle_name,learner.last_name,learner.suffix].filter(Boolean).join(" ");
}
function firstName(learner){return learner?.first_name||"Student"}

export default function Activate({session,onLinked,initialSuccess=null}){
  const navigate=useNavigate();
  const[lrn,setLrn]=useState("");
  const[code,setCode]=useState("");
  const[password,setPassword]=useState("");
  const[confirm,setConfirm]=useState("");
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  const[success,setSuccess]=useState(initialSuccess);

  async function finishLinked(){
    const context=await loadStudentContext();
    if(!context?.account||!context?.learner)throw new Error("linked_profile_unavailable");
    setSuccess(context);
    onLinked?.(context);
    return context;
  }

  async function submit(e){
    e.preventDefault();setBusy(true);setError("");
    const clean=lrn.replace(/\D/g,"");
    if(!/^\d{12}$/.test(clean)){setError("LRN must contain exactly 12 digits.");setBusy(false);return}
    if(password.length<8||password!==confirm){setError(password!==confirm?"Passwords do not match.":"Password must contain at least 8 characters.");setBusy(false);return}
    const{data,error}=await supabase.functions.invoke("student-auth",{body:{action:"activate",lrn:clean,activationCode:code,password}});
    if(error||!data?.ok){
      if(data?.error==="account_already_linked"||data?.error==="account_already_activated"){
        try{await finishLinked();setBusy(false);return}catch(_){}
      }
      setError(data?.error==="verification_authority_expired"?"Please ask your current adviser for a new activation code.":data?.error==="account_already_activated"?"This learner account is already activated. Sign in instead.":"The LRN or activation code is invalid.");
      setBusy(false);return;
    }
    if(data.session)await setServerSession(data.session);
    try{await finishLinked()}catch(_){window.location.href="/";return}
    setBusy(false);
  }

  if(success){
    const learner=success.learner,enrollment=success.enrollment;
    return <div className="auth-page celebration-page">
      <div className="confetti" aria-hidden="true">{Array.from({length:32},(_,i)=><i key={i}/>)}</div>
      <section className="auth-card standalone celebration-card">
        <div className="celebration-mark">✓</div>
        <p className="eyebrow">ACCOUNT CREATED</p>
        <h2>Congratulations, {firstName(learner)}!</h2>
        <p className="celebration-copy">You have now created your KLAS Student account.</p>
        <div className="verified-identity">
          <strong>{learnerName(learner)}</strong>
          <span>LRN: {learner.lrn}</span>
          {enrollment?.school?.name&&<span>{enrollment.school.name}</span>}
          {(enrollment?.section?.grade_level||enrollment?.section?.name)&&<span>{[enrollment?.section?.grade_level&&`Grade ${enrollment.section.grade_level}`,enrollment?.section?.name].filter(Boolean).join(" · ")}</span>}
        </div>
        <button className="primary dashboard-button" onClick={()=>navigate("/",{replace:true})}>Go to Student Dashboard →</button>
      </section>
    </div>
  }

  return <div className="auth-page"><section className="auth-card standalone"><p className="eyebrow">ACCOUNT ACTIVATION</p><h2>Activate your Student account</h2><p className="muted">Enter your LRN and the one-time activation code issued by your current class adviser. Then create your private KLAS password.</p><form onSubmit={submit}><label>LRN<input inputMode="numeric" pattern="[0-9]{12}" maxLength="12" required value={lrn} onChange={e=>setLrn(e.target.value.replace(/\D/g,"").slice(0,12))} placeholder="12-digit LRN"/></label><label>Adviser Activation Code<input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Code from your adviser"/></label><label>Create Password<input type="password" minLength="8" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><label>Confirm Password<input type="password" minLength="8" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter password again"/></label>{error&&<div className="error-note">{error}</div>}<button className="primary" disabled={busy}>{busy?"Activating…":"Activate Account"}</button></form><p className="auth-footer">Already activated? <Link to="/">Sign in</Link></p></section></div>
}