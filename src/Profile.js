import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Upload, BookOpen, Mail, Pencil } from 'lucide-react';
import BookUpload from './BookUpload'; 
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    role: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [authorVerification, setAuthorVerification] = useState({
    nameSurname: '',
    idImage: null,
    bio: '',
    website: '',
    submitted: false,
  });
  const [previewImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data on component load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              email: data.email || currentUser.email,
              username: data.username || '',
              role: data.role || 'user',
              avatarUrl: data.avatarUrl || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'admin':
        return 'Admin';
      case 'author':
        return 'Author';
      default:
        return 'Reader';
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const userRef = doc(db, 'users', user.uid);

      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        const avatarUrl = await getDownloadURL(avatarRef);
        await updateDoc(userRef, { avatarUrl });
        setUserData((prev) => ({ ...prev, avatarUrl }));
      }

      if (newUsername) {
        await updateProfile(user, { displayName: newUsername });
        await updateDoc(userRef, { username: newUsername });
        setUserData((prev) => ({ ...prev, username: newUsername }));
      }

      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountUpdate = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const userRef = doc(db, 'users', user.uid);

      if (newEmail) {
        await user.updateEmail(newEmail);
        await updateDoc(userRef, { email: newEmail });
        setUserData((prev) => ({ ...prev, email: newEmail }));
      }

      setEditingAccount(false);
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const idImageRef = ref(storage, `author-verification/${user.uid}/id-image`);
      await uploadBytes(idImageRef, authorVerification.idImage);
      const idImageUrl = await getDownloadURL(idImageRef);

      const authorPendingRef = doc(db, 'authors_pending', user.uid);
      await setDoc(authorPendingRef, {
        userId: user.uid,
        nameSurname: authorVerification.nameSurname,
        email: user.email,
        username: userData.username || user.displayName || 'Anonymous',
        bio: authorVerification.bio,
        website: authorVerification.website,
        idImageUrl: idImageUrl,
        status: 'pending',
        submitDate: new Date(),
      });

      setAuthorVerification((prev) => ({
        ...prev,
        submitted: true,
      }));

      alert('Author verification submitted successfully.');
    } catch (error) {
      console.error('Error submitting author verification:', error);
      alert('Error submitting verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* User Info */}
        <div className="profile-card user-info">
          <div className="card-header">
            <UserCircle size={50} className="header-icon" />
            <h2>{userData.username}</h2>
            <div className="role-box">
                {getRoleDisplay(userData.role)}
            </div>
            <button
              className="edit-button"
              onClick={() => setEditingProfile(!editingProfile)}
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>

          {editingProfile ? (
            <div className="profile-content">
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" />
                  ) : userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt="Current" />
                  ) : (
                    <UserCircle size={80} />
                  )}
                </div>
                <button
                  className="change-avatar-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
                className="edit-input"
              />
              <div className="edit-actions">
                <button
                  className="save-button"
                  onClick={handleProfileUpdate}
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditingProfile(false);
                    setNewUsername('');
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="avatar-section">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Profile" className="avatar-display" />
              ) : (
                <UserCircle size={80} className="avatar-display" />
              )}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="profile-card account-info">
          <div className="card-header">
            <Mail size={24} className="header-icon" />
            <h2>Account Information</h2>
            <button
              className="edit-button"
              onClick={() => setEditingAccount(!editingAccount)}
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>

          <div className="info-content">
            {editingAccount ? (
              <>
                <div className="edit-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email"
                    className="edit-input"
                  />
                </div>
                <div className="edit-actions">
                  <button
                    className="save-button"
                    onClick={handleAccountUpdate}
                    disabled={loading}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setEditingAccount(false);
                      setNewEmail('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <label>Email</label>
                  <p>{userData.email}</p>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <p>{userData.username}</p>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <p>
                    {userData.role === 'user'
                      ? 'Reader'
                      : userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Apply to Become an Author */}
        {userData.role === 'user' && (
          <div className="profile-card author-verification">
            <div className="card-header">
              <BookOpen size={24} className="header-icon" />
              <h2>Author Verification</h2>
            </div>
            <form className="verification-form" onSubmit={handleAuthorSubmission}>
              <div className="form-group">
                <label>Name Surname</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={authorVerification.nameSurname}
                  onChange={(e) =>
                    setAuthorVerification((prev) => ({
                      ...prev,
                      nameSurname: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Professional Bio</label>
                <textarea
                  placeholder="Tell us about your professional background..."
                  value={authorVerification.bio}
                  onChange={(e) =>
                    setAuthorVerification((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Professional Website/Portfolio</label>
                <input
                  type="url"
                  placeholder="https://your-website.com"
                  value={authorVerification.website}
                  onChange={(e) =>
                    setAuthorVerification((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>ID Verification</label>
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => document.getElementById('id-upload').click()}
                >
                  <Upload size={20} />
                  Upload ID
                </button>
                <input
                  id="id-upload"
                  type="file"
                  onChange={(e) =>
                    setAuthorVerification((prev) => ({
                      ...prev,
                      idImage: e.target.files[0],
                    }))
                  }
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="ID Preview" />
                  </div>
                )}
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}

        {/* Book Upload Section (Only for Authors) */}
        {userData.role === 'author' && (
          <div className="profile-card book-upload-section">
            <div className="card-header">
              <BookOpen size={24} className="header-icon" />
              <h2>Book Upload</h2>
            </div>
            <BookUpload /> {/* Render the BookUpload component here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
