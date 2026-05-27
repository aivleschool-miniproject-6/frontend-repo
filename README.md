# 📖 도서 관리 시스템 README.MD
KT AIVLE School AI 트랙 미니 프로젝트 4차 FrontEnd

<img src="https://github.com/user-attachments/assets/c4527184-1e44-4688-a68f-12df8db1f4b9">

## 📢 프로젝트 소개
- 누구나 작가가 되어 자유롭게 글을 집필하고 공개할 수 있는 창작 플랫폼입니다.
- 책을 사랑하는 사람이라면 누구나 간편하게 이용할 수 있도록 사용자 편의 UI를 제공합니다.
- 기존 플랫폼과 달리 작가의 감성과 이야기가 그대로 반영될 수 있는 AI 표지 제작을 지원합니다.

<br>

## 🗺️ 시스템 아키텍처

```mermaid
graph TD
    User(("👤 사용자"))
    Client["💻 FrontEnd<br>(React + Vite)"]
    AI["🤖 OpenAI API"]
    Server["🗄️ BackEnd<br>(json-server)"]

    User -- "1. 도서 등록/수정 내용 및<br>표지 프롬프트 입력" --> Client
    Client -- "2. 표지 프롬프트 전송" --> AI
    AI -- "3. 생성된 이미지 URL 반환" --> Client
    Client -- "4. 도서 정보 + 이미지 URL<br>최종 저장 요청 (POST/PATCH)" --> Server
    Server -- "5. 저장 완료 및 데이터 응답" --> Client
```
<br>

## ✨ 주요 기능
### 🎨 원하는 분위기의 AI 표지 생성 기능
- 스타일/배경·조명/타이포그래피 별 태그를 선택해 간편하게 원하는 분위기의 표지 생성 가능
- 프롬프트 작성으로 추가 디테일 적용 가능
- 1회 생성에 최대 3가지 표지 샘플 제공
- 도서 등록 이후에도 언제든지 AI 표지 수정 가능
  
### ✅ 카테고리 필터링 기능
- 도서 목록 화면에서 상세 검색 기능 없이도 장르 별 필터링 편의성 제공

### 🏆 도서 랭킹 제공 기능
- 메인 화면에서 조회수가 높은 순으로 인기 도서 랭킹 제공
- 메인 화면에서 출판일자 최신 순으로 신작 랭킹 제공

<br>

## 🛠 기술 스택
### Environment
<img src="https://img.shields.io/badge/VISUAL STUDIO CODE-181717?style=for-the-badge&logo=none&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">

### Development
<img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/vite-9135FF?style=for-the-badge&logo=vite&logoColor=black"> <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/OpenAI API-none?style=for-the-badge&logo=css3&logoColor=white">

### Communication
<img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"> <img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white"> <img src="https://img.shields.io/badge/zoom-0B5CFF?style=for-the-badge&logo=zoom&logoColor=white"> <img src="https://img.shields.io/badge/Microsoft Teams-181717?style=for-the-badge&logo=none&logoColor=white">

<br>

## 📂 프로젝트 구조

```text
Book-management/
├── public/         # 정적 파일 (파비콘, 아이콘 등)
├── src/
│   ├── assets/     # 이미지 및 UI 에셋
│   ├── components/ # 기능 및 페이지별 UI 컴포넌트
│   │   ├── common/ # 공통 컴포넌트 (Header)
│   │   ├── detail/ # 도서 상세 정보 영역
│   │   ├── edit/   # 도서 및 AI 표지 에디터 영역
│   │   ├── list/   # 도서 목록 렌더링 및 사이드바 영역
│   │   └── main/   # 메인 화면 및 검색바 영역
│   ├── pages/      # 라우팅되는 최상위 페이지 (Home, BookList 등)
│   ├── util/       # 공통 유틸리티 (bookCoverService)
│   ├── App.jsx     # 메인 라우터 및 상태 관리
│   └── main.jsx    # React 진입점
├── .env            # 환경 변수 (API 키 설정)
├── db.json         # 백엔드 Mock 데이터 (json-server)
├── package.json    # 프로젝트 의존성 라이브러리 명세
└── README.md       # 프로젝트 소개 문서
```

<br>

## 🚀 설치 및 실행

### Requirements
- npm
- react-router-dom 
- .env 파일에 VITE_OPENAI_API_KEY= 키 입력

### Installation
```sh
$ git clone https://github.com/BcKmini/Book-management.git
$ cd Book-management
```

### Backend
```sh
$ npm install -g json-server
$ npx json-server db.json --port 5000
```

### Frontend
```sh
$ npm install
$ npm install react-router-dom
$ npm run dev
```

<br>

## 🔌 API 엔드포인트

|구분|API 이름   |유형    |REST API   |
|--|---------|------|-----------|
|조회|도서 조회    |GET   |`/books`     |
|등록|도서 등록    |POST  |`/books`     |
|수정|도서 수정    |PATCH |`/books/{id}`|
|삭제|도서 삭제    |DELETE|`/books/{id}`|
|조회|도서 상세 조회 |GET   |`/books/{id}`|
|조회|도서 조회수 증가|GET   |`/books/{id}`|
|등록|AI 표지 생성 |POST  |`/v1/images/generations`|
|수정|AI 표지 저장 |PATCH |`/books/{id}`|
|수정|AI 표지 수정 |PATCH |`/books/{id}/cover-editor`|
  
<br>

## 🖼️ 화면 구성

|메인 화면   |도서 목록   |
|--------|--------|
|<img src="https://github.com/user-attachments/assets/1a76f89e-b3c5-41f8-ae42-61477d71240d">        |<img width="1895" height="908" alt="image" src="https://github.com/user-attachments/assets/b334a398-0247-411b-9d68-c69d7ff44bc5" />     |
|도서 검색 기능과 도서 랭킹 제공        |사이드바에서 장르별 모아보기 기능        |
|신규 도서 등록|도서 표지 생성|
|<img src="https://github.com/user-attachments/assets/7ed3444e-996e-4ec5-8382-4563cf8dcd52">        |<img src="https://github.com/user-attachments/assets/0ee21aeb-7347-4635-9ddb-c01a070ca8ca" />        |
|제목, 저자, 내용 등 정보 입력        |태그와 프롬프트를 입력하여 원하는 AI 표지 생성        |
|도서 상세 정보|AI 표지 수정|
|<img src="https://github.com/user-attachments/assets/cdb48da5-fde7-403f-b94d-5a024bb54017">        |<img src="https://github.com/user-attachments/assets/96d6a1dd-b497-4d69-b95d-184b4b1c12a2">        |
|등록한 도서 정보 내용 출력        |표지 수정도 생성 시와 동일        |

<br>

## 👥 팀원 및 R&R

|역할        |이름      |
|----------|--------|
|조장 / PM,기획|배수성     |
|UI,레이아웃   |김경민, 유지은|
|CRUD 연동   |황민서     |
|OpenAI    |박태정     |
|스타일링, QA  |이채은, 김다진|
|발표, 문서    |김다애     |
