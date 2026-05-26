import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/common/Header/Header';
import Home from './components/pages/Home';
import BookListPage from './components/list/pages/BookListPage';
import BookFormPage from './components/list/pages/BookFormPage';
import BookCoverEditor from './components/edit/BookCoverEditor';

function BookListRoute() {
  const navigate = useNavigate();

  return <BookListPage onClickNew={() => navigate('/books/new')} />;
}

function BookFormRoute() {
  const navigate = useNavigate();
  const goList = () => navigate('/books');

  return <BookFormPage mode="new" onBack={goList} onSaved={goList} />;
}

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
          <Route path="/books" element={<BookListRoute />} />
          <Route path="/books/new" element={<BookFormRoute />} />
          <Route path="/cover-editor" element={<BookCoverEditor />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
