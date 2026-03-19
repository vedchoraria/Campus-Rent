import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-mark">C</span>
        CampusRent
      </Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/marketplace">Marketplace</NavLink>
        <NavLink to="/add">Add Listing</NavLink>
        <NavLink to="/chat">Chat</NavLink>
      </nav>
      <div className="nav-actions">
        <NavLink to="/login" className="btn ghost">
          Login
        </NavLink>
        <NavLink to="/signup" className="btn primary">
          Sign Up
        </NavLink>
      </div>
    </header>
  );
}

export default Navbar;