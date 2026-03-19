import React from "react";
import ItemCard from "../components/ItemCard.jsx";
import mockData from "../data/mockData.js";

function Marketplace() {
  return (
    <section className="page-section">
      <div className="section-head">
        <p className="eyebrow">Marketplace</p>
        <h2>Browse campus listings</h2>
        <p>Discover gear from verified classmates across your campus.</p>
      </div>
      <div className="grid four">
        {mockData.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default Marketplace;