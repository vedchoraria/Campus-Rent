import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/" className="logo">
        <span className="logo-mark">C</span>
        CampusRent
      </Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        {user && (
          <>
            <NavLink to="/marketplace">Marketplace</NavLink>
            <NavLink to="/add">Add Listing</NavLink>
            <NavLink to="/chat">Chat</NavLink>
          </>
        )}
      </nav>
      {user ? (
        <div className="nav-user">
          <button className="nav-icon-btn" title="Notifications">
             🔔
          </button>
          <div className="profile-dropdown-wrapper">
            <button className="nav-profile-btn">
              <div className="nav-avatar mini">{user.initials}</div>
              <span className="nav-username">{user.name}</span>
            </button>
            <div className="profile-dropdown-menu">
              <Link to="#" className="dropdown-item">⚙️ Settings & Profile</Link>
              <Link to="/my-bookings" className="dropdown-item">📦 My Rentals</Link>
              <hr className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item text-danger">Logout</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="nav-actions">
          <NavLink to="/login" className="btn ghost">
            Login
          </NavLink>
          <NavLink to="/signup" className="btn primary">
            Sign Up
          </NavLink>
        </div>
      )}
    </header>
  );
}

export default Navbar;