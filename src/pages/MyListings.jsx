import React, { useMemo, useState } from "react";
import ListingCard from "../components/ListingCard.jsx";
import ApprovalCard from "../components/ApprovalCard.jsx";
import RentalHistoryCard from "../components/RentalHistoryCard.jsx";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { useBookings } from "../context/BookingContext.jsx";
import { useListings } from "../context/ListingContext.jsx";

const tabs = ["Active Listings", "Pending Approvals", "Rental History"];

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
  const { listings, toggleHidden, deleteListing } = useListings();
  const { bookings, approveBooking, rejectBooking, markReturned, cancelBooking } = useBookings();

  const formattedListings = useMemo(() => {
    return listings.map(item => {
      const itemBookings = bookings.filter(b => String(b.itemId) === String(item.id));
      const ongoing = itemBookings.find(b => b.status === BOOKING_STATUS.ongoing);
      const upcoming = itemBookings.filter(b => b.status === BOOKING_STATUS.upcoming);
      
      upcoming.sort((a,b) => new Date(a.start) - new Date(b.start));

      const nextReservation = upcoming.length > 0 ? {
        dates: formatRange(upcoming[0].start, upcoming[0].end),
        renter: upcoming[0].requester || "Student"
      } : null;

      let status = ongoing ? "Rented" : "Available";

      return {
        id: item.id,
        name: item.title,
        price: `₹${item.pricePerDay}`,
        status,
        isHidden: item.isHidden,
        image: item.images?.[0] || 'teal',
        currentRental: ongoing ? {
          dates: formatRange(ongoing.start, ongoing.end),
          renter: ongoing.requester || "Student"
        } : null,
        nextReservation,
        upcoming: upcoming.map(b => ({
          id: b.id,
          dates: formatRange(b.start, b.end),
          renter: b.requester || "Student"
        })),
        rawItem: item
      };
    });
  }, [listings, bookings]);

  const approvals = useMemo(() => {
    const listingIds = new Set(listings.map(l => String(l.id)));
    return bookings
      .filter((booking) => booking.status === BOOKING_STATUS.pending && listingIds.has(String(booking.itemId)))
      .map((booking) => {
        const item = listings.find((l) => String(l.id) === String(booking.itemId));
        return {
          id: booking.id,
          title: item?.title || booking.title,
          requester: booking.requester || "CampusRent User",
          dates: formatRange(booking.start, booking.end),
          status: booking.status,
        };
      });
  }, [bookings, listings]);

  const handleEditListing = (item) => {
    window.alert(`Edit listing: ${item.name}`);
  };

  const handleToggleHidden = (item) => {
    toggleHidden(item.id);
  };

  const handleDeleteListing = (item) => {
    deleteListing(item.id);
  };

  const handleApprove = (approval) => {
    approveBooking(approval.id);
  };

  const handleReject = (approval) => {
    rejectBooking(approval.id);
  };

  const handleMarkReturned = (item) => {
    const activeBooking = bookings.find(
      (booking) => String(booking.itemId) === String(item.id) && booking.status === BOOKING_STATUS.ongoing
    );
    if (activeBooking) {
      markReturned(activeBooking.id);
    }
  };

  const handleCancelUpcoming = (bookingId) => {
    cancelBooking(bookingId);
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
          {formattedListings.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              onEdit={handleEditListing}
              onToggleHidden={handleToggleHidden}
              onDelete={handleDeleteListing}
              onMarkReturned={handleMarkReturned}
              onCancelUpcoming={handleCancelUpcoming}
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
