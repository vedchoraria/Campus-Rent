import React, { useMemo, useState } from "react";

const steps = ["Item Info", "Pricing Info", "Visual Showcase"];

const conditionOptions = [
  {
    value: "new",
    title: "New",
    desc: "Never used, original packaging",
  },
  {
    value: "like-new",
    title: "Like New",
    desc: "Minimal wear, perfectly functional",
  },
  {
    value: "good",
    title: "Good",
    desc: "Minor scratches, well maintained",
  },
  {
    value: "fair",
    title: "Fair",
    desc: "Clear signs of use, works fine",
  },
];

const photoTips = [
  {
    title: "Use natural light",
    desc: "Take photos near a window for the best clarity.",
  },
  {
    title: "Show all angles",
    desc: "Capture the front, back, and any unique features.",
  },
  {
    title: "Highlight wear",
    desc: "Be transparent about any scratches or minor issues.",
  },
  {
    title: "Clean background",
    desc: "A neutral background makes your gear pop.",
  },
];

const pricingTips = [
  {
    title: "The Weekend Special",
    desc: "Many students rent for projects. A 3-day rate attracts more serious renters.",
  },
  {
    title: "Lower Price, Faster Match",
    desc: "Listings priced slightly below average gain reviews faster and earn more.",
  },
  {
    title: "Friend of a Friend",
    desc: "Offer student group discounts to build trust and repeat rentals.",
  },
];

