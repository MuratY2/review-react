import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useRive, Layout, Fit, Alignment } from 'rive-react';
import './AuthorApproval.css';

const AuthorApproval = () => {
  const [pendingAuthors, setPendingAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const { RiveComponent } = useRive({
    src: "/search.riv",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    const checkUserRole = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData && userData.role === 'admin') {
                setIsAdmin(true);
              } else {
                navigate('/');
              }
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        } else {
          navigate('/login');
        }
      });

      return () => unsubscribe();
    };

    checkUserRole();

    const fetchPendingAuthors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'authors_pending'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        const authorsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPendingAuthors(authorsData);
      } catch (error) {
        console.error('Error fetching pending authors:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchPendingAuthors();
  }, [isAdmin, navigate]);

  const approveAuthor = async (authorId) => {
    try {
      const authorRef = doc(db, 'authors_pending', authorId);
      await updateDoc(authorRef, { status: 'approved' });

      const userRef = doc(db, 'users', authorId);
      await updateDoc(userRef, { role: 'author' });

      alert('Author approved successfully.');
      setPendingAuthors((prevAuthors) => prevAuthors.filter((author) => author.id !== authorId));
    } catch (error) {
      console.error('Error approving author:', error);
      alert('Error approving the author.');
    }
  };

  const rejectAuthor = async (authorId) => {
    try {
      const authorRef = doc(db, 'authors_pending', authorId);
      await updateDoc(authorRef, { status: 'rejected' });

      alert('Author rejected.');
      setPendingAuthors((prevAuthors) => prevAuthors.filter((author) => author.id !== authorId));
    } catch (error) {
      console.error('Error rejecting author:', error);
      alert('Error rejecting the author.');
    }
  };

  if (!isAdmin) {
    return <p>You must be an admin to access this page.</p>;
  }

  return (
    <div className="approval-container">
      <h1 className="approval-title">Authors Pending Approval</h1>

      {loading ? (
        <p className="loading-message">Loading pending authors...</p>
      ) : (
        <div>
          {pendingAuthors.length > 0 ? (
            <div className="pending-authors-container">
              {pendingAuthors.map((author) => (
                <div key={author.id} className="author-card">
                  <img src={author.idImageUrl} alt={`${author.username}'s ID`} className="author-id-image" />
                  <h3 className="author-username">{author.username}</h3>
                  <p className="author-detail"><strong>Name Surname:</strong> {author.nameSurname}</p>
                  <p className="author-detail"><strong>Email:</strong> {author.email}</p>
                  <p className="author-detail"><strong>Bio:</strong> {author.bio}</p>
                  <p className="author-detail">
                    <strong>Website:</strong>{' '}
                    <a href={author.website} target="_blank" rel="noreferrer" className="author-website">
                      {author.website}
                    </a>
                  </p>
                  <div className="button-container">
                    <button className="approve-button" onClick={() => approveAuthor(author.id)}>
                      Approve
                    </button>
                    <button className="reject-button" onClick={() => rejectAuthor(author.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-authors-message">
              <div className="rive-container">
                <RiveComponent />
              </div>
              <h2>No Authors Available for Approval</h2>
              <p>It seems there are no authors waiting for approval at the moment. Please check back later!</p>
              <button className="back-button" onClick={() => navigate('/')}>
                Go to Home
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorApproval;
