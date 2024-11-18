import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { notification } from 'antd';
import 'animate.css';
import Signup from './Signup';
import Login from './Login';
import Books from './Books';
import About from './About';
import Contact from './Contact';
import Event from './Event';
import './App.css';
import BookUpload from './BookUpload';
import BookList from './BookList';
import BookApproval from './BookApproval';
import Profile from './Profile';

const FeaturedBooks = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books_pending'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = ['All', 'Business', 'Financial', 'Programming'];

  const filteredBooks = activeCategory === 'All' 
    ? books 
    : books.filter(book => book.category === activeCategory.toLowerCase());

  if (loading) {
    return <div className="featured-books">Loading books...</div>;
  }

  return (
    <section className="featured-books">
      <h6 className="featured-subtitle">FEATURED BOOKS</h6>
      <h2 className="featured-title">What Will You Discover?</h2>
      
      <div className="category-filters">
        {categories.map(category => (
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
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              {book.isHot && <span className="hot-tag">HOT</span>}
              <img 
                src={book.coverImageUrl} 
                alt={book.title} 
                className="book-image"
              />
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">By {book.author}</p>
                <p className="book-price">${book.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No books available in this category</p>
        )}
      </div>
      <div className="pagination-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
      </div>
    </section>
  );
};


const EditorialReviews = () => {
  const reviews = [
    {
      id: 1,
      text: "Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project and Pulp Fictionize that shit.",
      author: "Mohamoud Arafa",
      role: "Project Manager",
      image: "/path-to-image/profile1.jpg" 
    },
    {
      id: 2,
      text: "Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project and Pulp Fictionize that shit.",
      author: "Fatima Mahmoud",
      role: "Project Manager",
      image: "/path-to-image/profile2.jpg"
    },
    {
      id: 3,
      text: "Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project and Pulp Fictionize that shit.",
      author: "Fatima Mahmoud",
      role: "Project Manager",
      image: "/path-to-image/profile3.jpg"
    }
  ];

  return (
    <section className="editorial-reviews">
      <div className="editorial-header">
        <h6 className="editorial-subtitle">HAPPY READERS</h6>
        <h2 className="editorial-title">Editorial Reviews</h2>
      </div>

      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="reviewer-image">
              <img src={review.image} alt={review.author} />
            </div>
            <p className="review-text">{review.text}</p>
            <h4 className="reviewer-name">{review.author}</h4>
            <p className="reviewer-role">{review.role}</p>
          </div>
        ))}
      </div>

      <div className="pagination-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </section>
  );
};

const BestOfMonth = () => {
  const [mainBook, setMainBook] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books_pending'), 
          where('status', '==', 'approved'),
          limit(4) 
        );
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (booksData.length > 0) {
          setMainBook(booksData[0]); 
          setRecommendedBooks(booksData.slice(1)); 
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading || !mainBook) {
    return <div className="best-of-month">Loading...</div>;
  }

  return (
    <section className="best-of-month">
      <div className="best-of-month-container">
        <div className="best-of-month-content">
          <div className="best-of-month-text">
            <h6 className="best-of-subtitle">BEST OF THE MONTH</h6>
            <h2 className="best-of-title">{mainBook.title}</h2>
            <p className="best-of-author">By {mainBook.author}</p>
            <div className="rating">
              {"★".repeat(5)} <span>({mainBook.reviews || 1} customer review)</span>
            </div>
            <p className="best-of-description">{mainBook.description || 'No description available.'}</p>
            <button className="add-to-cart-btn">ADD TO CART</button>
          </div>
          <div className="best-of-month-image">
            <img src={mainBook.coverImageUrl} alt={mainBook.title} />
          </div>
        </div>

        <div className="recommended-books">
          {recommendedBooks.map(book => (
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
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      notification.success({
        message: 'Logout Successful',
        description: 'You have been logged out successfully.',
      });
    }).catch((error) => {
      notification.error({
        message: 'Logout Failed',
        description: error.message,
      });
    });
  };

  const handleMenuClick = (path) => {
    setActiveMenuItem(path);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (category) => {
    const categoryMapping = {
      'Art & Design': 'art-design',
      'Business': 'business',
      'IT & Technology': 'it-technology',
      'Financial': 'financial',
      'Medicine': 'medicine',
      'Audio Books': 'audio-books'
    };
    
    const formattedCategory = categoryMapping[category];
    navigate(`/books/${formattedCategory}`);
    setActiveMenuItem('/books');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo" onClick={() => handleMenuClick('/')}>
          <span className="logo-part1">Author</span>
          <span className="logo-part2">Factory</span>
        </Link>
        
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>

        <nav className={`menu ${isMobileMenuOpen ? 'menu-mobile-open' : ''}`}>
          <Link to="/books" 
                className={`menu-item ${activeMenuItem === '/books' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('/books')}>
            Books
          </Link>
          <Link to="/about" 
                className={`menu-item ${activeMenuItem === '/about' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('/about')}>
            About
          </Link>
          <Link to="/contact" 
                className={`menu-item ${activeMenuItem === '/contact' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('/contact')}>
            Contact
          </Link>
          <Link to="/event" 
                className={`menu-item ${activeMenuItem === '/event' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('/event')}>
            Event
          </Link>
          <Link to="/bookupload" 
                className={`menu-item ${activeMenuItem === '/bookupload' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('/bookupload')}>
            Upload
          </Link>
        </nav>

        <div className={`account-dropdown ${isMobileMenuOpen ? 'mobile-visible' : ''}`}>
          <button className="account-button" onClick={toggleDropdown}>
            <UserOutlined /> Account ▼
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  {isAdmin && (
                    <Link to="/bookapproval" className="dropdown-item">Book Approvals</Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="dropdown-item">Sign Up</Link>
                  <Link to="/login" className="dropdown-item">Login</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={(
            <>
              <section className="category-section">
                <div className="category-header">
                  <div className="titles">
                    <h6 className="sub-title">Top Categories</h6>
                    <h2 className="section-title">Explore Categories</h2>
                  </div>
                  <Link to="/books" className="view-all" onClick={() => handleMenuClick('/books')}>View All →</Link>
                </div>
                <div className="categories-grid">
                  <div className="category-column">
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Art & Design')}>
                      <span className="category-icon" role="img" aria-label="pencil">
                        ✏️
                      </span>
                      <h3>Art & Design</h3>
                      <p>300 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Business')}>
                      <span className="category-icon" role="img" aria-label="chart">
                        📊
                      </span>
                      <h3>Business</h3>
                      <p>450 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('IT & Technology')}>
                    <span className="category-icon" role="img" aria-label="computer">
                      💻
                    </span>
                    <h3>IT & Technology</h3>
                    <p>900 Books</p>
                  </div>
                  <div className="category-column">
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Financial')}>
                      <span className="category-icon" role="img" aria-label="money bag">
                        💰
                      </span>
                      <h3>Financial</h3>
                      <p>700 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Medicine')}>
                      <span className="category-icon" role="img" aria-label="hospital">
                        🏥
                      </span>
                      <h3>Medicine</h3>
                      <p>1000 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('Audio Books')}>
                    <span className="category-icon" role="img" aria-label="headphones">
                      🎧
                    </span>
                    <h3>Audio Books</h3>
                    <p>300 Books</p>
                  </div>
                </div>
              </section>
              <FeaturedBooks />
              <EditorialReviews />
              <BestOfMonth />
            </>
          )} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/event" element={<Event />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:category" element={<Books />} />
          <Route path="/booklist" element={<BookList />} />
          <Route path="/bookupload" element={<BookUpload />} />
          <Route path="/bookapproval" element={<BookApproval />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;