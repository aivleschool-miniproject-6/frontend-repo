import { getCoverColor, fmtDate } from './BookCard'

const styles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    padding: '18px 22px',
    borderBottom: '0.5px solid rgba(0,0,0,0.10)',
    cursor: 'pointer',
    background: '#fff',
    transition: 'background 0.15s',
  },
  rank: {
    width: 32,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 500,
    color: '#1a1a18',
    flexShrink: 0,
    lineHeight: 1,
  },
  rankSub: {
    fontSize: 11,
    color: '#6b6b67',
    fontWeight: 400,
  },
  cover: (bg) => ({
    width: 88,
    height: 116,
    borderRadius: 6,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '0.5px solid rgba(0,0,0,0.10)',
    overflow: 'hidden',
    boxShadow: '2px 3px 8px rgba(0,0,0,0.10)',
  }),
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    color: '#1a1a18',
    marginBottom: 5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  author: {
    fontSize: 13,
    color: '#6b6b67',
    marginBottom: 8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tags: {
    display: 'flex',
    gap: 5,
  },
  tag: {
    fontSize: 11,
    padding: '3px 9px',
    borderRadius: 20,
    background: '#f5f5f4',
    color: '#6b6b67',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  price: {
    fontSize: 15,
    fontWeight: 500,
    color: '#1a1a18',
  },
  date: {
    fontSize: 12,
    color: '#6b6b67',
  },
}

export default function BookListItem({ book, rank, onClick }) {
  const { bg, ic } = getCoverColor(book.genre)

  return (
    <div style={styles.item} onClick={onClick}>
      <div style={styles.rank}>
        {rank}
        <div style={styles.rankSub}>위</div>
      </div>
      <div style={styles.cover(bg)}>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} style={styles.coverImg} />
        ) : (
          <i className="ti ti-book" style={{ fontSize: 36, color: ic }} />
        )}
      </div>
      <div style={styles.info}>
        <div style={styles.title}>{book.title}</div>
        <div style={styles.author}>{book.author} · {book.publisher}</div>
        <div style={styles.tags}>
          <span style={styles.tag}>{book.genre}</span>
          <span style={styles.tag}>{fmtDate(book.pubDate)}</span>
          <span style={styles.tag}>{book.pages}쪽</span>
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.price}>{book.price?.toLocaleString()}원</div>
        <div style={styles.date}>{book.pubDate}</div>
      </div>
    </div>
  )
}
