import React, { useRef, useState } from 'react';
import CountUp from 'react-countup';
import './About.css';

import AboutPageVideo from './images/Assets/AboutPageVideo.mp4';

const About = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleReadMore = () => {
    setIsReadMoreVisible(!isReadMoreVisible);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-overlay" />
        <h1>About Us</h1>
      </div>

      {/* Welcome Section */}
      <div className="about-content">
        <div className="welcome-section">
          <h6 className="welcome-subtitle">WELCOME</h6>
          <h2 className="welcome-title">Books are a uniquely portable magic</h2>
          <p className="welcome-text">
            Dive into the world of endless possibilities with books. From thrilling adventures to heartwarming tales, books have the power to transform perspectives and ignite imaginations.
          </p>
          <button className="read-more-btn" onClick={toggleReadMore}>
            {isReadMoreVisible ? 'Read Less' : 'Read More'}
          </button>
          {isReadMoreVisible && (
            <p className="read-more-text">
              At our platform, we aim to empower readers and authors alike. Whether you're looking for your next great read or want to share your story with the world, we are here to make it happen. Together, let's build a community where ideas flow freely and creativity thrives.
            </p>
          )}
        </div>

        {/* Video Section */}
        <div className="video-container">
        <video
          ref={videoRef}
          className="about-video"
          onClick={handlePlayPause}
          playsInline
        >
          <source src={AboutPageVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
          {!isPlaying && (
            <button className="play-button" onClick={handlePlayPause}>
              ▶
            </button>
          )}
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <CountUp start={0} end={600} duration={2.5} separator="," className="stat-number" />
            <p className="stat-label">ARTICLES</p>
          </div>
          <div className="stat-item">
            <CountUp start={0} end={40000} duration={2.5} separator="," className="stat-number" />
            <p className="stat-label">ACTIVE READERS</p>
          </div>
          <div className="stat-item">
            <CountUp start={0} end={18000} duration={2.5} separator="," className="stat-number" />
            <p className="stat-label">BOOKS PUBLISHED</p>
          </div>
        </div>
      </div>
      
    </div>
     
    
  );
};

export default About;
