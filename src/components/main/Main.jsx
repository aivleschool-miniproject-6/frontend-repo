import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import BookSection from './BookSection'
import RatingRankingSection from './RatingRankingSection'

const Main = () => {
  const navigate = useNavigate()
  const handleBookClick = (book) => navigate(`/books/${book.id}`)

  return (
    <div>
      <SearchBar />
      <BookSection onBookClick={handleBookClick} />
      <RatingRankingSection onBookClick={handleBookClick} />
    </div>
  )
}

export default Main
