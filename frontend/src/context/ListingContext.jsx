import React, { createContext, useContext, useState, useEffect } from "react";
import mockData from "../data/mockData.js";

const ListingContext = createContext(null);
const STORAGE_KEY = "campusRent_listings";

export function ListingProvider({ children }) {
  const [listings, setListings] = useState(() => {
    if (typeof window === "undefined") return mockData.map(item => ({ ...item, isHidden: false }));
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return mockData.map(item => ({ ...item, isHidden: false }));
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {}
  }, [listings]);

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
    <ListingContext.Provider value={{ listings, toggleHidden, deleteListing, setListings }}>
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
