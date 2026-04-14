import React, { useMemo, useState } from "react";
import ListingCard from "../components/ListingCard.jsx";
import ApprovalCard from "../components/ApprovalCard.jsx";
import RentalHistoryCard from "../components/RentalHistoryCard.jsx";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { useBookings } from "../context/BookingContext.jsx";

const tabs = ["Active Listings", "Pending Approvals", "Rental History"];

const mockListings = [
  {
    id: "l1",
    name: "Sony A7 III + 35mm",
    price: "₹2,500",
    status: "Available",
    image: "teal",
    nextReservation: { dates: "Apr 18 - Apr 20", renter: "Anika Shah" },
    upcoming: [
      { id: "u1", dates: "Apr 22 - Apr 24", renter: "Priya S." },
      { id: "u2", dates: "Apr 27 - Apr 28", renter: "Ravi Malhotra" },
    ],
  },
  {
    id: "l2",
    name: "MacBook Pro M2",
    price: "₹1,500",
    status: "Rented",
    image: "blue",
    currentRental: { dates: "Apr 12 - Apr 16", renter: "Omar K." },
    upcoming: [{ id: "u3", dates: "Apr 20 - Apr 22", renter: "Jenny L." }],
  },
  {
    id: "l3",
    name: "North Face Stormbreak 2",
    price: "₹1,200",
    status: "Hidden",
    image: "coral",
    nextReservation: null,
    upcoming: [],
  },
];

const mockHistory = [
  { id: "h1", item: "DJI Mini 3 Drone", renter: "Priya S.", dates: "Mar 10 - Mar 13", total: "₹4,800" },
  { id: "h2", item: "Sony WH-1000XM5", renter: "Omar K.", dates: "Feb 22 - Feb 24", total: "₹1,600" },
  { id: "h3", item: "Organic Chemistry 8th Ed", renter: "Jenny L.", dates: "Jan 05 - Jan 12", total: "₹2,100" },
];

const formatShortDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date);
};

const formatRange = (start, end) => {
  if (!start && !end) return "";
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

function MyListings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [listings, setListings] = useState(mockListings);
  const { bookings, approveBooking, rejectBooking, markReturned } = useBookings();

  const approvals = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === BOOKING_STATUS.pending)
        .map((booking) => ({
          id: booking.id,
          title: booking.title,
          requester: booking.requester || "CampusRent User",
          dates: formatRange(booking.start, booking.end),
          status: booking.status,
        })),
    [bookings]
  );

  const handleEditListing = (item) => {
    window.alert(`Edit listing: ${item.name}`);
  };

  const handleToggleHidden = (item) => {
    setListings((prev) =>
      prev.map((listing) => {
        if (listing.id !== item.id) return listing;
        if (listing.status === "Hidden") {
          return { ...listing, status: "Available" };
        }
        if (listing.status === "Available") {
          return { ...listing, status: "Hidden" };
        }
        return listing;
      })
    );
  };

  const handleDeleteListing = (item) => {
    setListings((prev) => prev.filter((listing) => listing.id !== item.id));
  };

  const handleApprove = (approval) => {
    approveBooking(approval.id);
  };

  const handleReject = (approval) => {
    rejectBooking(approval.id);
  };

  const handleMarkReturned = (item) => {
    const activeBooking = bookings.find(
      (booking) => booking.itemId === item.id && booking.status === BOOKING_STATUS.ongoing
    );
    if (activeBooking) {
      markReturned(activeBooking.id);
    }
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === item.id ? { ...listing, status: "Available", currentRental: null } : listing
      )
    );
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "32px", fontFamily: '"Space Grotesk", sans-serif', marginBottom: "8px" }}>
          My Gear Closet
        </h1>
        <p style={{ color: "var(--muted, #6b7280)" }}>
          Track your listings, approvals, and rental performance in one place.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Revenue", value: "₹48,200" },
          { label: "Active Rentals", value: "3" },
          { label: "Lender Rating", value: "4.9 ★" },
        ].map((stat) => (
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

      {activeTab === "Active Listings" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {listings.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              onEdit={handleEditListing}
              onToggleHidden={handleToggleHidden}
              onDelete={handleDeleteListing}
              onMarkReturned={handleMarkReturned}
            />
          ))}
        </div>
      )}

      {activeTab === "Pending Approvals" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {approvals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {activeTab === "Rental History" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {mockHistory.map((rental) => (
            <RentalHistoryCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyListings;
