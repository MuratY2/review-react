import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* About Section */}
        <div className="footer-section">
          <h4>About Us</h4>
          <p>
            We bring books closer to you. Discover, read, and share your favorite books with a growing community of book lovers.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/books">Books</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/event">Events</a></li>
          </ul>
        </div>

        {/* Email Section */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Have questions or need help? Reach out to us:</p>
          <p>Email: <a href="mailto:support@authorfactory.com">support@authorfactory.com</a></p>
        </div>

        {/* Follow Us Section */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AuthorFactory. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
