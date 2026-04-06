import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Landing from "./pages/Landing.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import AddListing from "./pages/AddListing.jsx";
import Booking from "./pages/Booking.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Requests from "./pages/Requests.jsx";
import MyListings from "./pages/MyListings.jsx";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();

  return (
    <div className="page">
      <Navbar />
      <main className="page-body">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/item/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/user/:id" element={<Profile />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
              <Route path="profile" element={<Profile />} />
              <Route path="rentals" element={<MyBookings />} />
              <Route path="listings" element={<MyListings />} />
              <Route path="requests" element={<Requests />} />
            </Route>
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;