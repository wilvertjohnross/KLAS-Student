import React from "react";
export default function Placeholder({title, text}) {
  return <div className="module-page">
    <section className="module-heading"><h1>{title}</h1><p>{text}</p></section>
    <div className="klas-empty"><strong>KLAS Student</strong><p>This service is prepared for the next development stage.</p></div>
  </div>;
}
