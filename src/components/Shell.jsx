import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, GraduationCap, FileText, CalendarDays, MessageSquare, UserRound, LogOut, Moon, Sun } from "lucide-react";

const items = [
  ["/", Home, "Home"], ["/grades", GraduationCap, "My Grades"], ["/report-card", FileText, "Report Card"],
  ["/schedule", CalendarDays, "Schedule"], ["/feedback", MessageSquare, "Feedback"], ["/profile", UserRound, "My Profile"],
];

export default function Shell({ children, onSignOut }) {
  const [dark,setDark]=useState(()=>localStorage.getItem("klas-theme")==="dark");
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("klas-theme",dark?"dark":"light")},[dark]);
  return <div className="klas-layout">
    <aside className="sidebar">
      <NavLink to="/" className="side-brand" aria-label="KLAS Student Home"><img src="/assets/klas-banner.png" alt="KLAS — The One Place for Every Class"/></NavLink>
      <div className="portal-label">STUDENT PORTAL</div>
      <nav className="side-nav">{items.map(([to,Icon,label])=><NavLink key={to} to={to} end={to==="/"} className={({isActive})=>isActive?"active":""}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="side-bottom">
        <button className="utility" onClick={()=>setDark(v=>!v)}>{dark?<Sun size={16}/>:<Moon size={16}/>} {dark?"Light":"Dark"}</button>
        <button className="utility" onClick={onSignOut}><LogOut size={16}/> Log Out</button>
        <small>KLAS Student<br/>v0.1.2</small>
      </div>
    </aside>
    <header className="mobile-head">
      <NavLink to="/" className="mobile-brand"><img src="/assets/klas-banner.png" alt="KLAS"/></NavLink>
      <NavLink to="/profile" className="profile-shortcut" aria-label="My Profile"><UserRound size={22}/></NavLink>
    </header>
    <main className="main-stage">{children}</main>
    <nav className="bottom-nav">{items.slice(0,5).map(([to,Icon,label])=><NavLink key={to} to={to} end={to==="/"} className={({isActive})=>isActive?"active":""}><Icon size={21}/><span>{label}</span></NavLink>)}</nav>
  </div>;
}
