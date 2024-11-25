import React from 'react';
import './Contact.css';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="contact-container">
      {/* Map Section */}
      <div className="map-section">
        <iframe
          title="location-map"
          width="100%"
          height="400"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=29.22308567825108%2C41.01867857518434%2C29.24308567825108%2C41.03867857518434&amp;layer=mapnik&amp;marker=41.02867857518434%2C29.23308567825108"
        ></iframe>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="contact-info">
          <span className="get-in-touch">GET IN TOUCH</span>
          <h2>Don't Hesitate to contact with us for any inquiries.</h2>
          
          <div className="address">
            <h3>Çekmeköy, İstanbul</h3>
            <p>Nişantepe Mahallesi, Orman Sokak, 34794 Çekmeköy / İstanbul, Türkiye</p>
          </div>
          
          <div className="contact-details">
            <p className="phone">+34 22 125 456</p>
            <p className="email">info@authore.com</p>
          </div>
        </div>

        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Full Name"
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email Address"
              />
            </div>
            <div className="form-group">
              <textarea 
                placeholder="Message"
                rows="4"
              ></textarea>
            </div>
            <button type="submit">THANK YOU</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;