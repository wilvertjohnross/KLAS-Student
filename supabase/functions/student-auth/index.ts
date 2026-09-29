import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const url=Deno.env.get("SUPABASE_URL")!;
const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
const normalizeLrn=(v:unknown)=>String(v??"").replace(/\D/g,"");
const internalEmail=(lrn:string)=>`student.${lrn}@auth.klas.internal`;

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"method_not_allowed"},405);
 try{
  const {action,lrn,password,activationCode,resetCode}=await req.json();
  const clean=normalizeLrn(lrn);
  if(!/^\d{12}$/.test(clean))return json({error:"invalid_credentials"},400);
  if(typeof password!=="string"||password.length<8)return json({error:"password_must_be_at_least_8_characters"},400);
  if(action==="login"){
   const client=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")!,{auth:{autoRefreshToken:false,persistSession:false}});
   const {data,error}=await client.auth.signInWithPassword({email:internalEmail(clean),password});
   if(error||!data.session)return json({error:"invalid_credentials"},401);
   return json({ok:true,session:data.session});
  }
  if(action==="activate"){
   const code=String(activationCode??"").trim().toUpperCase();
   if(code.length<8)return json({error:"invalid_activation_details"},400);
   const {data:learner}=await admin.from("learners").select("id,lrn").eq("lrn",clean).maybeSingle();
   if(!learner)return json({error:"invalid_activation_details"},400);
   const {data:existing}=await admin.from("student_accounts").select("user_id").eq("learner_id",learner.id).maybeSingle();
   if(existing)return json({error:"account_already_activated"},409);
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(code)))).map(b=>b.toString(16).padStart(2,"0")).join("");
   const {data:proof}=await admin.from("account_activation_codes").select("id,enrollment_id,expires_at,used_at,revoked_at,issued_by").eq("learner_id",learner.id).eq("code_hash",digest).maybeSingle();
   if(!proof||proof.used_at||proof.revoked_at||new Date(proof.expires_at)<=new Date()||!proof.enrollment_id||!proof.issued_by)return json({error:"invalid_activation_details"},400);
   const {data:enr}=await admin.from("enrollments").select("id,section_id,status").eq("id",proof.enrollment_id).eq("learner_id",learner.id).maybeSingle();
   if(!enr||enr.status!=="active")return json({error:"invalid_activation_details"},400);
   const {data:assignment}=await admin.from("advisory_assignments").select("id").eq("section_id",enr.section_id).eq("adviser_user_id",proof.issued_by).eq("active",true).maybeSingle();
   if(!assignment)return json({error:"verification_authority_expired"},403);
   const email=internalEmail(clean);
   const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{account_type:"student"}});
   if(createError||!created.user)return json({error:"account_creation_failed"},400);
   const uid=created.user.id;
   const {error:linkError}=await admin.from("student_accounts").insert({user_id:uid,learner_id:learner.id,status:"active",activated_at:new Date().toISOString(),login_identifier:email});
   if(linkError){await admin.auth.admin.deleteUser(uid);return json({error:"account_creation_failed"},400)}
   await admin.from("account_activation_codes").update({used_at:new Date().toISOString(),used_by:uid}).eq("id",proof.id).is("used_at",null);
   await admin.from("student_identity_audit").insert({actor_user_id:proof.issued_by,learner_id:learner.id,enrollment_id:proof.enrollment_id,action:"account_activated"});
   const client=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")!,{auth:{autoRefreshToken:false,persistSession:false}});
   const {data:signed,error:signError}=await client.auth.signInWithPassword({email,password});
   if(signError||!signed.session)return json({ok:true,requiresLogin:true});
   return json({ok:true,session:signed.session});
  }
  if(action==="reset"){
   const code=String(resetCode??"").trim().toUpperCase();
   if(code.length<8)return json({error:"invalid_reset_details"},400);
   const {data:learner}=await admin.from("learners").select("id").eq("lrn",clean).maybeSingle();
   if(!learner)return json({error:"invalid_reset_details"},400);
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(code)))).map(b=>b.toString(16).padStart(2,"0")).join("");
   const {data:proof}=await admin.from("password_reset_codes").select("*").eq("learner_id",learner.id).eq("code_hash",digest).maybeSingle();
   if(!proof||proof.used_at||proof.revoked_at||new Date(proof.expires_at)<=new Date())return json({error:"invalid_reset_details"},400);
   const {data:enr}=await admin.from("enrollments").select("section_id,status").eq("id",proof.enrollment_id).maybeSingle();
   const {data:assignment}=enr?await admin.from("advisory_assignments").select("id").eq("section_id",enr.section_id).eq("adviser_user_id",proof.issued_by).eq("active",true).maybeSingle():{data:null};
   if(!enr||enr.status!=="active"||!assignment)return json({error:"verification_authority_expired"},403);
   const {data:account}=await admin.from("student_accounts").select("user_id").eq("learner_id",learner.id).eq("status","active").maybeSingle();
   if(!account)return json({error:"invalid_reset_details"},400);
   const {error:updateError}=await admin.auth.admin.updateUserById(account.user_id,{password});
   if(updateError)return json({error:"password_reset_failed"},400);
   await admin.from("password_reset_codes").update({used_at:new Date().toISOString()}).eq("id",proof.id).is("used_at",null);
   await admin.from("student_identity_audit").insert({actor_user_id:proof.issued_by,learner_id:learner.id,enrollment_id:proof.enrollment_id,action:"password_reset_completed"});
   return json({ok:true});
  }
  return json({error:"unsupported_action"},400);
 }catch(_){return json({error:"request_failed"},400)}
});