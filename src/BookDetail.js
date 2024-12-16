import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
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
  const [questions, setQuestions] = useState([]); 
  const [newQuestion, setNewQuestion] = useState(''); 

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsRef = collection(db, 'books_pending', bookId, 'questions');
      const q = query(questionsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const questionsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(questionsData);
      });

      return () => unsubscribe();
    };

    fetchQuestions();
  }, [bookId]);

  const handleRating = async (value) => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in to rate the book.',
      });
      return;
    }

    try {
      const bookRef = doc(db, 'books_pending', bookId);
      const userRatingRef = doc(collection(db, 'books_pending', bookId, 'ratings'), user.uid);
      const userRatingSnap = await getDoc(userRatingRef);

      const bookSnap = await getDoc(bookRef);
      if (!bookSnap.exists()) {
        notification.error({
          message: 'Error',
          description: 'Book not found.',
        });
        return;
      }

      const bookData = bookSnap.data();
      let { totalRating = 0, numberOfRatings = 0 } = bookData;

      if (userRatingSnap.exists()) {
        const previousRating = userRatingSnap.data().rating;
        totalRating = totalRating - previousRating + value;

        await updateDoc(userRatingRef, { rating: value });
        notification.success({
          message: 'Rating Updated',
          description: `Your rating for "${book.title}" has been updated to ${value} stars.`,
        });
      } else {
        totalRating += value;
        numberOfRatings++;

        await addDoc(userRatingRef, { rating: value });
        notification.success({
          message: 'Rating Submitted',
          description: `You rated "${book.title}" ${value} stars.`,
        });
      }

      const newAverageRating = totalRating / numberOfRatings;

      await updateDoc(bookRef, {
        totalRating,
        numberOfRatings,
        averageRating: newAverageRating,
      });

      setRating(value);
      setAverageRating(newAverageRating);
    } catch (error) {
      console.error('Error submitting rating:', error);
      notification.error({
        message: 'Error',
        description: 'There was an issue submitting your rating. Please try again.',
      });
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in to add a comment.',
      });
      return;
    }

    if (!newComment.trim()) {
      notification.warning({
        message: 'Empty Comment',
        description: 'Comment cannot be empty.',
      });
      return;
    }

    setLoadingComment(true);
    try {
      const commentsRef = collection(db, 'books_pending', bookId, 'comments');
      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        content: newComment,
        createdAt: new Date(),
        likes: 0,
      });
      setNewComment('');
      notification.success({
        message: 'Comment Added',
        description: 'Your comment was successfully added.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in to ask a question.',
      });
      return;
    }

    if (!newQuestion.trim()) {
      notification.warning({
        message: 'Empty Question',
        description: 'Question cannot be empty.',
      });
      return;
    }

    try {
      const questionsRef = collection(db, 'books_pending', bookId, 'questions');
      await addDoc(questionsRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        content: newQuestion,
        createdAt: new Date(),
        answer: null,
      });
      setNewQuestion('');
      notification.success({
        message: 'Question Added',
        description: 'Your question was successfully added.',
      });
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  if (loading) {
    return <p>Loading book details...</p>;
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail">
        <div className="book-image">
          <img src={book.coverImageUrl} alt={`${book.title} cover`} />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Description:</strong> {book.description}</p>
          <p><strong>Price:</strong> ${book.price}</p>
          <p><strong>Category:</strong> {book.category}</p>

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

      <div className="questions-section">
        <h3>Questions for the Author</h3>
        {questions.length > 0 ? (
          <List
            dataSource={questions}
            renderItem={(question) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{question.userName[0]}</Avatar>}
                  title={question.userName}
                  description={question.content}
                />
                {question.answer && <p><strong>Answer:</strong> {question.answer}</p>}
              </List.Item>
            )}
          />
        ) : (
          <p>No questions yet. Be the first to ask a question!</p>
        )}

        {user && (
          <div className="add-question">
            <TextArea
              rows={4}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask the author a question..."
            />
            <Button
              type="primary"
              onClick={handleAddQuestion}
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
