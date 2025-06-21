import { Search, Menu, User, Mic, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header = ({ onMenuToggle, onVoiceSearch, user, onSignOut }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleSignOut = async () => {
    setShowUserMenu(false)
    if (onSignOut) {
      await onSignOut()
    }
  }

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header-container container">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuToggle}>
            <Menu size={24} />
          </button>
          <button className="voice-btn" onClick={onVoiceSearch}>
            <Mic size={18} />
            <span>Voice</span>
          </button>
          <Link to="/" className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/movies" className={`nav-link ${isActiveLink('/movies') ? 'active' : ''}`}>Movies</Link>
          <Link to="/tv-shows" className={`nav-link ${isActiveLink('/tv-shows') ? 'active' : ''}`}>TV Shows</Link>
          <Link to="/movies" className={`nav-link ${isActiveLink('/movies') ? '' : ''}`}>Watch Party</Link>
          <Link to="/history" className={`nav-link history-link ${isActiveLink('/history') ? 'active' : ''}`}>Watch Again</Link>
        </nav>
        
        <div className="header-right">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search movies, shows..." 
              className="search-input"
            />
          </div>
          
          <div className="user-menu-container">
            <button className="user-profile" onClick={handleUserClick}>
              <User size={24} />
              {user && (
                <span className="user-name">
                  {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                </span>
              )}
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={32} />
                  </div>
                  <div className="user-details">
                    <div className="user-display-name">
                      {user?.user_metadata?.display_name || 'User'}
                    </div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                
                <div className="user-menu-divider"></div>
                
                <button className="user-menu-item">
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                
                <button className="user-menu-item sign-out" onClick={handleSignOut}>
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      {showUserMenu && (
        <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)}></div>
      )}
    </header>
  )
}

export default Header
