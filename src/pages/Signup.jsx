import React from "react";
import { Link } from "react-router-dom";

function Signup() {
  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Get started</p>
        <h2>Join the campus sharing economy</h2>
        <p>Verify your student email to unlock listings.</p>
      </div>
      <div className="page-panel">
        <p>Signup flow coming soon for campus verification.</p>
        <Link to="/login" className="btn secondary">
          Already have an account?
        </Link>
      </div>
    </section>
  );
}

export default Signup;