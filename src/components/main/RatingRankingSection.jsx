import { useState, useEffect } from 'react';
import styles from './main.module.css';

const RatingRankingSection = ({ onBookClick }) => {
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 4;

  useEffect(() => {
    const fetchRatingRanking = async () => {
      try {
        const [booksRes, commentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/books`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/comments`),
        ]);
        const booksData = await booksRes.json();
        const commentsData = await commentsRes.json();

        const ratingMap = {};
        commentsData.forEach((c) => {
          const bookId = String(c.booksId ?? c.book_id);
          if (!bookId || bookId === 'null' || !c.rating || c.rating <= 0) return;
          if (!ratingMap[bookId]) ratingMap[bookId] = { sum: 0, count: 0 };
          ratingMap[bookId].sum += c.rating;
          ratingMap[bookId].count += 1;
        });

        const ranked = booksData
          .filter((book) => ratingMap[String(book.id)])
          .map((book) => {
            const r = ratingMap[String(book.id)];
            return { ...book, avgRating: r.sum / r.count, ratingCount: r.count };
          })
          .sort((a, b) => b.avgRating - a.avgRating || b.ratingCount - a.ratingCount)
          .slice(0, 60);

        setBooks(ranked);
        setIsLoading(false);
      } catch (error) {
        console.error('별점 랭킹 데이터를 불러오는 중 오류가 발생했습니다:', error);
        setIsLoading(false);
      }
    };

    fetchRatingRanking();
  }, []);

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
                  <div className={styles.ratingBadge}>
                    <span className={styles.starIcon}>&#9733;</span>
                    <span>{book.avgRating.toFixed(1)}</span>
                    <span className={styles.ratingCount}>({book.ratingCount})</span>
                  </div>
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
