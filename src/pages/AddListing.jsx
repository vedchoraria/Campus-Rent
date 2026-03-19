import React from "react";
import { Link } from "react-router-dom";

function AddListing() {
  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Add Listing</p>
        <h2>Share your gear with your campus</h2>
        <p>List items in minutes and manage booking requests in one place.</p>
      </div>
      <div className="page-panel">
        <p>Starter listing flow coming soon. In the meantime, browse demand.</p>
        <Link to="/marketplace" className="btn primary">
          View Marketplace
        </Link>
      </div>
    </section>
  );
}

export default AddListing;