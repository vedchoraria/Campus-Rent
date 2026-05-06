import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BOOKING_STATUS } from "../constants/bookingStatus.js";
import { api } from "../services/api.js";

const BookingContext = createContext(null);

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
  const [bookings, setRawBookings] = useState([]);

  const refreshBookings = useCallback(async (signal) => {
    try {
      const res = await api.getMyBookings(signal);
      if (res.success && res.data) {
        const mapBooking = (b) => ({
          id: String(b.id),
          itemId: String(b.listingId),
          title: b.listing?.title || "Item",
          image: b.listing?.images?.[0]?.imageUrl || "teal",
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

        const borrowings = (res.data.borrowings || []).map(mapBooking);
        const lending = (res.data.lending || []).map(mapBooking);

        setRawBookings([...borrowings, ...lending]);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Booking API sync failed.", err);
      }
    }
  }, []);

  // Fetch live backend data to synchronize BookingContext
  useEffect(() => {
    const controller = new AbortController();
    refreshBookings(controller.signal);
    return () => controller.abort();
  }, [refreshBookings]);

  const setBookings = useCallback((nextOrUpdater) => {
    setRawBookings((prev) => {
      const next =
        typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;
      return dedupeBookings(next);
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
      approveBooking,
      rejectBooking,
      cancelBooking,
      markReturned,
      setBookings,
      refreshBookings,
    }),
    [bookings, approveBooking, rejectBooking, cancelBooking, markReturned, setBookings, refreshBookings]
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
