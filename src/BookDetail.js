import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Rate, Input, Button, List, Avatar, notification } from 'antd';
import './BookDetail.css';
import * as toxicity from '@tensorflow-models/toxicity';
import '@tensorflow/tfjs';

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
  const [toxicityModel, setToxicityModel] = useState(null);

  // Track user's role if we need to show "Claim Authorship"
  const [userRole, setUserRole] = useState(null);
  // Track if there's an existing authorship request pending
  const [authorshipRequestPending, setAuthorshipRequestPending] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role);
        }
      }
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

  // Load the toxicity detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await toxicity.load(0.9);
        setToxicityModel(model);
      } catch (error) {
        console.error('Error loading toxicity model:', error);
      }
    };
    loadModel();
  }, []);

  const handleRating = async (value) => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in to rate this book.',
      });
      return;
    }

    try {
      const bookRef = doc(db, 'books_pending', bookId);
      const userRatingRef = doc(collection(db, 'books_pending', bookId, 'ratings'), user.uid);
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

      const userRatingSnap = await getDoc(userRatingRef);

      if (userRatingSnap.exists()) {
        const previousRating = userRatingSnap.data().rating;
        totalRating = totalRating - previousRating + value;

        await setDoc(userRatingRef, { rating: value });
        notification.success({
          message: 'Rating Updated',
          description: `Your rating for "${book.title}" has been updated to ${value} stars.`,
        });
      } else {
        totalRating += value;
        numberOfRatings++;

        await setDoc(userRatingRef, { rating: value });
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

    if (!toxicityModel) {
      notification.error({
        message: 'Error',
        description: 'Toxicity model not loaded. Please try again later.',
      });
      return;
    }

    setLoadingComment(true);
    try {
      // Check the comment for toxicity
      const predictions = await toxicityModel.classify(newComment);
      const isToxic = predictions.some((prediction) => prediction.results[0].match);

      if (isToxic) {
        notification.warning({
          message: 'Comment Blocked',
          description: 'Your comment contains inappropriate content and cannot be posted.',
        });
        setLoadingComment(false);
        return;
      }

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
      notification.error({
        message: 'Error',
        description: 'There was an issue adding your comment. Please try again.',
      });
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

  /**
   * Only the "linkedAuthorId" can provide an answer
   */
  const handleAnswer = async (questionId) => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in to submit an answer.',
      });
      return;
    }

    // If this book is linked to an author and that author is the current user, directly answer
    if (book?.linkedAuthorId && book.linkedAuthorId === user.uid) {
      const answer = prompt('Enter your answer:');
      if (!answer) return;

      const questionRef = doc(db, 'books_pending', bookId, 'questions', questionId);
      await updateDoc(questionRef, { answer });

      notification.success({
        message: 'Answer Submitted',
        description: 'Your answer has been successfully added.',
      });
      return;
    }

    // Otherwise, show not authorized
    notification.warning({
      message: 'Not Authorized',
      description: 'Only the official linked author can answer questions for this book.',
    });
  };

  /**
   * Handle requesting authorship of this book
   */
  const handleClaimAuthorship = async () => {
    if (!user) {
      notification.warning({
        message: 'Login Required',
        description: 'Please log in as an author to claim authorship.',
      });
      return;
    }

    // Must have role=author
    if (userRole !== 'author') {
      notification.warning({
        message: 'Not Authorized',
        description: 'Only users with an Author role can claim authorship.',
      });
      return;
    }

    try {
      // Check if there's already a pending request
      const requestRef = doc(db, 'authorship_requests', `${user.uid}_${bookId}`);
      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        const { status } = requestSnap.data();
        if (status === 'pending') {
          notification.info({
            message: 'Request Already Submitted',
            description: 'Your authorship request is still pending approval.',
          });
          return;
        } else if (status === 'approved') {
          notification.info({
            message: 'Already Approved',
            description: 'You are already approved as the author of this book.',
          });
          return;
        }
      }

      // Otherwise, create a new authorship request
      await setDoc(requestRef, {
        userId: user.uid,
        userName: user.displayName,
        bookId: bookId,
        status: 'pending',
      });

      setAuthorshipRequestPending(true);
      notification.success({
        message: 'Authorship Request Submitted',
        description: 'Your request to claim authorship has been submitted for approval.',
      });
    } catch (error) {
      console.error('Error claiming authorship:', error);
      notification.error({
        message: 'Request Failed',
        description: 'There was an error submitting your authorship request.',
      });
    }
  };

  if (loading) {
    return <p>Loading book details...</p>;
  }

  // If the book doesn't exist, you can handle it gracefully
  if (!book) {
    return <p>Book not found.</p>;
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail">
        <div className="rating-section">
          <h3>Average Rating: {averageRating.toFixed(1)}</h3>
          <Rate 
            value={rating} 
            disabled={!user}
            onChange={handleRating}
            className="book-rating"
          />
          {!user && (
            <p className="login-prompt">Log in to rate this book</p>
          )}
        </div>
        
        <div className="book-image">
          <img src={book.coverImageUrl} alt={`${book.title} cover`} />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>

          {/* Author field logic */}
          {book.linkedAuthorId ? (
            // If there's a linkedAuthorId, make the author's name clickable -> author profile
            <p>
              <strong>Author: </strong>
              <Link to={`/author/${book.linkedAuthorId}`}>{book.author}</Link>
            </p>
          ) : (
            <p>
              <strong>Author:</strong> {book.author} <br />
              <em>(No official author account matched yet)</em>
            </p>
          )}

          {/* If there's no linkedAuthorId, show a button for authors to claim authorship */}
          {!book.linkedAuthorId && userRole === 'author' && (
            <div style={{ marginTop: '10px' }}>
              <Button
                type="primary"
                disabled={authorshipRequestPending}
                onClick={handleClaimAuthorship}
              >
                {authorshipRequestPending ? 'Request Pending...' : 'Claim Authorship'}
              </Button>
            </div>
          )}

          <p><strong>Description:</strong> {book.description}</p>
          <p><strong>Category:</strong> {book.category}</p>
          {book.pdfUrl && (
            <div className="pdf-viewer">
              <h3>Read the PDF:</h3>
              <iframe
                src={book.pdfUrl}
                width="100%"
                height="600px"
                title="PDF Viewer"
              />
            </div>
          )}
        </div>
      </div>
  
      <div className="comments-section">
        <h3 className="section-title">Reader Comments</h3>
        {comments.length > 0 ? (
          <List
            className="comments-list"
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item className="comment-item">
                <List.Item.Meta
                  avatar={<Avatar className="comment-avatar">{comment.userName[0]}</Avatar>}
                  title={<span className="comment-username">{comment.userName}</span>}
                  description={<p className="comment-content">{comment.content}</p>}
                />
              </List.Item>
            )}
          />
        ) : (
          <p className="no-comments">Be the first to share your thoughts!</p>
        )}
  
        <div className="comment-form">
          {user ? (
            <div className="add-comment">
              <TextArea
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                className="comment-input"
              />
              <Button
                type="primary"
                onClick={handleAddComment}
                loading={loadingComment}
                className="submit-comment"
              >
                Post Comment
              </Button>
            </div>
          ) : (
            <div className="login-prompt-section">
              <p>Please log in to leave a comment</p>
            </div>
          )}
        </div>
      </div>
  
      <div className="questions-section">
        <h3 className="section-title">Questions for the Author</h3>
        {questions.length > 0 ? (
          <List
            className="questions-list"
            dataSource={questions}
            renderItem={(question) => (
              <List.Item className="question-item">
                <List.Item.Meta
                  avatar={<Avatar className="question-avatar">{question.userName[0]}</Avatar>}
                  title={<span className="question-username">{question.userName}</span>}
                  description={<p className="question-content">{question.content}</p>}
                />
                {question.answer ? (
                  <div className="answer-section">
                    <p><strong>Author's Answer:</strong> {question.answer}</p>
                  </div>
                ) : (
                  user && ( // Only show "Answer" button if logged in
                    <Button
                      type="primary"
                      onClick={() => handleAnswer(question.id)}
                      className="answer-button"
                    >
                      Answer
                    </Button>
                  )
                )}
              </List.Item>
            )}
          />
        ) : (
          <p className="no-questions">No questions yet. Be the first to ask!</p>
        )}
  
        {user ? (
          <div className="add-question">
            <TextArea
              rows={4}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask the author a question..."
              className="question-input"
            />
            <Button
              type="primary"
              onClick={handleAddQuestion}
              className="submit-question"
            >
              Submit Question
            </Button>
          </div>
        ) : (
          <div className="login-prompt-section">
            <p>Please log in to ask a question</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
