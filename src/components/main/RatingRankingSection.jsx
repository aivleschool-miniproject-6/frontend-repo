import { useState } from 'react';
import styles from './main.module.css';

const RatingRankingSection = ({ books = [], isLoading, onBookClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 4;

  if (isLoading) {
    return <div className={styles.bookSection}>별점 랭킹을 불러오는 중입니다...</div>;
  }

  if (books.length === 0) {
    return (
      <div className={styles.bookSection}>
        <div className={styles.tabHeader}>
          <div className={styles.tabs}>
            <span className={styles.activeTab}>별점 랭킹</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#9b9b95' }}>아직 별점이 등록된 도서가 없습니다.</p>
      </div>
    );
  }

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (currentIndex < books.length - itemsPerPage) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className={styles.bookSection}>
      <div className={styles.tabHeader}>
        <div className={styles.tabs}>
          <span className={styles.activeTab}>별점 랭킹</span>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        <button
          className={`${styles.arrowBtn} ${currentIndex === 0 ? styles.disabledBtn : ''}`}
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          &lt;
        </button>

        <div className={styles.sliderWindow}>
          <div
            className={styles.cardList}
            style={{ transform: `translateX(calc(-${currentIndex} * (25% + 6px)))` }}
          >
            {books.map((book) => (
              <div
                key={book.id}
                className={styles.card}
                onClick={() => onBookClick?.(book)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBookClick?.(book);
                  }
                }}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/200/300`}
                    alt={book.title}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  {book.averageRating > 0 && (
                    <div className={styles.ratingBadge}>
                      <span className={styles.starIcon}>&#9733;</span>
                      <span>{book.averageRating.toFixed(1)}</span>
                      <span className={styles.ratingCount}>({book.ratingCount})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${styles.arrowBtn} ${currentIndex >= books.length - itemsPerPage ? styles.disabledBtn : ''}`}
          onClick={nextSlide}
          disabled={currentIndex >= books.length - itemsPerPage}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default RatingRankingSection;
