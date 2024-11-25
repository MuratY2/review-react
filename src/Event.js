import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './Event.css';

const Event = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');

  const events = [
    {
      id: 1,
      date: 'SEPTEMBER 1',
      title: 'Authors Discuss Their Year In Reading',
      image: 'https://images.pexels.com/photos/4132936/pexels-photo-4132936.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      date: 'SEPTEMBER 1',
      title: '40 Popular Narrative Nonfiction Books',
      image: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 3,
      date: 'SEPTEMBER 1',
      title: 'Teen Reading Festival At Roma',
      image: 'https://images.pexels.com/photos/3494806/pexels-photo-3494806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 4,
      date: 'SEPTEMBER 1',
      title: 'Janice Hallett And Cara Hunter In Conversation',
      image: 'https://images.pexels.com/photos/3556533/pexels-photo-3556533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 5,
      date: 'SEPTEMBER 1',
      title: 'Meet Bonnie Tyler – Straight From The Heart',
      image: 'https://images.pexels.com/photos/1194399/pexels-photo-1194399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 6,
      date: 'SEPTEMBER 1',
      title: 'Jimmy Fallon Discusses Nana His Newest Childrens Book.',
      image: 'https://images.pexels.com/photos/3409497/pexels-photo-3409497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  const handleSubscribe = (type) => {
    console.log(`Subscribing to ${type}`);
  };

  return (
    <div className="events-container">
      {/* Header */}
      <div className="events-header">
        <div className="events-header-content">
          <h1>Events</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">›</span>
            <Link to="/">Event</Link>
          </div>
        </div>
      </div>

      <div className="events-main-content">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-box">
              <span role="img" aria-label="search" className="search-icon">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search for events"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="find-events-btn">FIND EVENTS</button>
          </div>
          <div className="view-options">
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button 
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              Day
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="events-navigation">
          <button className="nav-btn" aria-label="Previous">‹</button>
          <button className="today-btn">Today</button>
          <button className="upcoming-btn">UPCOMING</button>
          <button className="nav-btn" aria-label="Next">›</button>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                <div className="event-overlay">
                  <span className="event-date">{event.date}</span>
                  <h3 className="event-title">{event.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="events-footer">
          <button className="nav-link">‹ PREVIOUS EVENTS</button>
          <div className="subscribe-dropdown">
            <button className="subscribe-btn">SUBSCRIBE TO CALENDAR</button>
            <div className="dropdown-content">
              <button onClick={() => handleSubscribe('google')}>Google Calendar</button>
              <button onClick={() => handleSubscribe('ical')}>iCalendar</button>
              <button onClick={() => handleSubscribe('outlook365')}>Outlook 365</button>
              <button onClick={() => handleSubscribe('outlooklive')}>Outlook Live</button>
              <button onClick={() => handleSubscribe('ics')}>Export .ics file</button>
              <button onClick={() => handleSubscribe('outlook-ics')}>Export Outlook .ics file</button>
            </div>
          </div>
          <button className="nav-link">NEXT EVENTS ›</button>
        </div>
      </div>
    </div>
  );
};

export default Event;