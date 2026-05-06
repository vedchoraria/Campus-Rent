import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const ListingContext = createContext(null);

export function ListingProvider({ children }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapListing = (item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    pricePerDay: item.dailyRentalRate,
    securityDeposit: item.securityDeposit,
    mrp: item.retailPrice,
    location: item.preferredPickupZone,
    images: item.images && item.images.length > 0
      ? item.images.map((img) => img.imageUrl)
      : ["purple"],
    rating: item.owner?.lenderRating || 4.8,
    reviewsCount: item.owner?.ratingsCount || 0,
    isVerified: true,
    availability: item.status === 'active' ? 'Available Now' : 'Not Available',
    dateAdded: item.createdAt,
    isHidden: item.status !== 'active'
  });

  const refreshListings = async (signal) => {
    try {
      setIsLoading(true);
      const [globalRes, myRes] = await Promise.all([
        api.getListings(signal),
        user ? api.getMyListings(signal) : Promise.resolve({ data: [] })
      ]);

      const mappedGlobal = (globalRes.data || []).map(mapListing);
      const mappedMine = (myRes.data || []).map(mapListing);
      const combined = [...mappedGlobal, ...mappedMine];
      const deduplicated = Array.from(new Map(combined.map((item) => [item.id, item])).values());

      setListings(deduplicated);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("Failed to fetch live listings:", err);
      setListings([]);
      setError(err.message || "Failed to load live listings.");
    } finally {
      if (!signal || !signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    refreshListings(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [user]);

  const toggleHidden = (id) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHidden: !item.isHidden } : item
      )
    );
  };

  const deleteListing = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ListingContext.Provider value={{ listings, isLoading, error, toggleHidden, deleteListing, setListings, refreshListings }}>
      {children}
    </ListingContext.Provider>
  );
}

export const useListings = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error("useListings must be used within a ListingProvider");
  }
  return context;
};
