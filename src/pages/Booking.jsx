import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BookingForm from "../components/BookingForm.jsx";
import PriceBreakdown from "../components/PriceBreakdown.jsx";
import { checkAvailability } from "../utils/bookingUtils.js";
import mockData from "../data/mockData.js";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { useBookings } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateContext = location.state || {};

  const item = mockData.find((entry) => String(entry.id) === String(id));

  const [startDate, setStartDate] = useState(stateContext.startDate || "");
  const [endDate, setEndDate] = useState(stateContext.endDate || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitGuardRef = useRef(false);
  const { user } = useAuth();
  const { bookings, createBooking } = useBookings();

  useEffect(() => {
    if (!startDate) {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
    }
  }, [startDate]);

  if (!item) {
    return (
      <section
        className="page"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>Item not found</h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Cannot proceed with booking. This item may have been removed.
        </p>
        <button onClick={() => navigate("/marketplace")} className="btn primary">
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

      const activeBookings = bookings.filter(
        (booking) =>
          String(booking.itemId) === String(item.id) &&
          (booking.status === BOOKING_STATUS.upcoming || booking.status === BOOKING_STATUS.ongoing)
      );
      const availability = checkAvailability(start, end, activeBookings);
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
  const finalTotal = totalItemPrice + serviceFee + (item.securityDeposit || 0);
  const isValid = totalDays > 0 && !error;
  const canSubmit = isValid && !isSubmitting;

  const handleConfirm = () => {
    if (!isValid || submitGuardRef.current) return;

    submitGuardRef.current = true;
    setIsSubmitting(true);

    const requesterName = user?.name || "CampusRent User";
    const requesterEmail = user?.email || "anonymous@campusrent.local";
    const bookingId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `REQ-${crypto.randomUUID()}`
        : `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newBooking = {
      id: bookingId,
      requestKey: `${requesterEmail.toLowerCase()}|${String(item.id)}|${startDate}|${endDate}`,
      itemId: item.id,
      title: item.title,
      image: item.images?.[0] || item.imageClass,
      start: startDate,
      end: endDate,
      requester: requesterName,
      requesterEmail,
      submittedAt: new Date().toISOString(),
      rentalAmount: totalItemPrice,
      depositAmount: item.securityDeposit || 0,
      totalAmount: finalTotal,
      status: BOOKING_STATUS.pending,
    };

    createBooking(newBooking);
    navigate("/chat", { state: { bookingRef: bookingId } });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <section className="page" style={{ paddingTop: "24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--primary)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "16px",
          }}
        >
          <span>←</span> Back
        </button>
        <h1 style={{ fontSize: "32px", fontFamily: '"Space Grotesk", sans-serif', marginTop: "8px" }}>
          Confirm Your Reservation
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "16px", marginTop: "8px" }}>
          Review the final details before securing this rental.
        </p>
      </div>

      <div
        className="booking-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 400px) minmax(0, 1fr)",
          gap: "48px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            position: "sticky",
            top: "100px",
          }}
        >
          <div className={`marketplace-card-media ${item.images?.[0] || item.imageClass || "purple"}`} style={{ aspectRatio: "16/9" }}></div>
          <div style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{item.title}</h3>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginBottom: "16px",
              }}
            >
              📍 {item.location}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "var(--bg)",
                borderRadius: "12px",
              }}
            >
              <span style={{ fontWeight: 600 }}>Rate</span>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
                ₹{item.pricePerDay} <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 400 }}>/ day</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            securityDeposit={item.securityDeposit}
            serviceFee={serviceFee}
            finalTotal={finalTotal}
            isValid={canSubmit}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            primaryText={isSubmitting ? "Submitting..." : "Confirm Booking"}
          />
        </div>
      </div>
    </section>
  );
}

export default Booking;
