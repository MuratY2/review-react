import React, { useRef, useState } from 'react';
import CountUp from 'react-countup';
import './About.css';

const About = () => {
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Us</h1>
      </div>
      <div className="about-content">
        <div className="welcome-section">
          <h6 className="welcome-subtitle">WELCOME</h6>
          <h2 className="welcome-title">Books are a uniquely portable magic</h2>
          <p className="welcome-text">
            Lorem ipsum that packs a punch. For a new twist on an old classic, drop some Samuel L. Jackson filler text in your next project and Pulp Fictionize that shit.
          </p>
        </div>
        <div className="video-container">
          <video
            ref={videoRef}
            className="about-video"
            onClick={handlePlayPause}
            playsInline
          >
            <source src="/images/Assets/AboutPageVideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {!isPlaying && (
            <button className="play-button" onClick={handlePlayPause}>
              ▶
            </button>
          )}
        </div>
        <div className="stats-section">
          <div className="stat-item">
            <CountUp
              start={0}
              end={600}
              duration={2.5}
              separator=","
              className="stat-number"
            />
            <p className="stat-label">ARTICLES</p>
          </div>
          <div className="stat-item">
            <CountUp
              start={0}
              end={40000}
              duration={2.5}
              separator=","
              className="stat-number"
            />
            <p className="stat-label">ACTIVE READERS</p>
          </div>
          <div className="stat-item">
            <CountUp
              start={0}
              end={18000}
              duration={2.5}
              separator=","
              className="stat-number"
            />
            <p className="stat-label">BOOKS PUBLISHED</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;