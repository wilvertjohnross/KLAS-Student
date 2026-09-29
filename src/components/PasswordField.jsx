import React,{useState}from"react";import{Eye,EyeOff}from"lucide-react";

export default function PasswordField({label,value,onChange,placeholder,autoComplete="current-password",minLength=8,required=true}){
  const[visible,setVisible]=useState(false);
  return <label>{label}<span style={{position:"relative",display:"block"}}>
    <input type={visible?"text":"password"} required={required} minLength={minLength} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} style={{paddingRight:"46px"}}/>
    <button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?"Hide password":"Show password"} title={visible?"Hide password":"Show password"} style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",display:"grid",placeItems:"center",width:"34px",height:"34px",padding:0,border:0,background:"transparent",color:"currentColor",cursor:"pointer",opacity:.72}}>
      {visible?<EyeOff size={19}/>:<Eye size={19}/>}
    </button>
  </span></label>
}