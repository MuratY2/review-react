// File: src/App.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import 'animate.css';
import './App.css';
import Signup from './Signup';
import { notification } from 'antd';

const { Header, Content } = Layout;

const App = () => {
  const [user, setUser] = useState(null);

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

  const accountMenu = user ? (
    <Menu>
      <Menu.Item key="1">
        <a href="#profile">Profile</a>
      </Menu.Item>
      <Menu.Item key="2" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  ) : (
    <Menu>
      <Menu.Item key="1">
        <Link to="/signup">Sign Up</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="#login">Login</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Router>
      <Layout className="layout">
        <Header className="header">
          <div className="logo">📚 AuthorFactory</div>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} className="menu">
            <Menu.Item key="1"><Link to="/">Home</Link></Menu.Item>
            <Menu.Item key="2"><a href="#about">About</a></Menu.Item>
            <Menu.Item key="3"><a href="#contact">Contact</a></Menu.Item>
          </Menu>
          <Dropdown overlay={accountMenu} className="account-dropdown">
            <Button type="text" icon={<UserOutlined />} className="account-button">
              Account <DownOutlined />
            </Button>
          </Dropdown>
        </Header>

        <Content className="main-content">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={(
              <>
                <div className="hero-section animate__animated animate__fadeInUp">
                  <h1>Welcome to AuthorFactory</h1>
                  <p>Discover, review, and share your thoughts on your favorite books. Join our community and start exploring!</p>
                  <Button type="primary" size="large">Get Started</Button>
                </div>

                <div className="books-section animate__animated animate__fadeInUp">
                  <h2>Featured Books</h2>
                </div>

                <div className="community-section animate__animated animate__fadeInUp">
                  <h2>Join Our Community</h2>
                  <p>Be part of a growing community of readers and authors.</p>
                  <Button type="default" size="large">Learn More</Button>
                </div>
              </>
            )} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

export default App;
