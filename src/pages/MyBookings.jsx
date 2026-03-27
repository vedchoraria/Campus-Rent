import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userBookings } from "../data/mockData.js";

function MyBookings() {
  const navigate = useNavigate();
  // We use local state to trigger re-renders when mutating the mock array
  const [bookingsList, setBookingsList] = useState([...userBookings]);

  const handleUpdateStatus = (id, newStatus) => {
    // Find in the global array and mutate it to persist
    const target = userBookings.find(b => b.id === id);
    if (target) {
      target.status = newStatus;
      // Trigger a re-render
      setBookingsList([...userBookings]);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>🟢 Active</span>;
      case "confirmed":
        return <span style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>🔵 Confirmed</span>;
      case "completed":
        return <span style={{ padding: '4px 10px', background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>🔘 Completed</span>;
      case "failed":
        return <span style={{ padding: '4px 10px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>🔴 Failed</span>;
      default:
        return null;
    }
  };

  return (
    <section className="page" style={{ paddingTop: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: '"Space Grotesk", sans-serif' }}>My Rentals</h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '8px' }}>Manage your active reservations and past rentals here.</p>
      </div>

      {bookingsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>No bookings yet</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Looks like you haven't rented anything on campus.</p>
          <button onClick={() => navigate('/marketplace')} className="btn primary">Explore Marketplace</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {bookingsList.slice().reverse().map(booking => (
            <div key={booking.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
              
              {/* Image */}
              <div 
                className={`marketplace-card-media ${booking.image || 'purple'}`} 
                style={{ width: '180px', height: '140px', borderRadius: '12px', flexShrink: 0 }}
              ></div>
              
              {/* Info Column */}
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{booking.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>
                      {booking.start} to {booking.end}
                    </p>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', background: 'var(--bg)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>Total Paid</span>
                    <span style={{ fontWeight: 700 }}>₹{booking.totalAmount}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>Deposit</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{booking.depositAmount}</span>
                  </div>
                </div>

                {/* Actions Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 'auto' }}>
                  
                  {booking.status === "confirmed" && (
                    <>
                      <button className="btn primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => handleUpdateStatus(booking.id, "active")}>
                        Received Item
                      </button>
                      <button className="btn outline" style={{ padding: '8px 16px', fontSize: '14px', borderColor: '#e11d48', color: '#e11d48' }} onClick={() => handleUpdateStatus(booking.id, "failed")}>
                        Report Issue
                      </button>
                    </>
                  )}

                  {booking.status === "active" && (
                    <>
                      <button className="btn primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => handleUpdateStatus(booking.id, "completed")}>
                        Mark as Returned
                      </button>
                      <button className="btn outline" style={{ padding: '8px 16px', fontSize: '14px', borderColor: '#e11d48', color: '#e11d48' }} onClick={() => handleUpdateStatus(booking.id, "failed")}>
                        Report Issue
                      </button>
                    </>
                  )}

                  {(booking.status === "confirmed" || booking.status === "active") && (
                    <button className="btn outline" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/chat')}>
                      Chat with Owner
                    </button>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;
