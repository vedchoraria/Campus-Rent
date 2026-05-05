const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  get: async (endpoint, signal) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  // Dedicated API helpers
  getListings: async (signal) => {
    return api.get("/listings", signal);
  },

  getListingById: async (id, signal) => {
    return api.get(`/listings/${id}`, signal);
  },

  getMyListings: async (signal) => {
    return api.get("/listings/my-listings", signal);
  },

  createListing: async (payload) => {
    return api.post("/listings", payload);
  },

  getMyBookings: async (signal) => {
    return api.get("/bookings/my-bookings", signal);
  }
};
