import React, { useMemo, useState } from "react";
import ListingCard from "../components/ListingCard.jsx";
import ApprovalCard from "../components/ApprovalCard.jsx";
import RentalHistoryCard from "../components/RentalHistoryCard.jsx";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { useBookings } from "../context/BookingContext.jsx";
import { useListings } from "../context/ListingContext.jsx";

const tabs = ["Active Listings", "Pending Approvals", "Rental History"];

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

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = String(item?.id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

function MyListings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { myListings, toggleHidden, deleteListing } = useListings();
  const { bookings, approveBooking, rejectBooking, markReturned, cancelBooking } = useBookings();

  const formattedListings = useMemo(() => {
    return myListings.map((item) => {
      const itemBookings = uniqueById(
        bookings.filter((booking) => String(booking.itemId) === String(item.id))
      );
      const ongoing = itemBookings.find((booking) => booking.status === BOOKING_STATUS.ongoing);
      const upcoming = itemBookings.filter((booking) => booking.status === BOOKING_STATUS.upcoming);

      upcoming.sort((a, b) => new Date(a.start) - new Date(b.start));

      const nextReservation =
        upcoming.length > 0
          ? {
              dates: formatRange(upcoming[0].start, upcoming[0].end),
              renter: upcoming[0].requester || "Student",
            }
          : null;

      const status = ongoing ? "Rented" : "Available";

      return {
        id: item.id,
        name: item.title,
        price: `Rs ${item.pricePerDay}`,
        status,
        isHidden: item.isHidden,
        image: item.images?.[0] || "teal",
        currentRental: ongoing
          ? {
              dates: formatRange(ongoing.start, ongoing.end),
              renter: ongoing.requester || "Student",
            }
          : null,
        nextReservation,
        upcoming: upcoming.map((booking) => ({
          id: booking.id,
          dates: formatRange(booking.start, booking.end),
          renter: booking.requester || "Student",
        })),
        rawItem: item,
      };
    });
  }, [myListings, bookings]);

  const approvals = useMemo(() => {
    const listingIds = new Set(myListings.map((listing) => String(listing.id)));
    return uniqueById(bookings)
      .filter(
        (booking) =>
          booking.status === BOOKING_STATUS.pending && listingIds.has(String(booking.itemId))
      )
      .map((booking) => {
        const item = myListings.find((listing) => String(listing.id) === String(booking.itemId));
        return {
          id: booking.id,
          title: item?.title || booking.title,
          requester: booking.requester || "CampusRent User",
          dates: formatRange(booking.start, booking.end),
        };
      });
  }, [bookings, myListings]);

  const history = useMemo(() => {
    const listingIds = new Set(myListings.map((listing) => String(listing.id)));
    return uniqueById(bookings)
      .filter(
        (booking) =>
          [BOOKING_STATUS.completed, BOOKING_STATUS.cancelled, BOOKING_STATUS.rejected].includes(
            booking.status
          ) && listingIds.has(String(booking.itemId))
      )
      .map((booking) => {
        const item = myListings.find((listing) => String(listing.id) === String(booking.itemId));
        const statusLabel =
          booking.status === BOOKING_STATUS.cancelled
            ? "Cancelled"
            : booking.status === BOOKING_STATUS.rejected
              ? "Rejected"
              : "Completed";
        const timelineAt =
          booking.cancelledAt || booking.returnedAt || booking.end || booking.submittedAt || "";

        return {
          id: booking.id,
          item: item?.title || booking.title || "Unspecified Item",
          renter: booking.requester || "CampusRent User",
          dates: formatRange(booking.start, booking.end),
          total: `Rs ${booking.totalAmount || 0}`,
          statusLabel,
          cancelledBy: booking.cancelledBy || null,
          timelineAt,
        };
      })
      .sort((a, b) => new Date(b.timelineAt) - new Date(a.timelineAt));
  }, [bookings, myListings]);

  const handleEditListing = (item) => {
    window.alert(`Edit listing: ${item.name}`);
  };

  const handleToggleHidden = (item) => {
    toggleHidden(item.id);
  };

  const handleDeleteListing = async (item) => {
    try {
      await deleteListing(item.id);
    } catch (err) {
      window.alert(err.message || "Failed to delete listing.");
    }
  };

  const handleApprove = (approval) => {
    approveBooking(approval.id);
  };

  const handleReject = (approval) => {
    rejectBooking(approval.id);
  };

  const handleMarkReturned = (item) => {
    const activeBooking = bookings.find(
      (booking) =>
        String(booking.itemId) === String(item.id) && booking.status === BOOKING_STATUS.ongoing
    );
    if (activeBooking) {
      markReturned(activeBooking.id);
    }
  };

  const handleCancelUpcoming = (bookingId) => {
    cancelBooking(bookingId, "lender");
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
          { label: "Total Revenue", value: "Rs 48,200" },
          { label: "Active Rentals", value: "3" },
          { label: "Lender Rating", value: "4.9" },
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
          {history.map((rental) => (
            <RentalHistoryCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyListings;
