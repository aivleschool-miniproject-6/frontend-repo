import { useState, useEffect } from 'react';
import styles from './main.module.css';

const BookSection = ({ rankingBooks = [], newBooks = [], isLoading, onBookClick }) => {
  const [activeTab, setActiveTab] = useState('ranking');
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 4;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (isLoading) {
    return <div className={styles.bookSection}>데이터를 불러오는 중입니다...</div>;
  }

  const bookData = { ranking: rankingBooks, new: newBooks };
  const currentBooks = bookData[activeTab];

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex < currentBooks.length - itemsPerPage) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className={styles.bookSection}>
      <div className={styles.tabHeader}>
        <div className={styles.tabs}>
          <button
            className={activeTab === 'ranking' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('ranking')}
          >
            도서 랭킹
          </button>
          <button
            className={activeTab === 'new' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('new')}
          >
            신작
          </button>
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
            {currentBooks.map((book) => (
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
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${styles.arrowBtn} ${currentIndex >= currentBooks.length - itemsPerPage ? styles.disabledBtn : ''}`}
          onClick={nextSlide}
          disabled={currentIndex >= currentBooks.length - itemsPerPage}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default BookSection;