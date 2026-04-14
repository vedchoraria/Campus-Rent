import React, { useState } from "react";
import BorrowedItemCard from "../components/BorrowedItemCard.jsx";
import UpcomingRentalCard from "../components/UpcomingRentalCard.jsx";
import CompletedRentalCard from "../components/CompletedRentalCard.jsx";

const tabs = ["Ongoing", "Upcoming", "Completed"];

const mockOngoing = [
  {
    id: "o1",
    name: "Sony WH-1000XM5",
    owner: "Samira Patel",
    dates: "Apr 10 - Apr 15",
    deposit: "₹5,000",
    total: "₹3,200",
    image: "teal",
  },
  {
    id: "o2",
    name: "MacBook Pro M2",
    owner: "Alex Rivera",
    dates: "Apr 12 - Apr 16",
    deposit: "₹25,000",
    total: "₹6,000",
    image: "blue",
  },
];

const mockUpcoming = [
  {
    id: "u1",
    name: "Canon AE-1 Program",
    owner: "Priya S.",
    pickup: "Apr 20, 10:00 AM",
    dates: "Apr 20 - Apr 23",
    image: "coral",
  },
  {
    id: "u2",
    name: "North Face Stormbreak 2",
    owner: "Omar K.",
    pickup: "Apr 26, 6:00 PM",
    dates: "Apr 26 - Apr 28",
    image: "teal",
  },
];

const mockCompleted = [
  {
    id: "c1",
    name: "DJI Mini 3 Drone",
    owner: "Jenny L.",
    returned: "Apr 04, 2026",
    image: "blue",
  },
  {
    id: "c2",
    name: "Organic Chemistry 8th Ed",
    owner: "Ravi Malhotra",
    returned: "Mar 28, 2026",
    image: "coral",
  },
];

function MyBookings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "32px", fontFamily: '"Space Grotesk", sans-serif', marginBottom: "8px" }}>
          Borrowed Items
        </h1>
        <p style={{ color: "var(--muted, #6b7280)" }}>
          Track your current, upcoming, and completed borrowings.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          { label: "Currently Borrowed", value: "2" },
          { label: "Upcoming Pickups", value: "2" },
          { label: "Completed Rentals", value: "5" },
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

      {activeTab === "Ongoing" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {mockOngoing.map((rental) => (
            <BorrowedItemCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}

      {activeTab === "Upcoming" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {mockUpcoming.map((rental) => (
            <UpcomingRentalCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}

      {activeTab === "Completed" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {mockCompleted.map((rental) => (
            <CompletedRentalCard key={rental.id} rental={rental} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;
