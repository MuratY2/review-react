import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Rate, Input, Button, List, Avatar, notification } from 'antd';
import './BookDetail.css';

const { TextArea } = Input;

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const bookRef = doc(db, 'books_pending', bookId);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          const bookData = bookSnap.data();
          setBook({ id: bookSnap.id, ...bookData });
          setAverageRating(bookData.averageRating || 0);
        } else {
          console.error('No such book found!');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, 'books_pending', bookId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });

      return () => unsubscribe();
    };

    fetchComments();
  }, [bookId]);

  const handleRating = async (value) => {
    // ... (unchanged)
  };

  const handleAddComment = async () => {
    // ... (unchanged)
  };

  if (loading) {
    return <p>Loading book details...</p>;
  }

  if (!book) {
    return <p>Book not found.</p>;
  }

  return (
    <div className="book-detail-container">
      <div className="book-detail">
        <div className="book-image">
          <img src={book.coverImageUrl} alt={`${book.title} cover`} />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">
            <strong>Author:</strong> {book.author}
          </p>
          <p className="book-description">
            <strong>Description:</strong> {book.description}
          </p>
          <p className="book-category">
            <strong>Category:</strong> {book.category}
          </p>

          <div className="rating-section">
            <h3>Average Rating: {averageRating.toFixed(1)}</h3>
            <Rate value={rating} onChange={handleRating} />
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{comment.userName[0]}</Avatar>}
                  title={comment.userName}
                  description={comment.content}
                />
              </List.Item>
            )}
          />
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {user && (
          <div className="add-comment">
            <TextArea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <Button
              type="primary"
              onClick={handleAddComment}
              loading={loadingComment}
              style={{ marginTop: '10px' }}
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;