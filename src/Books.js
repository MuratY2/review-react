import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Books.css';


const Books = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedCategory(category || 'all');
    // Fetch books based on category or fetch all if no category is specified
  }, [category]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    // Fetch new category books
  };

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
      {/* Display books here */}
    </div>
  );
};

export default Books;
