import React from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Welcome back</p>
        <h2>Log in to CampusRent</h2>
        <p>Use your university email to stay verified.</p>
      </div>
      <div className="page-panel">
        <p>Authentication UI will live here.</p>
        <Link to="/signup" className="btn secondary">
          Create an account
        </Link>
      </div>
    </section>
  );
}

export default Login;