import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

const AuthorApproval = () => {
  const [pendingAuthors, setPendingAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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
    <div>
      <h1>Authors Pending Approval</h1>

      {loading ? (
        <p>Loading pending authors...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
          {pendingAuthors.length > 0 ? (
            pendingAuthors.map((author) => (
              <div key={author.id} style={{ border: '1px solid #ccc', padding: '15px', width: '300px' }}>
                <img src={author.idImageUrl} alt={`${author.username}'s ID`} style={{ width: '100%', height: 'auto' }} />
                <h3>{author.username}</h3>
                <p>
                  <strong>Name Surname:</strong> {author.nameSurname}
                </p>
                <p>
                  <strong>Email:</strong> {author.email}
                </p>
                <p>
                  <strong>Bio:</strong> {author.bio}
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a href={author.website} target="_blank" rel="noreferrer">
                    {author.website}
                  </a>
                </p>
                <div>
                  <button onClick={() => approveAuthor(author.id)}>Approve</button>
                  <button onClick={() => rejectAuthor(author.id)}>Reject</button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending authors.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorApproval;
