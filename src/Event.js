import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import './Event.css';

const Event = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    imageFile: null,
  });

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      setLoadingEvents(true);
      try {
        const q = query(collection(db, 'events'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApprovedEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
      setLoadingEvents(false);
    };

    fetchApprovedEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (newEvent.imageFile) {
        const imageRef = ref(storage, `events/${newEvent.imageFile.name}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, newEvent.imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      await addDoc(collection(db, 'events_pending'), {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        image: imageUrl,
        status: 'pending',
        createdAt: new Date(),
      });
      alert('Event submitted for approval.');
      setNewEvent({
        title: '',
        description: '',
        date: '',
        imageFile: null,
      });
      setShowEventForm(false);
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Error submitting event.');
    }
  };

  const filteredEvents = approvedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Submit Event Section */}
        <div className="submit-event-section">
          <button className="submit-event-btn" onClick={() => setShowEventForm(!showEventForm)}>
            {showEventForm ? 'Cancel' : 'Post an Event'}
          </button>
          {showEventForm && (
            <form className="event-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Event Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                required
              ></textarea>
              <input
                type="text"
                placeholder="Event Date (e.g., SEPTEMBER 1)"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewEvent({ ...newEvent, imageFile: e.target.files[0] })
                }
                required
              />
              <button type="submit" className="submit-form-btn">Submit Event</button>
            </form>
          )}
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
          {loadingEvents ? (
            <p>Loading events...</p>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                  <div className="event-overlay">
                    <span className="event-date">{event.date}</span>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation Footer */}
        <div className="events-footer">
          <button className="nav-link">‹ PREVIOUS EVENTS</button>
          <div className="subscribe-dropdown">
            <button className="subscribe-btn">SUBSCRIBE TO CALENDAR</button>
            <div className="dropdown-content">
              <button onClick={() => console.log('Subscribing to google')}>Google Calendar</button>
              <button onClick={() => console.log('Subscribing to ical')}>iCalendar</button>
              <button onClick={() => console.log('Subscribing to outlook365')}>Outlook 365</button>
              <button onClick={() => console.log('Subscribing to outlooklive')}>Outlook Live</button>
              <button onClick={() => console.log('Subscribing to ics')}>Export .ics file</button>
              <button onClick={() => console.log('Subscribing to outlook-ics')}>Export Outlook .ics file</button>
            </div>
          </div>
          <button className="nav-link">NEXT EVENTS ›</button>
        </div>
      </div>
    </div>
  );
};

export default Event;
