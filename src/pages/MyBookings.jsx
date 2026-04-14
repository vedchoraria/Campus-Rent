import React, { useMemo, useState } from "react";
import BorrowedItemCard from "../components/BorrowedItemCard.jsx";
import UpcomingRentalCard from "../components/UpcomingRentalCard.jsx";
import CompletedRentalCard from "../components/CompletedRentalCard.jsx";
import PendingRequestCard from "../components/PendingRequestCard.jsx";
import mockData from "../data/mockData.js";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { useBookings } from "../context/BookingContext.jsx";

const tabs = ["Pending", "Upcoming", "Ongoing", "Completed"];


const formatShortDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date);
};

const formatFullDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);
};

const formatPickupDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatRange = (start, end) => {
  if (!start && !end) return "";
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

const formatCurrency = (value) => {
  if (typeof value !== "number") return "";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
};

function MyBookings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { bookings, cancelBooking, markReturned } = useBookings();
  const handleComingSoon = () => {
    window.alert("Feature coming soon");
  };

  const { pending, upcoming, ongoing, completed } = useMemo(() => {
    const itemLookup = mockData.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const normalized = bookings
      .map((booking) => {
        const item = itemLookup[booking.itemId];
        const name = booking.title || item?.title || "Item";
        const image = booking.image || item?.images?.[0] || item?.imageClass || "teal";
        const owner = booking.owner || "CampusRent Owner";
        const dates = formatRange(booking.start, booking.end);
        const submitted = formatFullDate(booking.submittedAt);
        const pickup = formatPickupDate(booking.pickupAt || booking.start);
        const returned = formatFullDate(booking.returnedAt || booking.end);
        const deposit = formatCurrency(booking.depositAmount ?? item?.securityDeposit);
        const total = formatCurrency(booking.totalAmount);
        return {
          id: booking.id,
          status: booking.status,
          name,
          owner,
          dates,
          submitted,
          pickup,
          returned,
          deposit,
          total,
          image,
        };
      })
      .filter((booking) => booking.status);

    return {
      pending: normalized.filter((booking) => booking.status === BOOKING_STATUS.pending),
      upcoming: normalized.filter((booking) => booking.status === BOOKING_STATUS.upcoming),
      ongoing: normalized.filter((booking) => booking.status === BOOKING_STATUS.ongoing),
      completed: normalized.filter((booking) => booking.status === BOOKING_STATUS.completed),
    };
  }, [bookings]);

  const stats = [
    { label: "Pending Requests", value: String(pending.length) },
    { label: "Upcoming Pickups", value: String(upcoming.length) },
    { label: "Ongoing Borrowings", value: String(ongoing.length) },
    { label: "Completed Borrowings", value: String(completed.length) },
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "32px", fontFamily: '"Space Grotesk", sans-serif', marginBottom: "8px" }}>
          My Borrowings
        </h1>
        <p style={{ color: "var(--muted, #6b7280)" }}>
          Track pending approvals, upcoming pickups, active borrowings, and completed returns.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "18px",
              borderRadius: "16px",
              border: "1px solid var(--border, #e5e7eb)",
              background: "var(--surface, #ffffff)",
              boxShadow: "var(--shadow)",
            }}
          >
            <p style={{ margin: 0, color: "var(--muted, #6b7280)", fontSize: "14px" }}>{stat.label}</p>
            <h3 style={{ margin: "10px 0 0", fontSize: "24px", fontWeight: 700 }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              border: "1px solid var(--border, #e5e7eb)",
              background: activeTab === tab ? "var(--primary, #0d9488)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text-main, #1f2937)",
              fontWeight: 600,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Pending" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {pending.map((request) => (
            <PendingRequestCard
              key={request.id}
              request={request}
              onCancel={() => cancelBooking(request.id)}
              onMessageOwner={handleComingSoon}
            />
          ))}
        </div>
      )}

      {activeTab === "Ongoing" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {ongoing.map((rental) => (
            <BorrowedItemCard
              key={rental.id}
              rental={rental}
              onMarkReturned={() => markReturned(rental.id)}
              onReportIssue={handleComingSoon}
              onChat={handleComingSoon}
            />
          ))}
        </div>
      )}

      {activeTab === "Upcoming" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {upcoming.map((rental) => (
            <UpcomingRentalCard
              key={rental.id}
              rental={rental}
              onCancel={() => cancelBooking(rental.id)}
              onChat={handleComingSoon}
            />
          ))}
        </div>
      )}

      {activeTab === "Completed" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {completed.map((rental) => (
            <CompletedRentalCard key={rental.id} rental={rental} onRateOwner={handleComingSoon} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;
