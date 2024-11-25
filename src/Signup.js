import React, { useState, useRef, useEffect } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from 'rive-react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { Form, Input, Button, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import './Signup.css';

const { Title } = Typography;

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookMultiplier, setLookMultiplier] = useState(0);
  const navigate = useNavigate();
  
  const usernameInputRef = useRef(null);

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
  const numLookInput = useStateMachineInput(riveInstance, "Login Machine", "numLook");
  const trigSuccessInput = useStateMachineInput(riveInstance, "Login Machine", "trigSuccess");
  const trigFailInput = useStateMachineInput(riveInstance, "Login Machine", "trigFail");

  useEffect(() => {
    if (usernameInputRef.current) {
      const inputWidth = usernameInputRef.current.offsetWidth;
      setLookMultiplier(100 / inputWidth);
    }
  }, []);

  const checkUsernameExists = async (username) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (numLookInput) {
      const value = e.target.value;
      const multiplier = lookMultiplier * value.length;
      numLookInput.value = Math.min(100, multiplier);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        if (trigFailInput) trigFailInput.fire();
        notification.error({
          message: 'Signup Failed',
          description: 'Username is already taken. Please choose a different one.',
        });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: username,
      });
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user',
        username: username,
      });

      if (trigSuccessInput) trigSuccessInput.fire();
      
      notification.success({
        message: 'Signup Successful',
        description: 'You have been registered successfully!',
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      if (trigFailInput) trigFailInput.fire();
      notification.error({
        message: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="animated-background">
        <div className="light-beam"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      
      <div className="signup-card animate-in">
        <div className="rive-container">
          <RiveComponent className="teddy-animation" />
        </div>

        <div className="signup-header">
          <Title level={2}>Sign Up</Title>
          <p className="signup-subtitle">Create your account to get started</p>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          className="signup-form"
        >
          <Form.Item
            label={<span className="input-label">Username</span>}
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              ref={usernameInputRef}
              className="styled-input"
              value={username}
              onChange={handleUsernameChange}
              onFocus={() => isCheckingInput && (isCheckingInput.value = true)}
              onBlur={() => isCheckingInput && (isCheckingInput.value = false)}
              placeholder="Enter your username"
            />
          </Form.Item>

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
              className="signup-button"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>

          <div className="login-link">
            Already have an account? <a href="/login">Log in</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Signup;