import { X, Home, Film, Tv, Gamepad2, Radio, User, Settings, Mic } from 'lucide-react'
import './MobileMenu.css'

const MobileMenu = ({ isOpen, onClose, onVoiceSearch }) => {
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
        </div>          <nav className="mobile-nav">
          <button className="mobile-voice-btn" onClick={() => { onVoiceSearch(); onClose(); }}>
            <Mic size={20} />
            <span>Voice Search</span>
          </button>
          <a href="#home" className="mobile-nav-link active">
            <Home size={20} />
            <span>Home</span>
          </a>
          <a href="#movies" className="mobile-nav-link">
            <Film size={20} />
            <span>Movies</span>
          </a>
          <a href="#tv-shows" className="mobile-nav-link">
            <Tv size={20} />
            <span>TV Shows</span>
          </a>
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
          <a href="#profile" className="mobile-nav-link">
            <User size={20} />
            <span>Profile</span>
          </a>
          <a href="#settings" className="mobile-nav-link">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
