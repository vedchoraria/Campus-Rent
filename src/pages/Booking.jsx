import React from "react";
import { Link } from "react-router-dom";

function Booking() {
  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Booking</p>
        <h2>Confirm your campus pickup</h2>
        <p>Coordinate handoff times with verified students.</p>
      </div>
      <div className="page-panel">
        <p>Booking tools will appear here once you request a listing.</p>
        <Link to="/chat" className="btn primary">
          Open Campus Chat
        </Link>
      </div>
    </section>
  );
}

export default Booking;