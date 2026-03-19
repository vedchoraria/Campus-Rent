import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Landing from "./pages/Landing.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import AddListing from "./pages/AddListing.jsx";
import Booking from "./pages/Booking.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  const location = useLocation();

  return (
    <div className="page">
      <Navbar />
      <main className="page-body">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/add" element={<AddListing />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;