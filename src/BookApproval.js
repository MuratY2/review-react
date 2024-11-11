// File: src/BookApproval.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const BookApproval = () => {
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books_pending'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingBooks(booksData);
      } catch (error) {
        console.error("Error fetching pending books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBooks();
  }, []);

  const approveBook = async (bookId) => {
    try {
      const bookRef = doc(db, 'books_pending', bookId);
      await updateDoc(bookRef, { status: 'approved' });
      alert('Book approved successfully.');
      setPendingBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Error approving book:", error);
      alert('Error approving the book.');
    }
  };

  const rejectBook = async (bookId) => {
    try {
      const bookRef = doc(db, 'books_pending', bookId);
      await updateDoc(bookRef, { status: 'rejected' });
      alert('Book rejected.');
      setPendingBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Error rejecting book:", error);
      alert('Error rejecting the book.');
    }
  };

  return (
    <div>
      <h1>Books Pending Approval</h1>
      
      {loading ? (
        <p>Loading pending books...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
          {pendingBooks.length > 0 ? (
            pendingBooks.map((book) => (
              <div key={book.id} style={{ border: '1px solid #ccc', padding: '15px', width: '200px' }}>
                <img src={book.coverImageUrl} alt={`${book.title} cover`} style={{ width: '100%', height: 'auto' }} />
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p>{book.description}</p>
                <div>
                  <button onClick={() => approveBook(book.id)}>Approve</button>
                  <button onClick={() => rejectBook(book.id)}>Reject</button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending books.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookApproval;
