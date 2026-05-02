import React, { createContext, useContext, useState, useEffect } from "react";
import mockData from "../data/mockData.js";
import { api } from "../services/api.js";

const ListingContext = createContext(null);
const STORAGE_KEY = "campusRent_listings";

export function ListingProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We use an AbortController for safe async cleanup so state isn't updated if the component unmounts
    const abortController = new AbortController();

    const fetchListings = async () => {
      try {
        setIsLoading(true);
        // Call our dedicated API helper, passing the signal
        const response = await api.getListings(abortController.signal);
        
        // Map backend schema (dailyRentalRate, owner nested object) 
        // back to frontend schema (pricePerDay, rating) so the UI doesn't break
        const mappedData = response.data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          pricePerDay: item.dailyRentalRate,
          securityDeposit: item.securityDeposit,
          mrp: item.retailPrice,
          location: item.preferredPickupZone,
          // Extract just the image URLs like the frontend expects
          images: item.images && item.images.length > 0 
            ? item.images.map(img => img.imageUrl) 
            : ["purple"], 
          rating: item.owner?.lenderRating || 4.8,
          reviewsCount: item.owner?.ratingsCount || 0,
          isVerified: true, 
          availability: item.status === 'active' ? 'Available Now' : 'Not Available',
          dateAdded: item.createdAt,
          isHidden: item.status !== 'active'
        }));
        
        setListings(mappedData);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return; // Ignore aborts
        
        console.error("Failed to fetch live listings, falling back to mockData:", err);
        // Preserve mockData temporarily for debugging/rollback safety
        setListings(mockData.map(item => ({ ...item, isHidden: false })));
        setError(err.message || "Failed to load live data. Displaying cached data.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      // Cleanup function to abort fetch if component unmounts
      abortController.abort();
    };
  }, []);

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
    <ListingContext.Provider value={{ listings, isLoading, error, toggleHidden, deleteListing, setListings }}>
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
