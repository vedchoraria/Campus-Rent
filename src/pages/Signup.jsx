import React, { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <section className="auth-page">
      <div className="auth-tabs" role="tablist" aria-label="Authentication">
        <Link to="/login" className="auth-tab" role="tab">
          Login
        </Link>
        <Link to="/signup" className="auth-tab active" role="tab">
          Sign Up
        </Link>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Join CampusRent</h1>
          <p>Create your student account to unlock the marketplace.</p>
        </div>
        <form className="auth-form">
          <label className="auth-label" htmlFor="signup-name">
            Full Name
          </label>
          <div className="auth-field">
            <input id="signup-name" type="text" placeholder="Alex Johnson" />
          </div>

          <label className="auth-label" htmlFor="signup-email">
            Student Email
          </label>
          <div className="auth-field">
            <input
              id="signup-email"
              type="email"
              placeholder="name@university.edu"
            />
          </div>

          <label className="auth-label" htmlFor="signup-password">
            Password
          </label>
          <div className="auth-field auth-password">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
            />
            <span 
              className="auth-eye" 
              aria-hidden="true"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button className="btn primary auth-submit" type="button">
            Create Account
          </button>
          <p className="auth-terms">
            By creating an account, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="auth-oauth">
          <button className="auth-provider" type="button">
            <span className="auth-provider-icon">G</span>
            Google
          </button>
          <button className="auth-provider" type="button">
            <span className="auth-provider-icon">A</span>
            Apple
          </button>
        </div>
      </div>

      <div className="auth-features">
        <div className="auth-feature">
          <div className="auth-feature-icon">V</div>
          <div>
            <strong>Verified</strong>
            <span>Campus email required</span>
          </div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">S</div>
          <div>
            <strong>Secure</strong>
            <span>Protected student profiles</span>
          </div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">G</div>
          <div>
            <strong>Guided</strong>
            <span>Onboarding tips included</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
