// File: src/App.js

import React from 'react';
import { Layout, Menu, Dropdown, Button, Row, Col, Card } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { useInView } from 'react-intersection-observer';
import 'animate.css';
import './App.css'; 

const { Header, Content } = Layout;

const placeholderBooks = [
  { title: "The Great Adventure", description: "An adventurous story in the wild." },
  { title: "Mystery of the Mind", description: "A psychological thriller." },
  { title: "Journey of the Brave", description: "A tale of courage and discovery." },
];

const App = () => {
  // Account dropdown menu
  const accountMenu = (
    <Menu>
      <Menu.Item key="1">
        <a href="#login">Login</a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="#signup">Sign Up</a>
      </Menu.Item>
    </Menu>
  );

  // Intersection observer hooks to trigger animations
  const [heroRef, heroInView] = useInView({ triggerOnce: true });
  const [booksRef, booksInView] = useInView({ triggerOnce: true });
  const [communityRef, communityInView] = useInView({ triggerOnce: true });

  return (
    <Layout className="layout">
      {/* Header Section */}
      <Header className="header">
        <div className="logo">📚 AuthorFactory</div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} className="menu">
          <Menu.Item key="1">
            <a href="/">Home</a>
          </Menu.Item>
          <Menu.Item key="2">
            <a href="#about">About</a>
          </Menu.Item>
          <Menu.Item key="3">
            <a href="#contact">Contact</a>
          </Menu.Item>
        </Menu>
        <Dropdown overlay={accountMenu} className="account-dropdown">
          <Button type="text" icon={<UserOutlined />} className="account-button">
            Account <DownOutlined />
          </Button>
        </Dropdown>
      </Header>

      {/* Main Content */}
      <Content className="main-content">
        <div
          className={`hero-section animate__animated ${
            heroInView ? 'animate__fadeInUp' : ''
          }`}
          ref={heroRef}
        >
          <h1>Welcome to AuthorFactory</h1>
          <p>Discover, review, and share your thoughts on your favorite books. Join our community and start exploring!</p>
          <Button type="primary" size="large">
            Get Started
          </Button>
        </div>

        <div
          className={`books-section animate__animated ${
            booksInView ? 'animate__fadeInUp' : ''
          }`}
          ref={booksRef}
        >
          <h2>Featured Books</h2>
          <Row gutter={[16, 16]}>
            {placeholderBooks.map((book, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card title={book.title} bordered={false} hoverable>
                  <p>{book.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div
          className={`community-section animate__animated ${
            communityInView ? 'animate__fadeInUp' : ''
          }`}
          ref={communityRef}
        >
          <h2>Join Our Community</h2>
          <p>Be part of our community.</p>
          <Button type="default" size="large">Learn More</Button>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
