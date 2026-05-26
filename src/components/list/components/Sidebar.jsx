import styles from './Sidebar.module.css'

const ICONS = { ALL: 'ti-layout-grid', FAVORITES: 'ti-star' }

export default function Sidebar({ genre, books = [], favoriteIds = new Set(), onSelectGenre }) {
  const uniqueGenres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean)))
  const items = ['ALL', 'FAVORITES', ...uniqueGenres]

  const countBy = (g) => {
    if (g === 'ALL') return books.length
    if (g === 'FAVORITES') return books.filter((b) => favoriteIds.has(String(b.id))).length
    return books.filter((b) => b.genre === g).length
  }
  const labelOf = (g) => (g === 'ALL' ? '전체' : g === 'FAVORITES' ? '즐겨찾기' : g)
  const iconOf = (g) => (g in ICONS ? ICONS[g] : 'ti-book')

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <i className={`ti ti-books ${styles.logoIcon}`} />
        <span className={styles.logoText}>도서 관리</span>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>카테고리</span>
        {items.map((g) => (
          <button key={g} className={`${styles.item} ${genre === g ? styles.itemActive : ''}`} onClick={() => onSelectGenre(g)}>
            <i className={`ti ${iconOf(g)} ${styles.itemIcon}`} />
            <span className={styles.itemLabel}>{labelOf(g)}</span>
            <span className={styles.badge}>{countBy(g)}</span>
          </button>
        ))}
        <div className={styles.divider} />
      </div>
    </aside>
  )
}
