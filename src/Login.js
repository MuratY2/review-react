import React, { useState, useRef, useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from 'rive-react';
import { Form, Input, Button, Typography, notification } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import './Login.css';

const { Title } = Typography;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const passwordInputRef = useRef(null);

  const { rive: riveInstance, RiveComponent } = useRive({
    src: "/login_teddy.riv",
    stateMachines: "Login Machine",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  const isCheckingInput = useStateMachineInput(riveInstance, "Login Machine", "isChecking");
  const isHandsUpInput = useStateMachineInput(riveInstance, "Login Machine", "isHandsUp");
  const trigSuccessInput = useStateMachineInput(riveInstance, "Login Machine", "trigSuccess");
  const trigFailInput = useStateMachineInput(riveInstance, "Login Machine", "trigFail");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if (trigSuccessInput) trigSuccessInput.fire();
      
      notification.success({
        message: 'Login Successful',
        description: 'You have logged in successfully!',
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      if (trigFailInput) trigFailInput.fire();
      notification.error({
        message: 'Login Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="animated-background">
        <div className="light-beam"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      
      <div className="login-card animate-in">
        <div className="rive-container">
          <RiveComponent className="teddy-animation" />
        </div>

        <div className="login-header">
          <Title level={2}>Login</Title>
          <p className="login-subtitle">Welcome back! Please login to your account</p>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          className="login-form"
        >
          <Form.Item
            label={<span className="input-label">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' }
            ]}
          >
            <Input
              className="styled-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => isCheckingInput && (isCheckingInput.value = true)}
              onBlur={() => isCheckingInput && (isCheckingInput.value = false)}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            label={<span className="input-label">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <div className="password-input-container">
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                className="styled-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => isHandsUpInput && (isHandsUpInput.value = true)}
                onBlur={() => isHandsUpInput && (isHandsUpInput.value = false)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form.Item>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;