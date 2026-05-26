import { useState, useEffect } from 'react';
import styles from './main.module.css';

const BookSection = () => {
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

        /*
        추후 변경해야할 부분
        1. 도서 랭킹
        - 기준: 책 상세 페이지 방문자 수(views)가 많은 순으로 내림차순 정렬
        - 참고: DB 데이터에 'views'라는 조회수 속성이 있다고 가정
        const rankingBooks = [...data]
          .sort((a, b) => b.views - a.views)
          .slice(0, 20); // 상위 20개만 랭킹으로 사용
        */
        const rankingBooks = data.slice(0, 60); // 임시로 (60개 카드만 보여주게 기능)
        /*
        2. 신작 (newBooks)
        - 기준: 'pubDate'를 기준으로 현재 날짜에서 정확히 최근 1달 이내에 나온 책
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // 정확히 1달 전 날짜 계산
        
        const newBooks = data.filter(book => {
          const publishedDate = new Date(book.pubDate);
          return publishedDate >= oneMonthAgo;
        }).slice(0, 20); // 신작 중 최대 20개 
        */
        const newBooks = data.slice(60, 120); // (현재 임시 로직)

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
              <div key={book.id} className={styles.card}>
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