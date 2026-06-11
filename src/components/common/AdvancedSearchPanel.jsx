import styles from './AdvancedSearchPanel.module.css'

const PRICE_MAX = 100000

export default function AdvancedSearchPanel({ filters, onChange, onReset }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        {/* 출판사 */}
        <div className={styles.field}>
          <label className={styles.label}>출판사</label>
          <input
            className={styles.input}
            type="text"
            placeholder="출판사명 입력"
            value={filters.publisher}
            onChange={(e) => set('publisher', e.target.value)}
          />
        </div>

        {/* 출판일 범위 */}
        <div className={styles.field}>
          <label className={styles.label}>출판일</label>
          <div className={styles.dateRange}>
            <input
              className={styles.dateInput}
              type="date"
              value={filters.pubDateFrom}
              onChange={(e) => set('pubDateFrom', e.target.value)}
            />
            <span className={styles.dateSep}>~</span>
            <input
              className={styles.dateInput}
              type="date"
              value={filters.pubDateTo}
              onChange={(e) => set('pubDateTo', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.row}>
        {/* 가격 범위 */}
        <div className={styles.field}>
          <label className={styles.label}>가격 범위</label>
          <div className={styles.priceInputWrap}>
            <input
              className={`${styles.priceInput} ${filters.priceMin > 0 && filters.priceMax < PRICE_MAX && filters.priceMin > filters.priceMax ? styles.priceInputError : ''}`}
              type="text"
              inputMode="numeric"
              placeholder="최소 금액"
              value={filters.priceMin === 0 ? '' : filters.priceMin}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                set('priceMin', v === '' ? 0 : Number(v))
              }}
            />
            <span className={styles.dateSep}>~</span>
            <input
              className={`${styles.priceInput} ${filters.priceMin > 0 && filters.priceMax < PRICE_MAX && filters.priceMin > filters.priceMax ? styles.priceInputError : ''}`}
              type="text"
              inputMode="numeric"
              placeholder="최대 금액"
              value={filters.priceMax === PRICE_MAX ? '' : filters.priceMax}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                set('priceMax', v === '' ? PRICE_MAX : Number(v))
              }}
            />
            <span className={styles.priceUnit}>원</span>
          </div>
          {filters.priceMin > 0 && filters.priceMax < PRICE_MAX && filters.priceMin > filters.priceMax && (
            <span className={styles.priceError}>최솟값이 최댓값보다 클 수 없습니다.</span>
          )}
        </div>

        {/* 별점 */}
        <div className={styles.field}>
          <label className={styles.label}>최소 별점</label>
          <div className={styles.starRow}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`${styles.starBtn} ${filters.minRating === n ? styles.starActive : ''}`}
                onClick={() => set('minRating', n)}
                type="button"
              >
                {n === 0 ? '전체' : '★'.repeat(n)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.resetBtn} onClick={onReset} type="button">
          <i className="ti ti-refresh" /> 초기화
        </button>
      </div>
    </div>
  )
}

export const DEFAULT_ADVANCED_FILTERS = {
  publisher: '',
  pubDateFrom: '',
  pubDateTo: '',
  priceMin: 0,
  priceMax: PRICE_MAX,
  minRating: 0,
}
