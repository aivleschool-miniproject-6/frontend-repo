import { useState, useEffect } from 'react';
import styles from './main.module.css';

const BookSection = () => {
  const [activeTab, setActiveTab] = useState('ranking');
  const [currentIndex, setCurrentIndex] = useState(0); 
  // dummy data - 실제로는 json-server에서 받아올 예정
  const bookData = {
    ranking: [
      { id: 1, title: '트렌드 코리아 2026', author: '김난도', img: 'https://picsum.photos/seed/1/200/300' },
      { id: 2, title: 'AI 시대의 생존법', author: '이철원', img: 'https://picsum.photos/seed/2/200/300' },
      { id: 3, title: '클린 코드', author: '로버트 C. 마틴', img: 'https://picsum.photos/seed/3/200/300' },
      { id: 4, title: '역행자', author: '자청', img: 'https://picsum.photos/seed/4/200/300' },
      { id: 5, title: '역자', author: '자청', img: 'https://picsum.photos/seed/5/200/300' },
    ],
    new: [
      { id: 6, title: '리액트 디자인 패턴', author: '카를로스', img: 'https://picsum.photos/seed/6/200/300' },
      { id: 7, title: '자바스크립트 딥다이브', author: '이웅모', img: 'https://picsum.photos/seed/7/200/300' },
      { id: 8, title: '도둑맞은 집중력', author: '요한 하리', img: 'https://picsum.photos/seed/8/200/300' },
      { id: 9, title: '원씽', author: '게리 켈러', img: 'https://picsum.photos/seed/9/200/300' },
      { id: 10, title: '씽', author: '켈러', img: 'https://picsum.photos/seed/10/200/300' },
      { id: 11, title: '추가된 책', author: '테스터', img: 'https://picsum.photos/seed/11/200/300' },
    ]
  };



  // 슬라이드 
  const currentBooks = bookData[activeTab];
  const itemsPerPage = 4; 
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

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

      {/* 카드 슬라이더 부분 */}
      <div className={styles.carouselContainer}>
        <button 
          className={`${styles.arrowBtn} ${currentIndex === 0 ? styles.disabledBtn : ''}`} 
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          &lt;
        </button>
        
        {/* 보여지는 화면을 제한하는 창 역할 */}
        <div className={styles.sliderWindow}>
          <div 
            className={styles.cardList}
            style={{ transform: `translateX(calc(-${currentIndex} * (25% + 6px)))` }}
          >
            {currentBooks.map((book) => (
              <div key={book.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={book.img} alt={book.title} />
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