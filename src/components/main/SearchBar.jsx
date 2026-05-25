import styles from './main.module.css';

const SearchBar = () => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>🔍</span>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="검색어를 입력하세요" 
        />
        <button className={styles.addBtn}>+</button>
      </div>
    </div>
  );
};

export default SearchBar;