import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { notification, List } from 'antd';
import './AuthorProfile.css';

const AuthorProfile = () => {
  const { authorId } = useParams();
  const [authorData, setAuthorData] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validAuthor, setValidAuthor] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      setLoading(true);
      try {
        const authorRef = doc(db, 'users', authorId);
        const authorSnap = await getDoc(authorRef);

        if (!authorSnap.exists()) {
          setValidAuthor(false);
          setLoading(false);
          return;
        }

        const data = authorSnap.data();
        if (data.role !== 'author') {
          setValidAuthor(false);
          setLoading(false);
          return;
        }

        setAuthorData(data);

        // Now fetch all books linked to this author
        const booksRef = collection(db, 'books_pending');
        const q = query(booksRef, where('linkedAuthorId', '==', authorId));
        const querySnapshot = await getDocs(q);
        const bookList = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setBooks(bookList);
      } catch (error) {
        console.error('Error fetching author data:', error);
        notification.error({
          message: 'Error',
          description: 'Unable to fetch author data.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [authorId]);

  if (loading) {
    return <div className="author-profile-container">Loading Author...</div>;
  }

  if (!validAuthor) {
    return (
      <div className="author-profile-container">
        <h2>No Valid Author Found</h2>
        <p>This user either does not exist or is not an author.</p>
      </div>
    );
  }

  return (
    <div className="author-profile-container">
      <h2>Author Profile</h2>
      <div className="author-info">
        <p><strong>Name:</strong> {authorData?.displayName || 'Unknown'}</p>
        <p><strong>Email:</strong> {authorData?.email || 'No public email'}</p>
        {/* You can add more fields if you store them in 'users' collection, e.g. biography, website, etc. */}
      </div>

      <div className="books-by-author">
        <h3>Books by this Author</h3>
        {books.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={books}
            renderItem={(bookItem) => (
              <List.Item>
                <List.Item.Meta
                  title={bookItem.title}
                  description={bookItem.description}
                />
              </List.Item>
            )}
          />
        ) : (
          <p>No books are currently linked to this author.</p>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
