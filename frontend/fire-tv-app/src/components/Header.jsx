import { Search, Menu, User, Mic } from 'lucide-react'
import './Header.css'

const Header = ({ onMenuToggle }) => {
  return (
    <header className="header">
      <div className="header-container container">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuToggle}>
            <Menu size={24} />
          </button>
          <div className="logo">
            <span className="logo-text">Fire<span className="logo-accent">TV</span></span>
            <span className="logo-subtitle">AI Enhanced</span>
          </div>
        </div>
          <nav className="nav-menu">
          <button className="voice-btn">
            <Mic size={18} />
            <span>Voice</span>
          </button>
          <a href="#home" className="nav-link active">Home</a>
          <a href="#movies" className="nav-link">Movies</a>
          <a href="#tv-shows" className="nav-link">TV Shows</a>
          <a href="#sports" className="nav-link">Sports</a>
          <a href="#live" className="nav-link">Live</a>
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
          <button className="user-profile">
            <User size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
