import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!email.toLowerCase().endsWith("@nitrr.ac.in")) {
      setError("Please login using your @nitrr.ac.in campus email.");
      return;
    }

    const name = email.split("@")[0] || "Student";
    const initials = name.substring(0, 2).toUpperCase();
    login({ name, email, initials });
    navigate("/marketplace");
  };

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

        {error && (
          <div className="auth-error" style={{ color: '#ef4444', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        <form className="auth-form">
          <label className="auth-label" htmlFor="login-email">
            Student Email
          </label>
          <div className="auth-field">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
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

          <button onClick={handleLogin} className="btn primary auth-submit" type="button">
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
