import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Books.css';

const Books = () => {
  const { category } = useParams();
  const [books, setBooks] = useState([]);
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

  // Memoize the sorting function
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

  // Memoize the filtering function
  const filterBooks = useCallback((booksToFilter, term) => {
    if (!term) return booksToFilter;
    
    const lowercaseTerm = term.toLowerCase();
    return booksToFilter.filter(
      (book) =>
        book.title.toLowerCase().includes(lowercaseTerm) ||
        book.author.toLowerCase().includes(lowercaseTerm)
    );
  }, []);

  // Memoize the displayed books calculation
  const displayedBooks = useMemo(() => {
    let filtered = books;
    
    // Only filter by category if it's not 'all' and category is defined
    if (category && category !== 'all') {
      filtered = books.filter(book => book.category === category);
    }
    
    filtered = filterBooks(filtered, searchTerm);
    return handleSort(filtered, sortOption);
  }, [books, category, searchTerm, sortOption, filterBooks, handleSort]);

  // Fetch books only when mounted
  useEffect(() => {
    const fetchBooks = async () => {
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
      }
    };

    fetchBooks();
  }, []);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get current category for display
  const currentCategory = category || 'all';

  return (
    <div className="books-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span className="current">{categoryNames[currentCategory]}</span>
      </div>

      <h1 className="category-title">{categoryNames[currentCategory]}</h1>

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
                    {name} ({books.filter((book) =>
                      key === 'all' ? true : book.category === key
                    ).length})
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
              Showing {displayedBooks.length} results
            </p>
            <div className="view-options">
              <div className="view-buttons">
                <button
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewChange('grid')}
                  aria-label="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="0" y="0" width="7" height="7" />
                    <rect x="9" y="0" width="7" height="7" />
                    <rect x="0" y="9" width="7" height="7" />
                    <rect x="9" y="9" width="7" height="7" />
                  </svg>
                </button>
                <button
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => handleViewChange('list')}
                  aria-label="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="0" y="0" width="16" height="4" />
                    <rect x="0" y="6" width="16" height="4" />
                    <rect x="0" y="12" width="16" height="4" />
                  </svg>
                </button>
              </div>
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

          <div className="books-content-wrapper">
            <div className={`books-${viewMode}`}>
              {displayedBooks.length > 0 ? (
                displayedBooks.map((book) => (
                  <Link
                    to={`/bookdetail/${book.id}`}
                    key={book.id}
                    className={`book-card ${viewMode === 'list' ? 'list-card' : ''}`}
                  >
                    <div className="book-image">
                      {book.isHot && <span className="hot-label">HOT</span>}
                      <img src={book.coverImageUrl} alt={`${book.title} cover`} />
                    </div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="author">By {book.author}</p>
                      {book.price && <p className="price">${book.price}</p>}
                      {viewMode === 'list' && book.description && (
                        <p className="description">{book.description}</p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-container">
                  <div className="empty-message">No books found. Try a different search.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;