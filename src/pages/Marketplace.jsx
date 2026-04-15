import React, { useState, useMemo, useEffect } from "react";

const categories = [
  { name: "All", count: 45 },
  { name: "Tech", count: 24 },
  { name: "Books", count: 18 },
  { name: "Adventure", count: 12 },
  { name: "Sports", count: 9 },
];

const locations = [
  "All Locations",
  "North Campus",
  "South Dorms",
  "Central Library",
  "Arts District",
];

import { useListings } from "../context/ListingContext.jsx";
import ItemCard from "../components/ItemCard.jsx";
import { useBookings } from "../context/BookingContext.jsx";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";

function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All Locations");
  const [sortOption, setSortOption] = useState("Newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { listings } = useListings();
  const { bookings } = useBookings();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Simulate initial realistic loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedListings = useMemo(() => {
    const blockedStatuses = new Set([BOOKING_STATUS.upcoming, BOOKING_STATUS.ongoing]);
    const blockedItemIds = new Set(
      bookings.filter((booking) => blockedStatuses.has(booking.status)).map((booking) => booking.itemId)
    );

    let result = listings.filter(item => !item.isHidden);

    // Search filter
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearch) ||
          item.category.toLowerCase().includes(lowerSearch)
      );
    }

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Location filter
    if (activeLocation !== "All Locations") {
      result = result.filter((item) => item.location === activeLocation);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "Newest") {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      } else if (sortOption === "Price: Low to High") {
        return a.pricePerDay - b.pricePerDay;
      } else if (sortOption === "Rating") {
        return b.rating - a.rating;
      }
      return 0;
    });

    return result.map((item) => ({
      ...item,
      isUnavailable: blockedItemIds.has(item.id),
    }));
  }, [debouncedSearch, activeCategory, activeLocation, sortOption, bookings, listings]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <section className="marketplace-container page">
      <div className="marketplace-top-bar">
        <div className="marketplace-search">
          <span role="img" aria-label="search">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search for cameras, laptops, books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="marketplace-filters-toggle btn secondary"
          onClick={toggleSidebar}
        >
          Filters <span>{isSidebarOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      <div className="marketplace">
        <aside className={`marketplace-sidebar ${isSidebarOpen ? "open" : ""}`}>
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
                  onClick={() => setActiveCategory(cat.name)}
                  className={`marketplace-category ${
                    activeCategory === cat.name ? "active" : ""
                  }`}
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
              {locations.map((loc) => (
                <label key={loc} className="marketplace-checkbox hover-target">
                  <input
                    type="radio"
                    name="location"
                    checked={activeLocation === loc}
                    onChange={() => setActiveLocation(loc)}
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="marketplace-panel">
            <h4>Sort By</h4>
            <select
              className="marketplace-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Newest">Newest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Rating">Rating</option>
            </select>
          </div>

          <div className="marketplace-perk">
            <h4>Campus Perk</h4>
            <p>Verified students get insurance on all rentals automatically.</p>
            <button className="btn outline" style={{width: '100%'}} type="button">
              Learn More
            </button>
          </div>
        </aside>

        <div className="marketplace-main">
          <div className="marketplace-head">
            <div>
              <h2>Explore Listings</h2>
              <p>
                Find high-quality gear you need for your next project or weekend
                trip, shared by peers.
              </p>
            </div>
          </div>

          <div className="marketplace-grid">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="marketplace-card skeleton">
                    <div style={{ height: "170px" }}></div>
                    <div className="marketplace-card-body">
                      <div className="skeleton" style={{ height: "20px", width: "80%", marginBottom: "8px" }}></div>
                      <div className="skeleton" style={{ height: "16px", width: "50%" }}></div>
                      <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
                        <div className="skeleton" style={{ height: "24px", width: "30%" }}></div>
                        <div className="skeleton" style={{ height: "24px", width: "20%" }}></div>
                      </div>
                      <div className="marketplace-card-actions">
                        <div className="skeleton" style={{ height: "40px", borderRadius: "8px" }}></div>
                        <div className="skeleton" style={{ height: "40px", borderRadius: "8px" }}></div>
                      </div>
                    </div>
                  </div>
                ))
              : filteredAndSortedListings.length > 0 ? (
                  filteredAndSortedListings.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                    <h3>No listings found</h3>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Marketplace;
