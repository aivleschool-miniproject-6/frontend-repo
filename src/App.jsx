import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/common/Header/Header';
import Home from './components/pages/Home';
import BookList from './components/pages/BookList';
import BookForm from './components/pages/BookForm';

function App() {
  return (
    <BrowserRouter>
      {/* Header를 Routes 밖에 위치시켜 모든 페이지에서 공통으로 보이도록 합니다. */}
      <Header />

      {/* AppBar의 position="fixed" 때문에 컨텐츠가 가려지는 것을 방지하기 위해
          Header의 높이(기본 64px)만큼 상단에 padding을 추가합니다. */}
      <Box component="main" sx={{ pt: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookForm />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;