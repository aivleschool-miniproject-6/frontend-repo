import { useState } from 'react';
import styles from './main.module.css';

const BookSection = () => {
  // 현재 선택된 탭 상태 ('ranking' 또는 'new')
  const [activeTab, setActiveTab] = useState('ranking');

  // 나중에 서버에서 받아올 더미 데이터
  const bookData = {
    ranking: [
      { id: 1, title: '트렌드 코리아 2026', author: '김난도', img: 'https://picsum.photos/seed/1/200/300' },
      { id: 2, title: 'AI 시대의 생존법', author: '이철원', img: 'https://picsum.photos/seed/2/200/300' },
      { id: 3, title: '클린 코드', author: '로버트 C. 마틴', img: 'https://picsum.photos/seed/3/200/300' },
      { id: 4, title: '역행자', author: '자청', img: 'https://picsum.photos/seed/4/200/300' },
    ],
    new: [
      { id: 5, title: '리액트 디자인 패턴', author: '카를로스', img: 'https://picsum.photos/seed/5/200/300' },
      { id: 6, title: '자바스크립트 딥다이브', author: '이웅모', img: 'https://picsum.photos/seed/6/200/300' },
      { id: 7, title: '도둑맞은 집중력', author: '요한 하리', img: 'https://picsum.photos/seed/7/200/300' },
      { id: 8, title: '원씽', author: '게리 켈러', img: 'https://picsum.photos/seed/8/200/300' },
    ]
  };

  // 현재 활성화된 탭에 맞는 데이터만 가져옴
  const currentBooks = bookData[activeTab];

  return (
    <div className={styles.bookSection}>
      {/* 탭 헤더 부분 */}
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
        {/* <span className={styles.moreBtn}>더보기 +</span> */}
      </div>

      {/* 카드 슬라이더 부분 */}
      <div className={styles.carouselContainer}>
        <button className={styles.arrowBtn}>&lt;</button>
        
        <div className={styles.cardList}>
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

        <button className={styles.arrowBtn}>&gt;</button>
      </div>
    </div>
  );
};

export default BookSection;