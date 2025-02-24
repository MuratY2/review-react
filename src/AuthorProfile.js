import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { notification } from 'antd';
import './AuthorProfile.css';

const AuthorProfile = () => {
  const { authorId } = useParams();

  // Info from authors_pending doc
  const [authorDoc, setAuthorDoc] = useState(null);
  // All books that link to this author
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorAndBooks = async () => {
      setLoading(true);
      try {
        // 1. Get the doc from authors_pending where userId == authorId
        const authorsColRef = collection(db, 'authors_pending');
        const authorQuery = query(authorsColRef, where('userId', '==', authorId));
        const authorSnap = await getDocs(authorQuery);

        if (authorSnap.empty) {
          // No matching doc found
          setAuthorDoc(null);
          setBooks([]);
          setLoading(false);
          return;
        }

        // We’ll assume the first doc is the relevant one
        const docData = authorSnap.docs[0].data();

        // If the status isn't "approved," handle accordingly:
        if (docData.status !== 'approved') {
          setAuthorDoc(null);
          setBooks([]);
          setLoading(false);
          return;
        }

        setAuthorDoc(docData);

        // 2. Fetch all books that have linkedAuthorId == authorId
        const booksRef = collection(db, 'books_pending');
        const booksQuery = query(booksRef, where('linkedAuthorId', '==', authorId));
        const booksSnap = await getDocs(booksQuery);

        const foundBooks = booksSnap.docs.map((bDoc) => ({
          id: bDoc.id,
          ...bDoc.data(),
        }));

        setBooks(foundBooks);
      } catch (error) {
        console.error('Error fetching author:', error);
        notification.error({
          message: 'Error',
          description: 'Unable to load author data.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorAndBooks();
  }, [authorId]);

  if (loading) {
    return <div className="author-profile-container">Loading Author...</div>;
  }

  // If no doc found or doc not approved:
  if (!authorDoc) {
    return (
      <div className="author-profile-container">
        <h2>No Valid Author Found</h2>
        <p>
          We couldn’t find an approved author account for this user. 
        </p>
      </div>
    );
  }

  return (
    <div className="author-profile-container">
      <h2 className="author-name">{authorDoc.nameSurname}</h2>
      <div className="author-details">
        {authorDoc.bio && <p><strong>Bio:</strong> {authorDoc.bio}</p>}
        {authorDoc.website && (
          <p>
            <strong>Website:</strong>{' '}
            <a href={authorDoc.website} target="_blank" rel="noreferrer">
              {authorDoc.website}
            </a>
          </p>
        )}
        {authorDoc.email && <p><strong>Contact Email:</strong> {authorDoc.email}</p>}
      </div>

      <h3>Books by {authorDoc.nameSurname}</h3>
      {books.length > 0 ? (
        <div className="author-books-grid">
          {books.map((book) => (
            <Link to={`/bookdetail/${book.id}`} key={book.id} className="book-card">
              <div className="book-image">
                {book.isHot && <span className="hot-label">HOT</span>}
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                  />
                ) : (
                  <div className="placeholder-cover">No Cover</div>
                )}
              </div>
              <div className="book-info">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-author">By {book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No books linked to this author yet.</p>
      )}
    </div>
  );
};

export default AuthorProfile;
