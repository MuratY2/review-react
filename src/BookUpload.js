// File: src/BookUpload.js
import React, { useState } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

const BookUpload = () => {
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState(''); 
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');  
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);  
  };

  const fetchBookData = async (isbn) => {
    try {
      console.log("Fetching data for ISBN:", isbn);
      const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const bookData = response.data[`ISBN:${isbn}`];
  
      console.log("Fetched book data:", bookData); 
  
      if (!bookData) {
        alert("Invalid ISBN or book not found.");
        return null;
      }
  
      const title = bookData.title || 'Unknown Title';
      const coverImageUrl = bookData.cover ? bookData.cover.medium : ''; 
      const description = bookData.description ? bookData.description.value || bookData.description : 'No description available'; 
  
      return {
        title,
        coverImageUrl,
        description,
      };
    } catch (error) {
      console.error("Error fetching book data:", error);
      alert("Error retrieving book details. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!category) {
      alert('Please select a category.');
      return;
    }

    if (!author) {
      alert('Please enter the author.');
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
        description: bookData.description,
        isbn,
        coverImageUrl,
        category, 
        createdAt: new Date(),
        status: 'pending',
      });

      alert('Book uploaded successfully and is awaiting admin approval.');
      setIsbn('');
      setAuthor(''); 
      setFile(null);
      setCategory('');  
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto' }}>
      <label>
        ISBN:
        <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
      </label>

      <label>
        Author:
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
      </label>
      
      <label>
        Category:
        <select value={category} onChange={handleCategoryChange} required>
          <option value="">Select Category</option>
          <option value="art-design">Art & Design</option>
          <option value="business">Business</option>
          <option value="it-technology">IT & Technology</option>
          <option value="medicine">Medicine</option>
          <option value="science">Science</option>
          <option value="financial">Financial</option>
          <option value="audio-books">Audio Books</option>
        </select>
      </label>

      <label>
        Cover Image (optional):
        <input type="file" onChange={handleFileChange} />
      </label>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Book'}
      </button>
    </form>
  );
};

export default BookUpload;
