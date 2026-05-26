import { useState, useEffect } from 'react';
import styles from './main.module.css';

const BookSection = ({ onBookClick }) => {
  const [activeTab, setActiveTab] = useState('ranking');
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bookData, setBookData] = useState({ ranking: [], new: [] });
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 4;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/books');
        const data = await response.json();

        // 1. 도서 랭킹: 조회수(viewCount)가 많은 순으로 내림차순 정렬
        const rankingBooks = [...data]
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 60);

        // 2. 신작: 출간일(pubDate)이 최근인 순으로 내림차순 정렬
        const newBooks = [...data]
          .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
          .slice(0, 60);

        setBookData({
          ranking: rankingBooks,
          new: newBooks
        });
        setIsLoading(false);
      } catch (error) {
        console.error('도서 데이터를 불러오는 중 오류가 발생했습니다:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  if (isLoading) {
    return <div className={styles.bookSection}>데이터를 불러오는 중입니다...</div>;
  }

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
                  {/*}
                   추후 직접 생성한 표지로 변경
                  - 나중에 DB의 'coverImageUrl'에 실제 이미지 주소가 정상적으로 채워지면,
                    fallback 로직(|| 뒤에 있는 랜덤 이미지)을 지우고  사용
                    
                  <img src={book.coverImageUrl} alt={book.title} /> 
                  */}
                  <img
                    src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/200/300`}
                    alt={book.title}
                  />
                </div>
                <div className={styles.cardInfo}>
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>

                  {/* 조회수 UI 제거 */}
                  {/* <div style={{ fontSize: '11px', color: '#6b6b67', marginTop: '4px' }}>
                    조회수: {Number(book.viewCount || 0).toLocaleString()}회
                  </div> */}


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
