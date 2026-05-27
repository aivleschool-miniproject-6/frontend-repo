import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './main.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/books?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>🔍</span>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

      </div>
    </div>
  );
};

export default SearchBar;