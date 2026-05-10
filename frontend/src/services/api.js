const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_TOKEN_KEY = "campusRent_token";

const parseApiError = async (response) => {
  let message = `API Error: ${response.statusText}`;
  try {
    const body = await response.json();
    if (body?.message) {
      message = body.message;
    }
  } catch {
    // Ignore JSON parsing errors and keep status text fallback
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
};

export const api = {
  get: async (endpoint, signal) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  post: async (endpoint, data) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  delete: async (endpoint) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!response.ok) throw await parseApiError(response);
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

  uploadListingImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    const response = await fetch(`${API_BASE_URL}/listings/upload-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) throw await parseApiError(response);
    return response.json();
  },

  getMyBookings: async (signal) => {
    return api.get("/bookings/my-bookings", signal);
  },

  createBooking: async (payload) => {
    return api.post("/bookings", payload);
  },

  deleteListing: async (id) => {
    return api.delete(`/listings/${id}`);
  },

  signup: async (payload) => {
    return api.post("/auth/signup", payload);
  },

  login: async (payload) => {
    return api.post("/auth/login", payload);
  }
};
