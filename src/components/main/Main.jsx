import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import BookSection from './BookSection'
import RatingRankingSection from './RatingRankingSection'

const Main = () => {
  const navigate = useNavigate()
  const handleBookClick = (book) => navigate(`/books/${book.id}`)

  const [ranking, setRanking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/ranking?limit=30`)
        const data = await res.json()
        setRanking(data)
      } catch (error) {
        console.error('랭킹 데이터를 불러오는 중 오류가 발생했습니다:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRanking()
  }, [])

  return (
    <div>
      <SearchBar />
      <BookSection
        rankingBooks={ranking?.viewCount ?? []}
        newBooks={ranking?.pubDate ?? []}
        isLoading={isLoading}
        onBookClick={handleBookClick}
      />
      <RatingRankingSection
        books={ranking?.rating ?? []}
        isLoading={isLoading}
        onBookClick={handleBookClick}
      />
    </div>
  )
}

export default Main
