import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, FileText, CalendarDays, MessageSquare, UserRound } from "lucide-react";
const cards=[
 ["/grades",GraduationCap,"My Grades","See My Grades","blue"], ["/report-card",FileText,"Report Card","View My SF9","purple"],
 ["/schedule",CalendarDays,"Class Schedule","See My Schedule","gold"], ["/feedback",MessageSquare,"Teacher Feedback","Send Feedback","teal"]
];
function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"}
export default function Dashboard({session}){return <div className="student-home page-background">
  <section className="hero-center">
    <img className="environment-logo" src="/assets/klas-banner.png" alt="KLAS — The One Place for Every Class"/>
    <h1>{greeting()}, Student!</h1>
    <p className="student-meta">Student ID: {session.studentId}</p><p className="school-name">Your School</p>
    <Link to="/profile" className="edit-profile"><UserRound size={16}/> My Profile</Link>
    <div className="portal-kicker">KLAS STUDENT PORTAL</div><h3>Select a service to continue.</h3>
  </section>
  <section className="klas-card-grid">{cards.map(([to,Icon,title,action,tone])=><Link className="klas-card" to={to} key={to}><div className={`big-icon ${tone}`}><Icon/></div><strong>{title}</strong><span className={`pill ${tone}`}>{action}</span></Link>)}</section>
</div>}
