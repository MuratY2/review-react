// src/Signup.js
import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';  

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  

  const onFinish = (values) => {
    setLoading(true);
    const { email, password } = values;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        notification.success({
          message: 'Signup Successful',
          description: 'You have successfully signed up!',
        });
        setLoading(false);
        navigate('/');  
      })
      .catch((error) => {
        notification.error({
          message: 'Signup Failed',
          description: error.message,
        });
        setLoading(false);
      });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px' }}>
      <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
      <Form
        name="signup"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'The input is not valid email!' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
