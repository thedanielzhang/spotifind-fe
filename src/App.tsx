import React from "react";
import "./App.css";
import "./floatingNotes.js";

export default function App() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-icon">🎵</div>
          <h1 className="hero-title">WhatsYourDisco SanFrancisco</h1>
          <p className="hero-subtitle">
            Print QR codes. Create geotagged playlists. Share your favorite songs. Turn our city into a dance floor.
          </p>
          <div className="hero-cta">
            <button className="cta-button primary">Get Started</button>
            <button className="cta-button secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-note">🎶</div>
          <div className="floating-note">🎤</div>
          <div className="floating-note">🎧</div>
          <div className="floating-note">🌉</div>
          <div className="floating-note">🎶</div>
          <div className="floating-note">🎤</div>
          <div className="floating-note">🎧</div>
          <div className="floating-note">🌉</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="features-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Geotag Playlists</h3>
              <p>Tag public, collaborative playlists to spots around the city with QR codes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Explore and Share</h3>
              <p>Find playlists in San Francisco and share your favorite songs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="contact-container">
          <div className="contact-card">
            <h2 className="contact-title">Join the Movement! 🕺</h2>
            <p className="contact-subtitle">Ready to turn San Francisco into your personal dance floor?</p>
            <form className="contact-form">
              <input
                type="email"
                placeholder="Your email address"
                className="form-input"
                required
              />
              <textarea
                placeholder="Tell us about your favorite SF spots and music taste..."
                rows={4}
                className="form-textarea"
                required
              />
              <button type="submit" className="form-button">
                Let's Dance! 💃
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          {/* <p>© {new Date().getFullYear()} WhatsYourDiscoSanFrancisco. All rights reserved.</p> */}
          <div className="footer-emoji">🌉</div>
        </div>
      </footer>
    </div>
  );
}
