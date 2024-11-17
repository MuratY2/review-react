import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { notification } from 'antd';
import 'animate.css';
import Signup from './Signup';
import Login from './Login';
import Books from './Books';
import About from './About/About';
import Contact from './Contact';
import Event from './Event';
import './App.css';
import BookUpload from './BookUpload';
import BookList from './BookList';
import BookApproval from './BookApproval';
import Profile from './Profile';

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
    setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
    navigate(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false); // Close dropdown if open
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  // This function now redirects to the main Books page regardless of category
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
                      <span className="category-icon">✏️</span>
                      <h3>Art & Design</h3>
                      <p>300 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Business')}>
                      <span className="category-icon">📊</span>
                      <h3>Business</h3>
                      <p>450 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('IT & Technology')}>
                    <span className="category-icon">💻</span>
                    <h3>IT & Technology</h3>
                    <p>900 Books</p>
                  </div>
                  <div className="category-column">
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Financial')}>
                      <span className="category-icon">💰</span>
                      <h3>Financial</h3>
                      <p>700 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('Medicine')}>
                      <span className="category-icon">🏥</span>
                      <h3>Medicine</h3>
                      <p>1000 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('Audio Books')}>
                    <span className="category-icon">🎧</span>
                    <h3>Audio Books</h3>
                    <p>300 Books</p>
                  </div>
                </div>
              </section>
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