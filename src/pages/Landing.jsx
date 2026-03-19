import React from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard.jsx";
import mockData from "../data/mockData.js";

function Landing() {
  return (
    <>
      <section id="home" className="hero">
        <div className="hero-content">
          <div className="pill">Exclusive to your student network</div>
          <h1>
            Rent From Peers,
            <span>Lend to Classmates.</span>
          </h1>
          <p className="subtext">
            CampusRent powers a trusted campus rental economy. Borrow what you
            need, earn from idle gear, and keep every exchange secure with
            verified profiles and escrow-backed payments.
          </p>
          <div className="hero-cta">
            <Link to="/marketplace" className="btn primary">
              Explore Marketplace
            </Link>
            <Link to="/add" className="btn secondary">
              Lend Your Gear
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatars">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="proof-text">Verified by university email</div>
          </div>
          <div className="hero-stats">
            <div>
              <strong>12k+</strong>
              <span>Active students</span>
            </div>
            <div>
              <strong>320+</strong>
              <span>Campus hubs</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="image-card large">
            <div className="image-tag">Campus Pickup</div>
            <div className="image-overlay">
              <h3>Study lounge delivery</h3>
              <p>Pickup windows coordinated with your schedule.</p>
            </div>
          </div>
          <div className="stack">
            <div className="glass-card">
              <div className="card-badge">University Hub</div>
              <h3>Find your campus circle</h3>
              <p>Instant access to verified listings nearby.</p>
            </div>
            <div className="glass-card mini">
              <div className="icon">DD</div>
              <div>
                <h4>Dorm-to-Dorm</h4>
                <p>Fast student handoffs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="marketplace">
        <div className="section-head">
          <p className="eyebrow">Why CampusRent</p>
          <h2>Everything you need to rent smarter</h2>
          <p>Built for campus speed, safety, and trust.</p>
        </div>
        <div className="grid three">
          <div className="feature-card">
            <div className="icon">UH</div>
            <h3>University Hub</h3>
            <p>Find listings and events tailored to your campus community.</p>
          </div>
          <div className="feature-card">
            <div className="icon">DD</div>
            <h3>Fast Dorm-to-Dorm Delivery</h3>
            <p>Schedule quick handoffs, lockers, or meetups around campus.</p>
          </div>
          <div className="feature-card">
            <div className="icon">VU</div>
            <h3>Verified Users</h3>
            <p>Student ID checks, peer reviews, and escrow-backed payments.</p>
          </div>
        </div>
      </section>

      <section className="seller" id="listing">
        <div className="seller-content">
          <h2>Got Gear Sitting in Your Dorm?</h2>
          <p>
            Turn extra items into earnings. Keep control with your own rates and
            availability while we handle payments and protection.
          </p>
          <ul className="benefits">
            <li>Earn money between classes</li>
            <li>Secure payments with escrow</li>
            <li>Low-friction listings in minutes</li>
            <li>Local pickup or delivery options</li>
          </ul>
          <button className="btn primary">List Your Gear</button>
        </div>
        <div className="seller-panel">
          <div className="panel-card">
            <h4>Weekly Payout</h4>
            <p>$156.40</p>
            <span>+24% this week</span>
          </div>
          <div className="panel-card">
            <h4>Booking Requests</h4>
            <p>18</p>
            <span>4 waiting approval</span>
          </div>
          <div className="panel-card">
            <h4>Top Category</h4>
            <p>Tech and Gadgets</p>
            <span>48 rentals</span>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="section-head row">
          <div>
            <p className="eyebrow">Curated collections</p>
            <h2>Study smarter, not harder</h2>
            <p>Explore what students are renting right now.</p>
          </div>
          <button className="btn ghost">View all categories</button>
        </div>
        <div className="grid three">
          <div className="category-card">
            <div className="icon">TG</div>
            <h3>Tech and Gadgets</h3>
            <p>Laptops, tablets, cameras, and headphones.</p>
          </div>
          <div className="category-card">
            <div className="icon">AG</div>
            <h3>Adventure Gear</h3>
            <p>Tents, climbing kits, bikes, and boards.</p>
          </div>
          <div className="category-card">
            <div className="icon">SM</div>
            <h3>Study Materials</h3>
            <p>Textbooks, calculators, and lab kits.</p>
          </div>
        </div>
      </section>

      <section className="listings">
        <div className="section-head">
          <p className="eyebrow">Fresh from the dorms</p>
          <h2>Featured listings</h2>
          <p>Highly rated gear from students you can trust.</p>
        </div>
        <div className="grid four">
          {mockData.slice(0, 4).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="trust" id="chat">
        <div className="trust-media"></div>
        <div className="trust-content">
          <p className="eyebrow">Built for the trusted campus circle</p>
          <h2>Every rental is protected from checkout to return</h2>
          <div className="trust-list">
            <div>
              <h3>Escrow Protection</h3>
              <p>Funds are held securely until both sides confirm pickup.</p>
            </div>
            <div>
              <h3>Secure Campus Chat</h3>
              <p>Coordinate meetups without sharing personal numbers.</p>
            </div>
            <div>
              <h3>Peer Ratings</h3>
              <p>Transparent reviews that reward reliable renters and lenders.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-card">
          <div>
            <h2>Ready to join your campus circle?</h2>
            <p>Sign up with your university email and start saving today.</p>
          </div>
          <div className="cta-form">
            <input type="email" placeholder="you@university.edu" />
            <button className="btn primary">Get Started</button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;