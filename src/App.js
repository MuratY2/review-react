import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { notification } from 'antd';
import 'animate.css';
import Signup from './Signup';
import Login from './Login';
import Books from './Books';
import About from './About';
import Contact from './Contact';
import Event from './Event'; 
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('/');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        notification.success({
          message: 'Logout Successful',
          description: 'You have been logged out successfully.',
        });
      })
      .catch((error) => {
        notification.error({
          message: 'Logout Failed',
          description: error.message,
        });
      });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (path) => {
    setActiveMenuItem(path);
  };

  return (
    <Router>
      <div className="layout">
        <header className="header">
          <Link to="/" className="logo" onClick={() => handleMenuClick('/')}>
            <span className="logo-part1">Author</span>
            <span className="logo-part2">Factory</span>
          </Link>

          <nav className="menu">
            <Link
              to="/"
              className={`menu-item ${activeMenuItem === '/' ? 'active' : ''}`}
              onClick={() => handleMenuClick('/')}
            >
              Home
            </Link>
            <Link
              to="/books"
              className={`menu-item ${activeMenuItem === '/books' ? 'active' : ''}`}
              onClick={() => handleMenuClick('/books')}
            >
              Books
            </Link>
            <Link
              to="/about"
              className={`menu-item ${activeMenuItem === '/about' ? 'active' : ''}`}
              onClick={() => handleMenuClick('/about')}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`menu-item ${activeMenuItem === '/contact' ? 'active' : ''}`}
              onClick={() => handleMenuClick('/contact')}
            >
              Contact
            </Link>
            <Link
              to="/event"
              className={`menu-item ${activeMenuItem === '/event' ? 'active' : ''}`}
              onClick={() => handleMenuClick('/event')}
            >
              Event
            </Link>
          </nav>

          <div className="account-dropdown">
            <button 
              className="account-button"
              onClick={toggleDropdown}
            >
              <UserOutlined /> Account ▼
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {user ? (
                  <>
                    <Link to="/profile" className="dropdown-item">Profile</Link>
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
                <section className="hero-section animate__animated animate__fadeInUp">
                  <h1>Welcome to AuthorFactory</h1>
                  <p>Discover, review, and share your thoughts on your favorite books. Join our community and start exploring!</p>
                  <button className="primary-button">Get Started</button>
                </section>

                <section className="books-section animate__animated animate__fadeInUp">
                  <h2>Featured Books</h2>
                </section>

                <section className="community-section animate__animated animate__fadeInUp">
                  <h2>Join Our Community</h2>
                  <p>Be part of a growing community of readers and authors.</p>
                  <button className="secondary-button">Learn More</button>
                </section>
              </>
            )} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/event" element={<Event />} />
            <Route path="/books" element={<Books />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
