import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearchPanel, { DEFAULT_ADVANCED_FILTERS, PRICE_MAX } from '../common/AdvancedSearchPanel';
import styles from './main.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advFilters, setAdvFilters] = useState(DEFAULT_ADVANCED_FILTERS);
  const navigate = useNavigate();

  const hasAdvanced =
    advFilters.publisher !== DEFAULT_ADVANCED_FILTERS.publisher ||
    advFilters.pubDateFrom !== DEFAULT_ADVANCED_FILTERS.pubDateFrom ||
    advFilters.pubDateTo !== DEFAULT_ADVANCED_FILTERS.pubDateTo ||
    advFilters.priceMin !== DEFAULT_ADVANCED_FILTERS.priceMin ||
    advFilters.priceMax !== DEFAULT_ADVANCED_FILTERS.priceMax ||
    advFilters.minRating !== DEFAULT_ADVANCED_FILTERS.minRating;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (advFilters.publisher) params.set('publisher', advFilters.publisher);
    if (advFilters.pubDateFrom) params.set('pubDateFrom', advFilters.pubDateFrom);
    if (advFilters.pubDateTo) params.set('pubDateTo', advFilters.pubDateTo);
    if (advFilters.priceMin > 0) params.set('priceMin', String(advFilters.priceMin));
    if (advFilters.priceMax < PRICE_MAX) params.set('priceMax', String(advFilters.priceMax));
    if (advFilters.minRating > 0) params.set('minRating', String(advFilters.minRating));
    navigate(`/books?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBoxWrap}>
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
          <button
            className={`${styles.advToggleBtn} ${advancedOpen ? styles.advToggleActive : ''} ${hasAdvanced ? styles.advToggleDot : ''}`}
            onClick={() => setAdvancedOpen((v) => !v)}
            title="상세검색"
            type="button"
          >
            <span style={{ fontSize: '0.9rem' }}>상세검색</span>
            <i className={`ti ${advancedOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '0.85rem' }} />
          </button>
          <button className={styles.searchBtn} onClick={handleSearch} type="button">
            검색
          </button>
        </div>

        {advancedOpen && (
          <div className={styles.advPanelWrap}>
            <AdvancedSearchPanel
              filters={advFilters}
              onChange={setAdvFilters}
              onReset={() => setAdvFilters(DEFAULT_ADVANCED_FILTERS)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
