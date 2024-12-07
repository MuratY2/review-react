import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
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
  const handleCategoryClick = (category) => {
    const categoryMapping = {
      'Art & Design': 'art-design',
      Business: 'business',
      'IT & Technology': 'it-technology',
      Financial: 'financial',
      Medicine: 'medicine',
      'Audio Books': 'audio-books',
    };

    const formattedCategory = categoryMapping[category];
    navigate(`/books/${formattedCategory}`);
  };

  return (
    <div className="home-page">
      {/* Categories Section */}
      <section className="category-section">
        <div className="category-header">
          <div className="titles">
            <h6 className="sub-title">Top Categories</h6>
            <h2 className="section-title">Explore Categories</h2>
          </div>
          <button className="view-all" onClick={() => navigate('/books')}>
            View All →
          </button>
        </div>
        <div className="categories-grid">
          <div className="category-column">
            <div
              className="category-card small"
              onClick={() => handleCategoryClick('Art & Design')}
            >
              <h3>Art & Design</h3>
              <p>300 Books</p>
            </div>
            <div
              className="category-card small"
              onClick={() => handleCategoryClick('Business')}
            >
              <h3>Business</h3>
              <p>450 Books</p>
            </div>
          </div>
          <div
            className="category-card large"
            onClick={() => handleCategoryClick('IT & Technology')}
          >
            <h3>IT & Technology</h3>
            <p>900 Books</p>
          </div>
          <div className="category-column">
            <div
              className="category-card small"
              onClick={() => handleCategoryClick('Financial')}
            >
              <h3>Financial</h3>
              <p>700 Books</p>
            </div>
            <div
              className="category-card small"
              onClick={() => handleCategoryClick('Medicine')}
            >
              <h3>Medicine</h3>
              <p>1000 Books</p>
            </div>
          </div>
          <div
            className="category-card large"
            onClick={() => handleCategoryClick('Audio Books')}
          >
            <h3>Audio Books</h3>
            <p>300 Books</p>
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
                <p className="best-of-description">{mainBook.description || 'No description available.'}</p>
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
