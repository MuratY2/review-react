import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const EventApproval = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      const fetchPendingEvents = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, 'events_pending'), where('status', '==', 'pending'));
          const querySnapshot = await getDocs(q);
          const eventsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingEvents(eventsData);
        } catch (error) {
          console.error('Error fetching pending events:', error);
        }
        setLoading(false);
      };
      fetchPendingEvents();
    }
  }, [isAdmin]);

  const approveEvent = async (eventId) => {
    try {
      // Find the pending event data
      const event = pendingEvents.find(e => e.id === eventId);
      if (!event) return;
      // Remove the id field and set status to approved
      const { id, ...eventData } = event;
      eventData.status = 'approved';
      // Add the event to the approved events collection
      await addDoc(collection(db, 'events'), eventData);
      // Delete it from pending events
      await deleteDoc(doc(db, 'events_pending', eventId));
      alert('Event approved successfully.');
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Error approving the event.');
    }
  };

  const rejectEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events_pending', eventId));
      alert('Event rejected.');
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Error rejecting the event.');
    }
  };

  if (!isAdmin) {
    return <p>You must be an admin to access this page.</p>;
  }

  return (
    <div>
      <h1>Events Pending Approval</h1>
      {loading ? (
        <p>Loading pending events...</p>
      ) : (
        pendingEvents.length > 0 ? (
          pendingEvents.map(event => (
            <div key={event.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{event.title}</h3>
              <img src={event.image} alt={event.title} style={{ width: '100%', maxWidth: '400px' }} />
              <p>{event.description}</p>
              <div>
                <button onClick={() => rejectEvent(event.id)} style={{ marginRight: '10px' }}>Reject</button>
                <button onClick={() => approveEvent(event.id)} >Approve</button>

              </div>
            </div>
          ))
        ) : (
          <p>No events pending approval.</p>
        )
      )}
    </div>
  );
};

export default EventApproval;
