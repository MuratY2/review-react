import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Books.css';

const Books = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(category || 'all');

    const fetchBooks = async () => {
      setLoading(true);
      try {
        let q;
        if (selectedCategory === 'all') {
          q = query(collection(db, 'books_pending'), where('status', '==', 'approved'));
        } else {
          q = query(
            collection(db, 'books_pending'),
            where('category', '==', selectedCategory),
            where('status', '==', 'approved')
          );
        }
        
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [category, selectedCategory]);  

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>{selectedCategory !== 'all' ? `${selectedCategory.replace(/-/g, ' ')} Books` : 'All Books'}</h1>
      
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="all">All Categories</option>
        <option value="art-design">Art & Design</option>
        <option value="business">Business</option>
        <option value="it-technology">IT & Technology</option>
        <option value="medicine">Medicine</option>
        <option value="science">Science</option>
        <option value="financial">Financial</option>
        <option value="audio-books">Audio Books</option>
      </select>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name..."
      />

      {loading && <p>Loading books...</p>}

      <div className="book-list">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <img src={book.coverImageUrl} alt={`${book.title} cover`} />
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author}</p>
              <p>{book.description}</p>
            </div>
          ))
        ) : (
          <p>No books available.</p>
        )}
      </div>
    </div>
  );
};

export default Books;
