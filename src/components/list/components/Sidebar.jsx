const GENRES = ['전체', '소설', '인문', '에세이', '경제/경영', 'IT/컴퓨터', '자기계발']

const GENRE_ICONS = {
  '전체': 'ti-layout-grid',
  '소설': 'ti-book',
  '인문': 'ti-bulb',
  '에세이': 'ti-feather',
  '경제/경영': 'ti-chart-line',
  'IT/컴퓨터': 'ti-code',
  '자기계발': 'ti-heart',
}

const styles = {
  sidebar: {
    width: 190,
    minWidth: 190,
    background: '#fff',
    borderRight: '0.5px solid rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px',
    borderBottom: '0.5px solid rgba(0,0,0,0.12)',
  },
  logoText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#1a1a18',
  },
  section: {
    padding: '12px 8px 4px',
    flex: 1,
    overflowY: 'auto',
  },
  label: {
    fontSize: 10,
    color: '#6b6b67',
    padding: '0 8px 8px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
  },
  item: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13,
    color: active ? '#1a1a18' : '#6b6b67',
    fontWeight: active ? 500 : 400,
    background: active ? '#f5f5f4' : 'none',
    border: 'none',
    textAlign: 'left',
    marginBottom: 2,
  }),
  badge: (active) => ({
    marginLeft: 'auto',
    fontSize: 10,
    background: active ? '#e6f1fb' : '#f5f5f4',
    color: active ? '#0c447c' : '#6b6b67',
    padding: '1px 7px',
    borderRadius: 20,
    border: active ? 'none' : '0.5px solid rgba(0,0,0,0.12)',
  }),
  divider: {
    height: 0.5,
    background: 'rgba(0,0,0,0.12)',
    margin: '6px 8px',
  },
}

export default function Sidebar({ genre, books, onSelectGenre }) {
  const countByGenre = (g) =>
    g === '전체' ? books.length : books.filter((b) => b.genre === g).length

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <i className="ti ti-books" style={{ fontSize: 18 }} />
        <span style={styles.logoText}>도서 관리</span>
      </div>

      <div style={styles.section}>
        <span style={styles.label}>카테고리</span>
        {GENRES.map((g) => (
          <button
            key={g}
            style={styles.item(genre === g)}
            onClick={() => onSelectGenre(g)}
          >
            <i className={`ti ${GENRE_ICONS[g]}`} style={{ fontSize: 15, flexShrink: 0 }} />
            {g}
            <span style={styles.badge(genre === g)}>{countByGenre(g)}</span>
          </button>
        ))}
        <div style={styles.divider} />
      </div>
    </aside>
  )
}
