import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { notification } from "antd";
import Footer from "./Footer";
import Signup from "./Signup";
import Login from "./Login";
import Books from "./Books";
import About from "./About";
import Contact from "./Contact";
import Event from "./Event";
import Profile from "./Profile";
import BookDetail from "./BookDetail";
import BookApproval from "./BookApproval";
import AuthorApproval from "./AuthorApproval";
import Home from "./Home";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().role === "admin") {
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
    signOut(auth)
      .then(() => {
        notification.success({
          message: "Logout Successful",
          description: "You have been logged out successfully.",
        });
        navigate("/login");
      })
      .catch((error) => {
        notification.error({
          message: "Logout Failed",
          description: error.message,
        });
      });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-part1">Author</span>
          <span className="logo-part2">Factory</span>
        </Link>
        <nav className="menu">
          <Link to="/books" className="menu-item">
            Books
          </Link>
          <Link to="/about" className="menu-item">
            About
          </Link>
          <Link to="/contact" className="menu-item">
            Contact
          </Link>
          <Link to="/event" className="menu-item">
            Event
          </Link>
        </nav>

        {/* Account Dropdown */}
        <div className="account-dropdown">
          <button className="account-button" onClick={toggleDropdown}>
            <UserOutlined /> Account ▼
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <>
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/bookapproval" className="dropdown-item">
                        Book Approvals
                      </Link>
                      <Link to="/authorapproval" className="dropdown-item">
                        Author Approvals
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="dropdown-item">
                    Sign Up
                  </Link>
                  <Link to="/login" className="dropdown-item">
                    Login
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:category" element={<Books />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/event" element={<Event />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookdetail/:bookId" element={<BookDetail />} />
          <Route path="/bookapproval" element={<BookApproval />} />
          <Route path="/authorapproval" element={<AuthorApproval />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
