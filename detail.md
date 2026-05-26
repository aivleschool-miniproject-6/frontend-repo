```jsx
// 특정 책 카드를 클릭했을 때 실행되는 함수
const handleBookClick = async (book) => {
  try {
    // 1. 기존 조회수에 1을 더한 값을 준비해야하고
    const newViews = (book.views || 0) + 1;

    // 2. json-server에 해당 책(id)의 views 값만 수정하라고 요청(PATCH)을 보낸다
    const response = await fetch(`http://localhost:5000/books/${book.id}`, {
      method: 'PATCH', // PATCH사용해주고
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        views: newViews // 업데이트할 항목과 값을 뿌려줘서
      })
    });

    if (response.ok) {
      console.log(`${book.title}의 조회수가 ${newViews}로 올랐다`); // (개발자도구 콘솔로 확인 하면 되지 않을까)
    }
  } catch (error) {
    console.error('조회수 업데이트 중 오류 발생:', error);
  }
};
```