import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import mockData from "../data/mockData.js";
import ItemGallery from "../components/ItemGallery.jsx";
import ItemInfo from "../components/ItemInfo.jsx";
import BookingForm from "../components/BookingForm.jsx";
import PriceBreakdown from "../components/PriceBreakdown.jsx";
import { checkAvailability } from "../utils/bookingUtils.js";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = mockData.find((entry) => String(entry.id) === String(id));

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  if (!item) {
    return (
      <section className="page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Item not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>The gear you are looking for doesn't exist or was removed.</p>
        <button onClick={() => navigate('/marketplace')} className="btn primary">
          Back to Marketplace
        </button>
      </section>
    );
  }

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : 0;
  };

  const validateDates = (start, end) => {
    setError("");
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      if (d2 < d1) {
        setError("Return date cannot be before pickup date.");
        return false;
      }
      
      const availability = checkAvailability(start, end, item.bookings);
      if (!availability.isAvailable) {
        setError(`Item is already booked from ${availability.conflict.start} to ${availability.conflict.end}.`);
        return false;
      }
    }
    return true;
  };

  const handleStartChange = (val) => {
    setStartDate(val);
    validateDates(val, endDate);
  };

  const handleEndChange = (val) => {
    setEndDate(val);
    validateDates(startDate, val);
  };

  const totalDays = calculateTotalDays();
  const totalItemPrice = totalDays * item.pricePerDay;
  const serviceFee = totalDays > 0 ? 50 : 0;
  const finalTotal = totalItemPrice + serviceFee;
  const isValid = totalDays > 0 && !error;

  const proceedToBooking = () => {
    navigate(`/booking/${item.id}`, { state: { startDate, endDate, from: 'details' } });
  };

  return (
    <section className="page" style={{ paddingTop: '24px' }}>
      
      {/* Back Navigation & Breadcrumbs */}
      <nav style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>←</span> Back
        </button>
        <span>|</span>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <span>&gt;</span>
        <Link to="/marketplace" style={{ textDecoration: 'none', color: 'inherit' }}>Marketplace</Link>
        <span>&gt;</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.title}</span>
      </nav>

      <div className="item-details-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '48px', alignItems: 'start' }}>
        
        {/* Left Section: Gallery & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <ItemGallery images={item.images} fallbackClass={item.imageClass} />
          <ItemInfo item={item} />
        </div>

        {/* Right Section: Sticky Booking Panel */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <BookingForm 
            startDate={startDate} 
            endDate={endDate} 
            onStartChange={handleStartChange} 
            onEndChange={handleEndChange} 
            error={error} 
            totalDays={totalDays} 
          />
          <PriceBreakdown 
            totalDays={totalDays}
            pricePerDay={item.pricePerDay}
            serviceFee={serviceFee}
            finalTotal={finalTotal}
            isValid={isValid}
            onConfirm={proceedToBooking}
            primaryText="Request to Book"
          />
        </div>

      </div>
    </section>
  );
}

export default ItemDetails;