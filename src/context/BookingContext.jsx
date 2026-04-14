import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { userBookings as seedBookings } from "../data/mockData.js";

const BookingContext = createContext(null);
const STORAGE_KEY = "campusRent_bookings";

const updateById = (items, id, updater) =>
  items.map((item) => (item.id === id ? updater(item) : item));

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    if (typeof window === "undefined") return seedBookings;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return seedBookings;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : seedBookings;
    } catch (err) {
      return seedBookings;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (err) {
      // Ignore storage write errors (e.g., private mode, quota exceeded)
    }
  }, [bookings]);

  const approveBooking = useCallback((id) => {
    setBookings((prev) =>
      updateById(prev, id, (booking) => ({ ...booking, status: BOOKING_STATUS.upcoming }))
    );
  }, []);

  const rejectBooking = useCallback((id) => {
    setBookings((prev) =>
      updateById(prev, id, (booking) => ({ ...booking, status: BOOKING_STATUS.rejected }))
    );
  }, []);

  const cancelBooking = useCallback((id) => {
    setBookings((prev) =>
      updateById(prev, id, (booking) => ({ ...booking, status: BOOKING_STATUS.cancelled }))
    );
  }, []);

  const markReturned = useCallback((id) => {
    setBookings((prev) =>
      updateById(prev, id, (booking) => ({ ...booking, status: BOOKING_STATUS.completed }))
    );
  }, []);

  const value = useMemo(
    () => ({
      bookings,
      approveBooking,
      rejectBooking,
      cancelBooking,
      markReturned,
      setBookings,
    }),
    [bookings, approveBooking, rejectBooking, cancelBooking, markReturned]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
