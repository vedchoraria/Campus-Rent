import React from "react";
import { useNavigate } from "react-router-dom";

function ItemCard({ item }) {
  const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/item/${item.id}`);
  };

  return (
    <div
      className="listing-card item-card"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.name}`}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetails();
        }
      }}
    >
      <div className={`listing-image ${item.imageClass}`}></div>
      <div className="listing-top">
        <span>{item.pricePerDay}</span>
        <span>{item.rating} star</span>
      </div>
      <h3>{item.name}</h3>
      <p>{item.location}</p>

      <div className="item-quick-action">
        <button
          type="button"
          className="btn primary quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            goToDetails();
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ItemCard;