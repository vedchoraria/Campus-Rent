import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
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