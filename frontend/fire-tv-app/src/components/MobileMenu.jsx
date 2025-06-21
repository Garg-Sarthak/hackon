import { X, Home, Film, Tv, Clock, Gamepad2, Radio, User, Settings, Mic, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import './MobileMenu.css'

const MobileMenu = ({ isOpen, onClose, onVoiceSearch, user, onSignOut }) => {
  const location = useLocation()
  
  const handleSignOut = async () => {
    onClose()
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
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div className="mobile-menu-content">
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <span className="logo-text">Fire<span className="logo-accent">TV</span></span>
            <span className="logo-subtitle">AI Enhanced</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {user && (
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              <User size={24} />
            </div>
            <div className="mobile-user-details">
              <div className="mobile-user-name">
                {user.user_metadata?.display_name || 'User'}
              </div>
              <div className="mobile-user-email">{user.email}</div>
            </div>
          </div>
        )}
        
        <nav className="mobile-nav">
          <button className="mobile-voice-btn" onClick={() => { onVoiceSearch(); onClose(); }}>
            <Mic size={20} />
            <span>Voice Search</span>
          </button>
          <Link to="/" className={`mobile-nav-link ${isActiveLink('/') ? 'active' : ''}`} onClick={onClose}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <a href="#movies" className="mobile-nav-link" onClick={onClose}>
            <Film size={20} />
            <span>Movies</span>
          </a>
          <a href="#tv-shows" className="mobile-nav-link" onClick={onClose}>
            <Tv size={20} />
            <span>TV Shows</span>
          </a>
          <Link to="/history" className={`mobile-nav-link ${isActiveLink('/history') ? 'active' : ''}`} onClick={onClose}>
            <Clock size={20} />
            <span>History</span>
          </Link>
          <a href="#sports" className="mobile-nav-link">
            <Gamepad2 size={20} />
            <span>Sports</span>
          </a>
          <a href="#live" className="mobile-nav-link">
            <Radio size={20} />
            <span>Live</span>
          </a>
        </nav>
        
        <div className="mobile-menu-footer">
          <a href="#settings" className="mobile-nav-link">
            <Settings size={20} />
            <span>Settings</span>
          </a>
          <button className="mobile-nav-link sign-out-btn" onClick={handleSignOut}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
