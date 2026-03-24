import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Booking() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const pricePerDay = 15;

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = d2 - d1;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) diffDays = 1; 
    return diffDays * pricePerDay;
  };

  const total = calculateTotal();

  const handleConfirm = () => {
    if (total > 0) {
      navigate("/chat");
    }
  };

  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Booking</p>
        <h2>Confirm your campus pickup</h2>
        <p>Select your dates to coordinate handoff times with verified students.</p>
      </div>

      <div className="booking-grid">
        <div className="booking-form page-panel">
          <h3>Select Dates</h3>
          <div className="auth-row" style={{ marginTop: '24px', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="auth-label">Pickup Date</label>
              <div className="auth-field">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="auth-label">Return Date</label>
              <div className="auth-field">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  min={startDate}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="booking-summary page-panel">
          <h3>Order Summary</h3>
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0', color: 'var(--text)' }}>
            <span>$15.00 x {total / pricePerDay || 0} days</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0', color: 'var(--text)' }}>
            <span>Campus Service Fee</span>
            <span>$2.50</span>
          </div>
          <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />
          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total</span>
            <span>${total > 0 ? (total + 2.50).toFixed(2) : "0.00"}</span>
          </div>
          <button 
            className="btn primary" 
            style={{ width: '100%', marginTop: '24px', opacity: total === 0 ? 0.5 : 1 }}
            onClick={handleConfirm}
            disabled={total === 0}
          >
            Confirm & Message
          </button>
        </div>
      </div>
    </section>
  );
}

export default Booking;