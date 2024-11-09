// File: src/BookUpload.js
import React, { useState } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

const BookUpload = () => {
  const [isbn, setIsbn] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const fetchBookData = async (isbn) => {
    try {
      console.log("Fetching data for ISBN:", isbn);
      const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`);
      const bookData = response.data[`ISBN:${isbn}`];
  
      console.log("Fetched book data:", bookData); 
  
      if (!bookData) {
        alert("Invalid ISBN or book not found.");
        return null;
      }
  
      const title = bookData.info_url.split('/').pop();
      const author = 'Unknown Author'; 
      const coverImageUrl = bookData.thumbnail_url || ''; 
      const description = 'No description available'; 
  
      return {
        title,
        author,
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
        author: bookData.author,
        description: bookData.description,
        isbn,
        coverImageUrl,
        createdAt: new Date(),
        status: 'pending',
      });

      alert('Book uploaded successfully and is awaiting admin approval.');
      setIsbn('');
      setFile(null);
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
