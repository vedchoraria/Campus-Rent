import React from "react";

const categories = [
  { name: "Tech", count: 24, active: true },
  { name: "Books", count: 18 },
  { name: "Adventure", count: 12 },
  { name: "Sports", count: 9 },
];

const locations = [
  "North Campus",
  "South Dorms",
  "Central Library",
  "Arts District",
];

const listings = [
  {
    id: "m1",
    title: "MacBook Pro M2 - 2023",
    price: "$15",
    rating: "4.9",
    location: "Campus Center",
    badge: "Student Verified",
  },
  {
    id: "m2",
    title: "Sony Alpha A7 III + 35mm",
    price: "$25",
    rating: "4.8",
    location: "Arts District",
    badge: "Student Verified",
  },
  {
    id: "m3",
    title: "Sony WH-1000XM5",
    price: "$8",
    rating: "5.0",
    location: "Library North",
    badge: "Student Verified",
  },
  {
    id: "m4",
    title: "North Face Stormbreak 2",
    price: "$12",
    rating: "4.7",
    location: "North Campus Quad",
    badge: "Featured",
  },
  {
    id: "m5",
    title: "Canon AE-1 Program",
    price: "$10",
    rating: "4.6",
    location: "South Dorms",
    badge: "Student Verified",
  },
];

function Marketplace() {
  return (
    <section className="marketplace">
      <aside className="marketplace-sidebar">
        <div className="marketplace-panel">
          <div className="marketplace-panel-head">
            <span className="marketplace-panel-icon">C</span>
            <h4>Categories</h4>
          </div>
          <div className="marketplace-category-list">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className={`marketplace-category ${cat.active ? "active" : ""}`}
              >
                <span>{cat.name}</span>
                <span className="marketplace-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="marketplace-panel">
          <h4>Pickup Location</h4>
          <div className="marketplace-location-list">
            {locations.map((loc, index) => (
              <label key={loc} className="marketplace-checkbox">
                <input type="checkbox" defaultChecked={index === 0} />
                <span>{loc}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="marketplace-panel">
          <h4>Price Range</h4>
          <div className="marketplace-range">
            <div className="marketplace-range-bar">
              <span className="marketplace-range-fill" />
            </div>
            <div className="marketplace-range-labels">
              <span>$0</span>
              <span>$100+</span>
            </div>
          </div>
        </div>

        <div className="marketplace-perk">
          <h4>Campus Perk</h4>
          <p>Verified students get insurance on all rentals automatically.</p>
          <button className="btn primary" type="button">
            Learn More
          </button>
        </div>
      </aside>

      <div className="marketplace-main">
        <div className="marketplace-banner">
          <div>
            <p>List your own items to earn campus credits!</p>
            <span>Credits can be used for rentals or dining hall passes.</span>
          </div>
          <button className="btn secondary" type="button">
            Start Listing
          </button>
        </div>

        <div className="marketplace-head">
          <div>
            <h2>Student Marketplace</h2>
            <p>
              Find high-quality gear you need for your next project or weekend
              trip, shared by peers.
            </p>
          </div>
          <button className="marketplace-sort" type="button">
            Sort: Newest
          </button>
        </div>

        <div className="marketplace-grid">
          {listings.map((item, index) => (
            <article
              key={item.id}
              className={`marketplace-card ${index === 3 ? "wide" : ""}`}
            >
              <div className="marketplace-card-media">
                <span className="marketplace-card-badge">{item.badge}</span>
              </div>
              <div className="marketplace-card-body">
                <div>
                  <h3>{item.title}</h3>
                  <div className="marketplace-meta">
                    <span>{item.location}</span>
                    <span className="marketplace-rating">? {item.rating}</span>
                  </div>
                </div>
                <div className="marketplace-card-footer">
                  <strong>
                    {item.price} <span>/ day</span>
                  </strong>
                  <button type="button" className="marketplace-cta">
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="marketplace-load">
          <button type="button" className="btn secondary">
            Load More Items
          </button>
        </div>
      </div>
    </section>
  );
}

export default Marketplace;