function AddListing() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    condition: "new",
    rate: "",
    deposit: "",
    pickup: "",
    period: "3 Days",
  });

  const progress = useMemo(() => {
    if (steps.length <= 1) return "0%";
    return `${(step / steps.length) * 100}%`;
  }, [step]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <section className="listing-flow">
      <div className="listing-banner">
        <div className="listing-banner-content">
          <span className="listing-banner-icon">V</span>
          <div>
            <strong>Verify your .edu email</strong>
            <p>Verified students get 2x more rental requests.</p>
          </div>
        </div>
        <button className="btn primary" type="button">
          Verify Now
        </button>
      </div>

      <div className="listing-header">
        <div>
          <h2>List Your Gear</h2>
          <p>Share your items with the campus community.</p>
        </div>
        <span className="listing-step">Step {step} of {steps.length}</span>
      </div>

      <div className="listing-progress">
        <div className="listing-progress-bar">
          <span className="listing-progress-fill" style={{ width: progress }} />
        </div>
        <div className="listing-progress-labels">
          {steps.map((label, index) => (
            <span
              key={label}
              className={
                index + 1 === step ? "active" : index + 1 < step ? "complete" : ""
              }
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="listing-grid">
          <div className="listing-column">
            <div className="listing-card">
              <div className="listing-card-head">
                <span className="listing-card-icon">i</span>
                <div>
                  <h3>Core Details</h3>
                  <p>Tell renters the basics so they can decide quickly.</p>
                </div>
              </div>
              <div className="listing-field">
                <label>Item Title</label>
                <input
                  className="listing-input-field"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g., MacBook Pro M2 Space Gray"
                />
              </div>
              <div className="listing-field">
                <label>Category</label>
                <button type="button" className="listing-select">
                  {form.category || "Select a category"}
                </button>
              </div>
              <div className="listing-field">
                <label>Detailed Description</label>
                <textarea
                  className="listing-textarea"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Tell potential borrowers about the specs, age, and why it is great."
                  rows={4}
                />
              </div>
            </div>

            <div className="listing-card">
              <div className="listing-card-head">
                <span className="listing-card-icon">c</span>
                <div>
                  <h3>Condition</h3>
                  <p>Select the condition that best matches your item.</p>
                </div>
              </div>
              <div className="listing-condition-grid">
                {conditionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`listing-condition ${
                      form.condition === option.value ? "active" : ""
                    }`}
                    onClick={() => updateField("condition", option.value)}
                  >
                    <strong>{option.title}</strong>
                    <span>{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="listing-actions">
              <button type="button" className="btn secondary">
                Save Draft
              </button>
              <div className="listing-actions-right">
                <button type="button" className="btn primary" onClick={goNext}>
                  Continue to Pricing
                </button>
              </div>
            </div>
          </div>

          <aside className="listing-side">
            <div className="listing-side-card highlight">
              <span className="listing-side-icon">S</span>
              <div>
                <strong>Student Verified</strong>
                <p>
                  Listing as a verified student increases trust by 40% in our
                  community.
                </p>
              </div>
            </div>

            <div className="listing-side-card">
              <h4>Tips for a Great Listing</h4>
              <div className="listing-tip-list">
                <div className="listing-tip">
                  <span>1</span>
                  <div>
                    <strong>Be descriptive</strong>
                    <p>Specify model numbers, colors, and included accessories.</p>
                  </div>
                </div>
                <div className="listing-tip">
                  <span>2</span>
                  <div>
                    <strong>Mention any flaws</strong>
                    <p>Honesty builds long-term ratings. Note scratches or quirks.</p>
                  </div>
                </div>
                <div className="listing-tip">
                  <span>3</span>
                  <div>
                    <strong>Next step: Photos</strong>
                    <p>High-res shots from 4 angles work best.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="listing-side-card preview">
              <div className="listing-preview-tag">Live Preview</div>
              <div className="listing-preview-image" />
              <div className="listing-preview-lines">
                <span />
                <span />
              </div>
            </div>
          </aside>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="listing-card">
            <div className="listing-card-head">
              <span className="listing-card-icon">P</span>
              <div>
                <h3>Pricing & Location</h3>
                <p>Set your rate, deposit, and meetup spot.</p>
              </div>
            </div>

            <div className="listing-form-grid">
              <div>
                <label>Daily Rental Rate</label>
                <div className="listing-input">
                  <span>$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={form.rate}
                    onChange={(event) => updateField("rate", event.target.value)}
                  />
                </div>
                <small>Student tip: $10-$15/day works best for tech gear.</small>
              </div>
              <div>
                <label>Security Deposit</label>
                <div className="listing-input">
                  <span>$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={form.deposit}
                    onChange={(event) => updateField("deposit", event.target.value)}
                  />
                </div>
                <small>Fully refundable if item returns in original condition.</small>
              </div>
            </div>

            <div className="listing-field">
              <label>Preferred Pickup Spot</label>
              <button type="button" className="listing-select">
                {form.pickup || "Select a campus landmark..."}
              </button>
              <small>Choose a well-lit, busy area for a safe exchange.</small>
            </div>

            <div className="listing-field">
              <label>Minimum Rental Period</label>
              <div className="listing-pill-group">
                {["1 Day", "3 Days", "1 Week", "Flexible"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`listing-pill ${
                      form.period === label ? "active" : ""
                    }`}
                    onClick={() => updateField("period", label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="listing-notice">
              <span className="listing-notice-icon">!</span>
              <div>
                <strong>Protected by Campus Guarantee</strong>
                <p>
                  Every rental includes $500 damage protection and automated late
                  return fees for your peace of mind.
                </p>
              </div>
            </div>
          </div>

          <div className="listing-actions">
            <button type="button" className="btn ghost" onClick={goBack}>
              Back to Item Info
            </button>
            <div className="listing-actions-right">
              <button type="button" className="btn secondary">
                Save Draft
              </button>
              <button type="button" className="btn primary" onClick={goNext}>
                Continue to Photos
              </button>
            </div>
          </div>

          <div className="listing-bottom">
            <div className="listing-tip-card">
              <h4>Pricing for your peers</h4>
              <ul>
                {pricingTips.map((tip) => (
                  <li key={tip.title}>
                    <strong>{tip.title}</strong>
                    <span>{tip.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="listing-illustration">
              <div className="listing-illustration-body">
                <div className="listing-illustration-circle" />
                <p>Join 2,400+ students already earning on campus.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="listing-grid">
          <div className="listing-column">
            <div className="listing-card">
              <div className="listing-card-head">
                <span className="listing-card-icon">V</span>
                <div>
                  <h3>Visual Showcase</h3>
                  <p>High-quality photos build trust and improve conversions.</p>
                </div>
              </div>
              <div className="listing-upload">
                <div className="listing-upload-icon">+</div>
                <div>
                  <strong>Drag and drop photos here</strong>
                  <p>Support JPG or PNG up to 10MB</p>
                </div>
                <button type="button" className="btn primary">
                  Select Files
                </button>
              </div>
              <div className="listing-upload-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="listing-upload-tile">
                    <span>IMG</span>
                  </div>
                ))}
              </div>
              <div className="listing-verify">
                <div className="listing-verify-icon">S</div>
                <div>
                  <strong>Student Verification</strong>
                  <p>
                    We verify that gear photos match your description so rentals
                    stay safe.
                  </p>
                </div>
              </div>
            </div>

            <div className="listing-actions">
              <button type="button" className="btn ghost" onClick={goBack}>
                Back to Pricing
              </button>
              <div className="listing-actions-right">
                <button type="button" className="btn primary">
                  Publish Listing
                </button>
              </div>
            </div>
          </div>

          <aside className="listing-side">
            <div className="listing-side-card">
              <h4>Photo Tips</h4>
              <div className="listing-tip-list">
                {photoTips.map((tip, index) => (
                  <div key={tip.title} className="listing-tip">
                    <span>{index + 1}</span>
                    <div>
                      <strong>{tip.title}</strong>
                      <p>{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="listing-side-card highlight">
              <span className="listing-side-icon">V</span>
              <div>
                <strong>Verified Student Listing</strong>
                <p>Badges increase visibility for campus renters.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default AddListing;
