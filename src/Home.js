import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';
import BestBookImage from './images/Assets/BestBook.jpg';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // State for Featured Books
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Featured Books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books_pending'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ['All', 'Business', 'Financial', 'Programming'];

  const filteredBooks =
    activeCategory === 'All'
      ? books
      : books.filter((book) => book.category === activeCategory.toLowerCase());

  const handleBookClick = (bookId) => {
    navigate(`/bookdetail/${bookId}`);
  };

  // State for Best of the Month
  const [mainBook, setMainBook] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  // Fetch Best of the Month Books
  useEffect(() => {
    const fetchBestOfMonthBooks = async () => {
      try {
        const q = query(collection(db, 'books_pending'), where('status', '==', 'approved'), limit(4));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (booksData.length > 0) {
          setMainBook(booksData[0]);
          setRecommendedBooks(booksData.slice(1));
        }
      } catch (error) {
        console.error('Error fetching best of month books:', error);
      }
    };
    fetchBestOfMonthBooks();
  }, []);

  // Reviews Data
  const reviews = [
    {
      id: 1,
      text: 'Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project.',
      author: 'Mohamoud Arafa',
      role: 'Project Manager',
    },
    {
      id: 2,
      text: 'Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project.',
      author: 'Fatima Mahmoud',
      role: 'Product Designer',
    },
    {
      id: 3,
      text: 'Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project.',
      author: 'John Doe',
      role: 'Software Engineer',
    },
  ];

  // Categories Navigation
  

  // Community Stats
  const communityStats = [
    {
      icon: <BookOpen className="w-5 h-5 text-rose-500" />,
      label: 'Most Read',
      title: 'Python Basics',
      value: '2.3k reads'
    },
    {
      icon: <Users className="w-5 h-5 text-rose-500" />,
      label: 'Active Readers',
      value: '15.6k'
    },
    {
      icon: <Star className="w-5 h-5 text-rose-500" />,
      label: 'Top Rated',
      title: 'Clean Code',
      value: '4.9★'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-rose-500" />,
      label: 'Trending Category',
      title: 'Programming',
      value: '+127%'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text-content">
              <span className="hero-tag">Digital Library</span>
              <h1 className="hero-title">
                Discover Your Next 
                <span className="highlight">Favorite Book</span>
              </h1>
              <p className="hero-description">
                Explore our vast collection of digital books, from programming to business. 
                Join our community of passionate readers.
              </p>
              <div className="hero-buttons">
                <button 
                  onClick={() => navigate('/books')}
                  className="primary-button"
                >
                  Browse Books
                </button>
                <button 
                  onClick={() => navigate('/Signup')}
                  className="primary-button"
                >
                  Join Community!
                </button>
              </div>
            </div>

            <div className="hero-image-container" onClick={() => navigate('/books')}>
              <div className="hero-image-wrapper">
              <img
                src={BestBookImage}
                alt="Digital Library Collection"
                className="hero-image"
              />
              </div>

              <div className="stats-window">
                <div className="stats-content">
                  {communityStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="stat-icon">
                        {stat.icon}
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">{stat.label}</p>
                        {stat.title && (
                          <p className="stat-title">{stat.title}</p>
                        )}
                        <p className="stat-value">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* Featured Books */}
      <section className="featured-books">
        <h6 className="featured-subtitle">FEATURED BOOKS</h6>
        <h2 className="featured-title">What Will You Discover?</h2>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="books-grid">
          {loading ? (
            <p>Loading books...</p>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} className="book-card" onClick={() => handleBookClick(book.id)}>
                {book.isHot && <span className="hot-tag">HOT</span>}
                <img src={book.coverImageUrl} alt={book.title} className="book-image" />
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">By {book.author}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No books available in this category</p>
          )}
        </div>
      </section>

      {/* Editorial Reviews */}
      <section className="editorial-reviews">
        <div className="editorial-header">
          <h6 className="editorial-subtitle">HAPPY READERS</h6>
          <h2 className="editorial-title">Editorial Reviews</h2>
        </div>

        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <p className="review-text">{review.text}</p>
              <h4 className="reviewer-name">{review.author}</h4>
              <p className="reviewer-role">{review.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Best of the Month */}
      {mainBook && (
        <section className="best-of-month">
          <div className="best-of-month-container">
            <div className="best-of-month-content">
              <div className="best-of-month-text">
                <h6 className="best-of-subtitle">BEST OF THE MONTH</h6>
                <h2 className="best-of-title">{mainBook.title}</h2>
                <p className="best-of-author">By {mainBook.author}</p>
                <p className="best-of-description">
                  {mainBook.description || 'No description available.'}
                </p>
                <button className="add-to-cart-btn">ADD TO CART</button>
              </div>
              <div className="best-of-month-image">
                <img src={mainBook.coverImageUrl} alt={mainBook.title} />
              </div>
            </div>

            <div className="recommended-books">
              {recommendedBooks.map((book) => (
                <div key={book.id} className="recommended-book">
                  <img src={book.coverImageUrl} alt={book.title} />
                  <div className="recommended-book-info">
                    <h3>{book.title}</h3>
                    <p>By {book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;