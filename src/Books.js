import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Books.css';

const Books = () => {
  const { category } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryNames = {
    all: 'All Books',
    'art-design': 'Art & Design',
    business: 'Business',
    'it-technology': 'IT & Technology',
    medicine: 'Medicine',
    science: 'Science',
    financial: 'Financial',
    'audio-books': 'Audio Books',
  };

  const handleSort = useCallback((booksToSort, option) => {
    if (!booksToSort) return [];
    const sorted = [...booksToSort];
    switch (option) {
      case 'popularity':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      default:
        return sorted;
    }
  }, []);

  const filterBooks = useCallback((booksToFilter, term) => {
    if (!term) return booksToFilter;
    const lowercaseTerm = term.toLowerCase();
    return booksToFilter.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercaseTerm) ||
        book.author.toLowerCase().includes(lowercaseTerm)
    );
  }, []);

  const displayedBooks = useMemo(() => {
    let filtered = books;
    if (category && category !== 'all') {
      filtered = books.filter((book) => book.category === category);
    }
    filtered = filterBooks(filtered, searchTerm);
    return handleSort(filtered, sortOption);
  }, [books, category, searchTerm, sortOption, filterBooks, handleSort]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const booksRef = collection(db, 'books_pending');
        const q = query(booksRef, where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleViewChange = (newViewMode) => setViewMode(newViewMode);
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const currentCategory = category || 'all';

  return (
    <div className="books-page">
      <div className="books-hero">
        <h1>{categoryNames[currentCategory]}</h1>
        <p>Explore a wide range of books in {categoryNames[currentCategory]}.</p>
      </div>

      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span className="current">{categoryNames[currentCategory]}</span>
      </div>

      <div className="books-container">
        <div className="sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <ul className="category-list">
              {Object.entries(categoryNames).map(([key, name]) => (
                <li key={key}>
                  <Link
                    to={`/books/${key}`}
                    className={currentCategory === key ? 'active' : ''}
                  >
                    {name} ({books.filter((book) => key === 'all' || book.category === key).length})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="main-content">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="books-header">
            <p className="results-count">
              {loading ? 'Loading...' : `Showing ${displayedBooks.length} results`}
            </p>
            <div className="view-options">
              <button
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => handleViewChange('grid')}
              >
                Grid
              </button>
              <button
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewChange('list')}
              >
                List
              </button>
              <select
                className="sort-select"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="default">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="price-low">Sort by price: low to high</option>
                <option value="price-high">Sort by price: high to low</option>
              </select>
            </div>
          </div>

          <div className={`books-content-wrapper books-${viewMode}`}>
            {loading ? (
              <div className="loader">Loading...</div>
            ) : displayedBooks.length > 0 ? (
              displayedBooks.map((book) => (
                <Link
                  to={`/bookdetail/${book.id}`}
                  key={book.id}
                  className="book-card"
                >
                  <div className="book-image">
                    <img src={book.coverImageUrl} alt={`${book.title} cover`} />
                  </div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>By {book.author}</p>
                    <p>${book.price}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">No books found for this category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
