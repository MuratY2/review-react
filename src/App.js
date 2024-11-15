import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if the user has an admin role
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
    navigate(path);
  };

  const handleCategoryClick = (category) => {
    navigate(`/books/${category}`);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo" onClick={() => handleMenuClick('/')}>
          <span className="logo-part1">Author</span>
          <span className="logo-part2">Factory</span>
        </Link>
        <nav className="menu">
          <Link to="/" className={`menu-item ${activeMenuItem === '/' ? 'active' : ''}`} onClick={() => handleMenuClick('/')}>Home</Link>
          <Link to="/books" className={`menu-item ${activeMenuItem === '/books' ? 'active' : ''}`} onClick={() => handleMenuClick('/books')}>Books</Link>
          <Link to="/about" className={`menu-item ${activeMenuItem === '/about' ? 'active' : ''}`} onClick={() => handleMenuClick('/about')}>About</Link>
          <Link to="/contact" className={`menu-item ${activeMenuItem === '/contact' ? 'active' : ''}`} onClick={() => handleMenuClick('/contact')}>Contact</Link>
          <Link to="/event" className={`menu-item ${activeMenuItem === '/event' ? 'active' : ''}`} onClick={() => handleMenuClick('/event')}>Event</Link>
          <Link to="/bookupload" className={`menu-item ${activeMenuItem === '/bookupload' ? 'active' : ''}`} onClick={() => handleMenuClick('/bookupload')}>Upload</Link>
        </nav>
        <div className="account-dropdown">
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
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('art-design')}>
                      <span className="category-icon">✏️</span>
                      <h3>Art & Design</h3>
                      <p>300 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('business')}>
                      <span className="category-icon">📊</span>
                      <h3>Business</h3>
                      <p>450 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('it-technology')}>
                    <span className="category-icon">💻</span>
                    <h3>IT & Technology</h3>
                    <p>900 Books</p>
                  </div>
                  <div className="category-column">
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('financial')}>
                      <span className="category-icon">💰</span>
                      <h3>Financial</h3>
                      <p>700 Books</p>
                    </div>
                    <div className="category-card small" tabIndex="0" onClick={() => handleCategoryClick('medicine')}>
                      <span className="category-icon">🏥</span>
                      <h3>Medicine</h3>
                      <p>1000 Books</p>
                    </div>
                  </div>
                  <div className="category-card large" tabIndex="0" onClick={() => handleCategoryClick('audio-books')}>
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
        </Routes>
      </main>
    </div>
  );
};

export default App;
