import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import BookSection from './BookSection'

const Main = () => {
  const navigate = useNavigate()

  return (
    <div>
      <SearchBar />
      <BookSection onBookClick={(book) => navigate(`/books/${book.id}`)} />
    </div>
  )
}

export default Main
