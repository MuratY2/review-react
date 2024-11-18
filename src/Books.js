import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Books.css';

const Books = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [books, setBooks] = useState([]);
  const [priceRange, setPriceRange] = useState([30, 60]);

  const categoryNames = {
    'all': 'All Books',
    'art-design': 'Art & Design',
    'business': 'Business',
    'it-technology': 'IT & Technology',
    'medicine': 'Medicine',
    'science': 'Science',
    'financial': 'Financial',
    'audio-books': 'Audio Books'
  };

  useEffect(() => {
    setSelectedCategory(category || 'all');

    const fetchBooks = async () => {
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
      }
    };

    fetchBooks();
  }, [category, selectedCategory]);

  const handlePriceFilter = () => {
    console.log('Filtering by price range:', priceRange);
  };

  return (
    <div className="books-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span className="current">{categoryNames[selectedCategory]}</span>
      </div>

      <h1 className="category-title">{categoryNames[selectedCategory]}</h1>

      <div className="books-container">
        <div className="sidebar">
          <div className="filter-section">
            <h3>Filter by price</h3>
            <div className="price-range">
              <span>Price: ${priceRange[0]} — ${priceRange[1]}</span>
              <button className="filter-button" onClick={handlePriceFilter}>FILTER</button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Categories</h3>
            <ul className="category-list">
              {Object.entries(categoryNames).map(([key, name]) => (
                <li key={key}>
                  <button 
                    className={selectedCategory === key ? 'active' : ''}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {name} ({books.filter(book => book.category === key).length})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="main-content">
          <div className="books-header">
            <p>Showing all {books.length} results</p>
            <div className="view-options">
              <button className="grid-view">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="0" y="0" width="7" height="7"/>
                  <rect x="9" y="0" width="7" height="7"/>
                  <rect x="0" y="9" width="7" height="7"/>
                  <rect x="9" y="9" width="7" height="7"/>
                </svg>
              </button>
              <button className="list-view">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="0" y="0" width="16" height="4"/>
                  <rect x="0" y="6" width="16" height="4"/>
                  <rect x="0" y="12" width="16" height="4"/>
                </svg>
              </button>
              <select className="sort-select">
                <option>Default sorting</option>
                <option>Sort by popularity</option>
                <option>Sort by price: low to high</option>
                <option>Sort by price: high to low</option>
              </select>
              <button className="filter-toggle">Filter</button>
            </div>
          </div>

          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-image">
                  {book.isHot && <span className="hot-label">HOT</span>}
                  <img src={book.coverImageUrl} alt={`${book.title} cover`} />
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">By {book.author}</p>
                  <p className="price">${book.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;