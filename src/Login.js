import React, { useState } from 'react';
import { Form, Input, Button, Typography, notification } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';

const { Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    const { email, password } = values;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        notification.success({
          message: 'Login Successful',
          description: 'You have logged in successfully!',
        });
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        notification.error({
          message: 'Login Failed',
          description: error.message,
        });
        setLoading(false);
      });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      <Form
        name="login"
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
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Text>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#1890ff', fontWeight: 'bold' }}>
              Sign up here
            </Link>
          </Text>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
