import React from "react";
import { Link, useParams } from "react-router-dom";
import mockData from "../data/mockData.js";

function ItemDetails() {
  const { id } = useParams();
  const item = mockData.find((entry) => entry.id === id);

  if (!item) {
    return (
      <section className="page-section">
        <div className="section-head">
          <h2>Item not found</h2>
          <p>Try browsing the marketplace for available listings.</p>
        </div>
        <Link to="/marketplace" className="btn primary">
          Back to Marketplace
        </Link>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="detail-grid">
        <div className={`listing-image ${item.imageClass} detail-image`}></div>
        <div className="detail-content">
          <p className="eyebrow">Listing details</p>
          <h2>{item.name}</h2>
          <p className="subtext">{item.location}</p>
          <div className="detail-meta">
            <span>{item.pricePerDay}</span>
            <span>{item.rating} star</span>
          </div>
          <p>
            Available now for same-day pickup. Coordinate in-app chat to confirm
            time and location.
          </p>
          <div className="detail-actions">
            <Link to="/booking" className="btn primary">
              Request Booking
            </Link>
            <Link to="/chat" className="btn secondary">
              Message Owner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ItemDetails;