import { AppBar, Toolbar, Typography, Button, Box, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: '홈', path: '/' },
  { label: '목록', path: '/books' },
  { label: '등록', path: '/books/new' },
]

function Header() {
  const location = useLocation()

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#D9D9D9' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 'auto', color: '#333' }}>
          BookWalk
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {navItems.map((item, index) => (
            <Box key={item.path} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* 구분선 */}
              {index !== 0 && (
                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#999' }} />
              )}
              <Button
                component={Link}
                to={item.path}
                sx={{
                  color: location.pathname === item.path ? '#333' : '#666',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              >
                {item.label}
              </Button>
            </Box>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header