import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});
const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,"0")).join("");
const makeCode=()=>{const a=new Uint8Array(8);crypto.getRandomValues(a);return "KLAS-"+Array.from(a).map(b=>(b%36).toString(36).toUpperCase()).join("")};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"method_not_allowed"},405);
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 const {data:{user}}=await admin.auth.getUser(token); if(!user)return json({error:"unauthorized"},401);
 const {action,enrollmentId}=await req.json(); if(!enrollmentId)return json({error:"invalid_request"},400);
 const {data:e}=await admin.from("enrollments").select("id,learner_id,section_id,status").eq("id",enrollmentId).maybeSingle();
 if(!e||e.status!=="active")return json({error:"invalid_enrollment"},400);
 const {data:a}=await admin.from("advisory_assignments").select("id").eq("section_id",e.section_id).eq("adviser_user_id",user.id).eq("active",true).maybeSingle();
 if(!a)return json({error:"not_current_adviser"},403);
 const code=makeCode(), code_hash=await hash(code), expires=new Date(Date.now()+24*60*60*1000).toISOString();
 if(action==="activation"){
  await admin.from("account_activation_codes").update({revoked_at:new Date().toISOString(),revoked_by:user.id,revoked_reason:"regenerated"}).eq("learner_id",e.learner_id).is("used_at",null).is("revoked_at",null);
  const {error}=await admin.from("account_activation_codes").insert({learner_id:e.learner_id,enrollment_id:e.id,issued_by:user.id,code_hash,expires_at:expires});
  if(error)return json({error:"issue_failed"},400);
  await admin.from("student_identity_audit").insert({actor_user_id:user.id,learner_id:e.learner_id,enrollment_id:e.id,action:"activation_code_issued"});
  return json({ok:true,code,expiresAt:expires});
 }
 if(action==="reset"){
  const {data:acct}=await admin.from("student_accounts").select("user_id").eq("learner_id",e.learner_id).eq("status","active").maybeSingle();
  if(!acct)return json({error:"student_account_not_active"},400);
  await admin.from("password_reset_codes").update({revoked_at:new Date().toISOString(),revoked_by:user.id}).eq("learner_id",e.learner_id).is("used_at",null).is("revoked_at",null);
  const {error}=await admin.from("password_reset_codes").insert({learner_id:e.learner_id,enrollment_id:e.id,issued_by:user.id,code_hash,expires_at:expires});
  if(error)return json({error:"issue_failed"},400);
  await admin.from("student_identity_audit").insert({actor_user_id:user.id,learner_id:e.learner_id,enrollment_id:e.id,action:"password_reset_authorized"});
  return json({ok:true,code,expiresAt:expires});
 }
 return json({error:"unsupported_action"},400);
});