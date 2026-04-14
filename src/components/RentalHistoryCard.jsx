import React from "react";

function RentalHistoryCard({ rental }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid var(--border, #e5e7eb)",
        background: "var(--surface, #ffffff)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "16px",
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{rental.item}</h4>
        <p style={{ margin: "6px 0 0", color: "var(--muted, #6b7280)" }}>
          {rental.renter} · {rental.dates}
        </p>
      </div>
      <span style={{ alignSelf: "center", fontWeight: 700 }}>{rental.total}</span>
    </div>
  );
}

export default RentalHistoryCard;
