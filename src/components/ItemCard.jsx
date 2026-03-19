import React from "react";
import { Link } from "react-router-dom";

function ItemCard({ item }) {
  return (
    <Link to={`/item/${item.id}`} className="listing-card">
      <div className={`listing-image ${item.imageClass}`}></div>
      <div className="listing-top">
        <span>{item.pricePerDay}</span>
        <span>{item.rating} star</span>
      </div>
      <h3>{item.name}</h3>
      <p>{item.location}</p>
    </Link>
  );
}

export default ItemCard;