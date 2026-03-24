import React from "react";
import { Link, useParams } from "react-router-dom";
import mockData from "../data/mockData.js";

function ItemDetails() {
  const { id } = useParams();
  const item = mockData.find((entry) => String(entry.id) === String(id));

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
    <section className="page-section detail-page">
      <div className="detail-gallery">
        <div className={`detail-hero-image ${item.imageClass || 'bg-placeholder'}`}></div>
      </div>
      
      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-header">
            <h2>{item.name}</h2>
            <p className="detail-location">📍 {item.location || "Campus Hub"}</p>
          </div>
          
          <div className="detail-owner-card">
            <div className="nav-avatar">S</div>
            <div>
              <strong>Hosted by Student</strong>
              <p>Verified University Email</p>
            </div>
          </div>
          
          <hr className="detail-divider" />
          
          <div className="detail-section">
            <h3>About this gear</h3>
            <p>Available now for same-day pickup. Coordinate in-app chat to confirm time and location. This item is kept in excellent condition and is perfect for campus use. Payments are secured via escrow until both parties confirm the meetup.</p>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="booking-widget">
            <div className="widget-header">
              <h3>${item.pricePerDay || 15} <span className="text-sm font-normal">/ day</span></h3>
              <div className="widget-rating">★ {item.rating || "4.9"}</div>
            </div>
            <div className="widget-body">
              <Link to="/booking" className="btn primary block">
                Request to Book
              </Link>
              <Link to="/chat" className="btn ghost block mt-2">
                Message Owner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ItemDetails;