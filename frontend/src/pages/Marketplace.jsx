import React, { useState, useEffect, useMemo, useRef } from "react";

const categories = [
  { name: "All" },
  { name: "Tech" },
  { name: "Books" },
  { name: "Adventure" },
  { name: "Sports" },
];

const locations = [
  "All Locations",
  "North Campus",
  "South Dorms",
  "Central Library",
  "Arts District",
];

const PAGE_SIZE = 8;

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
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { marketplaceListings, isLoading, error, pagination, refreshListings } = useListings();
  const { bookings } = useBookings();

  // Ref to skip the initial effect call since ListingContext already fetches on mount
  const initialFetchDone = useRef(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // When search, category, location, or page changes, re-fetch from backend with params
  // Skip the first call because ListingContext already fetches on mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      return;
    }

    const controller = new AbortController();
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeCategory !== "All") params.category = activeCategory;
    if (sortOption === "Price: Low to High") params.sortBy = "price_asc";
    else if (sortOption === "Rating") params.sortBy = "rating";
    if (activeLocation !== "All Locations") params.location = activeLocation;
    params.page = page;
    params.limit = PAGE_SIZE;

    refreshListings(controller.signal, params);
    return () => controller.abort();
  }, [debouncedSearch, activeCategory, activeLocation, page, sortOption, refreshListings]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory, activeLocation, sortOption]);

  // Apply ongoing booking overlays (sort and location filter are now server-side)
  const displayListings = useMemo(() => {
    const ongoingByItemId = bookings
      .filter((booking) =>
        [BOOKING_STATUS.itemGiven, BOOKING_STATUS.ongoing, BOOKING_STATUS.returnPending].includes(booking.status)
      )
      .reduce((acc, booking) => {
        const itemId = String(booking.itemId);
        const current = acc[itemId];
        if (!current || new Date(booking.end) > new Date(current.end)) {
          acc[itemId] = booking;
        }
        return acc;
      }, {});

    return marketplaceListings
      .filter(item => !item.isHidden)
      .map((item) => ({
        ...item,
        rentedUntil: ongoingByItemId[String(item.id)]?.end || null,
      }));
  }, [bookings, marketplaceListings]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const totalPages = pagination?.totalPages || 1;

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
              {error && (
                <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,0,0,0.1)', color: 'red', borderRadius: '6px', fontSize: '14px', fontWeight: '500' }}>
                  ⚠️ {error}
                </div>
              )}
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
              : displayListings.length > 0 ? (
                  displayListings.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                    <h3>No listings found</h3>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                )}
          </div>

          {/* Pagination Controls */}
          {pagination && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
              <button
                className="btn outline"
                style={{ padding: '8px 16px', fontSize: '14px' }}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Page {pagination.page} of {totalPages}
              </span>
              <button
                className="btn outline"
                style={{ padding: '8px 16px', fontSize: '14px' }}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Marketplace;
