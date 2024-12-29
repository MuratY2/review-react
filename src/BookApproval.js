import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useRive, Layout, Fit, Alignment } from 'rive-react';
import './BookApproval.css';

const BookApproval = () => {
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const { RiveComponent } = useRive({
    src: '/nothing_found.riv',
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

    const fetchPendingBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books_pending'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        const booksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPendingBooks(booksData);
      } catch (error) {
        console.error('Error fetching pending books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchPendingBooks();
  }, [isAdmin, navigate]);

  const approveBook = async (bookId) => {
    try {
      const bookRef = doc(db, 'books_pending', bookId);
      await updateDoc(bookRef, { status: 'approved' });
      alert('Book approved successfully.');
      setPendingBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error('Error approving book:', error);
      alert('Error approving the book.');
    }
  };

  const rejectBook = async (bookId) => {
    try {
      const bookRef = doc(db, 'books_pending', bookId);
      await updateDoc(bookRef, { status: 'rejected' });
      alert('Book rejected.');
      setPendingBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error('Error rejecting book:', error);
      alert('Error rejecting the book.');
    }
  };

  if (!isAdmin) {
    return <p>You must be an admin to access this page.</p>;
  }

  return (
    <div className="approval-container">
      <h1 className="approval-title">Books Pending Approval</h1>

      {loading ? (
        <p className="loading-message">Loading pending books...</p>
      ) : (
        <div>
          {pendingBooks.length > 0 ? (
            <div className="pending-books-container">
              {pendingBooks.map((book) => (
                <div key={book.id} className="book-card">
                  <img
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">
                    <strong>Author:</strong> {book.author}
                  </p>
                  <p className="book-description">{book.description}</p>

                  {/* NEW: Show PDF if available */}
                  {book.pdfUrl && (
                    <div className="pdf-preview">
                      <p>
                        <strong>PDF Preview:</strong>
                      </p>

                      <iframe
                        src={book.pdfUrl}
                        title="PDF Preview"
                        width="100%"
                        height="400px"
                      ></iframe>
                    </div>
                  )}

                  <div className="button-container">
                    <button className="approve-button" onClick={() => approveBook(book.id)}>
                      Approve
                    </button>
                    <button className="reject-button" onClick={() => rejectBook(book.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-books-message">
              <div className="rive-container">
                <RiveComponent />
              </div>
              <h2>No Books Available for Approval</h2>
              <p>
                It seems there are no books waiting for approval at the moment. Please check
                back later!
              </p>
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

export default BookApproval;
