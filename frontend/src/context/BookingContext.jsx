import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { userBookings as seedBookings } from "../data/mockData.js";
import { api } from "../services/api.js";

const BookingContext = createContext(null);
const STORAGE_KEY = "campusRent_bookings";

const normalizeList = (items) => (Array.isArray(items) ? items : []);

const dedupeBookings = (items) => {
  const byId = new Map();
  normalizeList(items).forEach((booking) => {
    const key = String(booking?.id || "");
    if (!key) return;
    byId.set(key, booking);
  });
  return Array.from(byId.values());
};

const updateBookingStatus = (items, id, status, extra = {}) => {
  const targetId = String(id);
  let wasUpdated = false;
  const next = normalizeList(items).map((booking) => {
    if (String(booking.id) !== targetId) return booking;
    wasUpdated = true;
    return { ...booking, status, ...extra };
  });
  return wasUpdated ? next : items;
};

const hasDateOverlap = (startA, endA, startB, endB) => {
  const aStart = new Date(startA);
  const aEnd = new Date(endA);
  const bStart = new Date(startB);
  const bEnd = new Date(endB);
  if ([aStart, aEnd, bStart, bEnd].some((date) => Number.isNaN(date.getTime()))) {
    return false;
  }
  return aStart <= bEnd && bStart <= aEnd;
};

export function BookingProvider({ children }) {
  const [bookings, setRawBookings] = useState(() => {
    if (typeof window === "undefined") return seedBookings;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return dedupeBookings(seedBookings);
      const parsed = JSON.parse(saved);
      return dedupeBookings(Array.isArray(parsed) ? parsed : seedBookings);
    } catch (err) {
      return dedupeBookings(seedBookings);
    }
  });

  // Fetch live backend data to synchronize BookingContext
  useEffect(() => {
    const controller = new AbortController();

    const fetchBookings = async () => {
      try {
        const res = await api.getMyBookings(controller.signal);
        if (res.success && res.data) {
          
          const mapBooking = (b) => ({
            id: String(b.id),
            itemId: String(b.listingId),
            title: b.listing?.title || "Item",
            image: b.listing?.images?.[0]?.imageUrl || b.listing?.imageClass || "teal",
            start: b.startDate,
            end: b.endDate,
            requester: b.borrower?.fullName || "Student",
            submittedAt: b.createdAt,
            rentalAmount: b.totalPriceSnapshot,
            depositAmount: b.securityDepositSnapshot,
            totalAmount: (b.totalPriceSnapshot || 0) + (b.securityDepositSnapshot || 0),
            status: b.status,
            cancelledBy: b.cancelledBy?.fullName || null,
            cancelledAt: b.cancelledAt,
            returnedAt: b.returnedAt
          });

          // Combine the separated backend arrays into the local legacy flat array
          const borrowings = (res.data.borrowings || []).map(mapBooking);
          const lending = (res.data.lending || []).map(mapBooking);
          
          setRawBookings([...borrowings, ...lending]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Booking API sync failed. Falling back to localStorage.", err);
        }
      }
    };

    fetchBookings();

    return () => controller.abort();
  }, []);

  // Sync to localStorage as fallback cache
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (err) {
      // Ignore storage write errors (e.g., private mode, quota exceeded)
    }
  }, [bookings]);

  const setBookings = useCallback((nextOrUpdater) => {
    setRawBookings((prev) => {
      const next =
        typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      return dedupeBookings(next);
    });
  }, []);

  const createBooking = useCallback((incomingBooking) => {
    const normalizedBooking = {
      ...incomingBooking,
      id: String(incomingBooking.id),
      requestKey: incomingBooking.requestKey || null,
    };

    setRawBookings((prev) => {
      const deduped = dedupeBookings(prev);
      const duplicateById = deduped.some(
        (booking) => String(booking.id) === normalizedBooking.id
      );

      const duplicateByRequestKey =
        normalizedBooking.requestKey &&
        deduped.some(
          (booking) =>
            booking.requestKey &&
            String(booking.requestKey) === String(normalizedBooking.requestKey)
        );

      if (duplicateById || duplicateByRequestKey) {
        return deduped;
      }

      return [...deduped, normalizedBooking];
    });
  }, []);

  const approveBooking = useCallback((id) => {
    setRawBookings((prev) => {
      const targetId = String(id);
      const targetBooking = prev.find((booking) => String(booking.id) === targetId);
      if (!targetBooking) return prev;

      const hasConflict = prev.some((booking) => {
        if (String(booking.id) === targetId) return false;
        if (String(booking.itemId) !== String(targetBooking.itemId)) return false;
        if (
          booking.status !== BOOKING_STATUS.upcoming &&
          booking.status !== BOOKING_STATUS.ongoing
        ) {
          return false;
        }
        return hasDateOverlap(
          targetBooking.start,
          targetBooking.end,
          booking.start,
          booking.end
        );
      });

      if (hasConflict) {
        if (typeof window !== "undefined") {
          window.alert("Cannot approve: dates overlap with existing confirmed booking");
        }
        return prev;
      }

      return dedupeBookings(updateBookingStatus(prev, id, BOOKING_STATUS.upcoming));
    });
  }, []);

  const rejectBooking = useCallback((id) => {
    setRawBookings((prev) =>
      dedupeBookings(updateBookingStatus(prev, id, BOOKING_STATUS.rejected))
    );
  }, []);

  const cancelBooking = useCallback((id, cancelledBy = "borrower") => {
    setRawBookings((prev) =>
      dedupeBookings(
        updateBookingStatus(prev, id, BOOKING_STATUS.cancelled, {
          cancelledBy,
          cancelledAt: new Date().toISOString(),
        })
      )
    );
  }, []);

  const markReturned = useCallback((id) => {
    setRawBookings((prev) =>
      dedupeBookings(updateBookingStatus(prev, id, BOOKING_STATUS.completed))
    );
  }, []);

  const value = useMemo(
    () => ({
      bookings,
      createBooking,
      approveBooking,
      rejectBooking,
      cancelBooking,
      markReturned,
      setBookings,
    }),
    [bookings, createBooking, approveBooking, rejectBooking, cancelBooking, markReturned, setBookings]
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
