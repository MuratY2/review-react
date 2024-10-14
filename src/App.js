// File: src/App.js
import React from 'react';
import { Layout } from 'antd';
import './App.css';

const { Content, Footer } = Layout;

const MainPage = () => {
  return (
    <Layout>
      {/* Main Content */}
      <Content className="simple-content">
        <h1>Review Website</h1>
      </Content>

      {/* Footer */}
      <Footer className="simple-footer">
        Review ©2024
      </Footer>
    </Layout>
  );
};

export default MainPage;
