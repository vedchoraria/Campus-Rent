import React, { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <section className="auth-page">
      <div className="auth-tabs" role="tablist" aria-label="Authentication">
        <Link to="/login" className="auth-tab active" role="tab">
          Login
        </Link>
        <Link to="/signup" className="auth-tab" role="tab">
          Sign Up
        </Link>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back!</h1>
          <p>The campus marketplace is waiting for you.</p>
        </div>
        <form className="auth-form">
          <label className="auth-label" htmlFor="login-email">
            Student Email
          </label>
          <div className="auth-field">
            <input
              id="login-email"
              type="email"
              placeholder="name@university.edu"
            />
          </div>

          <div className="auth-row">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <Link to="/login" className="auth-link">
              Forgot Password?
            </Link>
          </div>
          <div className="auth-field auth-password">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
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
            Enter the Hub
          </button>
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
          <div className="auth-feature-icon">S</div>
          <div>
            <strong>Secure</strong>
            <span>Encrypted transactions</span>
          </div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">C</div>
          <div>
            <strong>Community</strong>
            <span>Verified students only</span>
          </div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">E</div>
          <div>
            <strong>Eco-friendly</strong>
            <span>Sharing reduces waste</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
