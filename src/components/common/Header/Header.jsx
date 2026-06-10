import { AppBar, Toolbar, Typography, Button, Box, Divider } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const navItems = [
  { label: '홈', path: '/' },
  { label: '목록', path: '/books' },
  { label: '등록', path: '/books/new' },
]

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#D9D9D9' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 'auto', color: '#333' }}>
          BookWalk
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {navItems.map((item, index) => (
            <Box key={item.path} sx={{ display: 'flex', alignItems: 'center' }}>
              {index !== 0 && (
                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#999' }} />
              )}
              <Button
                component={Link}
                to={item.path}
                sx={{
                  color: location.pathname === item.path ? '#333' : '#666',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              >
                {item.label}
              </Button>
            </Box>
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#999' }} />

          {isLoggedIn ? (
            <>
              <Button
                component={Link}
                to="/mypage"
                sx={{
                  color: location.pathname === '/mypage' ? '#333' : '#666',
                  fontWeight: location.pathname === '/mypage' ? 'bold' : 'normal',
                }}
              >
                {user?.nickname ?? '마이페이지'}
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#999' }} />
              <Button onClick={handleLogout} sx={{ color: '#666' }}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              sx={{
                color: location.pathname === '/login' ? '#333' : '#666',
                fontWeight: location.pathname === '/login' ? 'bold' : 'normal',
              }}
            >
              로그인
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
