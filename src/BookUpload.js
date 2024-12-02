import React, { useState } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import './BookUpload.css';

const BookUpload = () => {
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const fetchBookData = async (isbn) => {
    try {
      const response = await axios.get(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const bookData = response.data[`ISBN:${isbn}`];

      if (!bookData) {
        setError("Invalid ISBN or book not found.");
        return null;
      }

      const title = bookData.title || 'Unknown Title';
      const coverImageUrl = bookData.cover ? bookData.cover.medium : '';
      const fetchedDescription = bookData.description
        ? bookData.description.value || bookData.description
        : 'No description available';

      return {
        title,
        coverImageUrl,
        description: fetchedDescription,
      };
    } catch (error) {
      setError("Error retrieving book details. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!author) {
      setError('Please enter the author.');
      return;
    }

    if (description.replace(/\s/g, '').length < 200) {
      setError('Description must be at least 200 characters excluding spaces.');
      return;
    }

    setLoading(true);
    const bookData = await fetchBookData(isbn);

    if (!bookData) {
      setLoading(false);
      return;
    }

    try {
      let coverImageUrl = bookData.coverImageUrl;

      if (file) {
        const storageRef = ref(storage, `book-covers/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              coverImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, 'books_pending'), {
        title: bookData.title,
        author,
        description,
        isbn,
        coverImageUrl,
        category,
        createdAt: new Date(),
        status: 'pending',
      });

      // Reset form
      setIsbn('');
      setAuthor('');
      setFile(null);
      setCategory('');
      setDescription('');
      setError('');
      setLoading(false);
      
      alert('Book uploaded successfully and is awaiting admin approval.');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="card-header">
          <h1>Upload New Book</h1>
         
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              placeholder="Enter ISBN number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder="Enter author name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="art-design">Art & Design</option>
              <option value="business">Business</option>
              <option value="it-technology">IT & Technology</option>
              <option value="medicine">Medicine</option>
              <option value="science">Science</option>
              <option value="financial">Financial</option>
              <option value="audio-books">Audio Books</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter a detailed description (at least 200 characters)"
            />
          </div>

          <div className="form-group">
            <label>Cover Image (optional)</label>
            <div className="file-input-container">
              <label className="file-input-label" htmlFor="cover">
                Choose File
              </label>
              <input
                id="cover"
                className="file-input"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              {file && <span className="file-name">{file.name}</span>}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Uploading...
              </>
            ) : (
              'Upload Book'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookUpload;