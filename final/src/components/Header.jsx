import { getTrustScoreColor } from '../utils/helpers.js';
import './Header.css';

function Header({ user, unreadCount, currentPage, onLogout, navigateTo }) {
  const trustClass = getTrustScoreColor(user.trustScore);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="brand-name" onClick={() => navigateTo('dashboard')}>
            LendTrust
          </h1>
        </div>
        
        <nav className="header-nav">
          <button 
            className={'nav-button' + (currentPage === 'dashboard' ? ' active' : '')}
            onClick={() => navigateTo('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={'nav-button' + (currentPage === 'inventory' ? ' active' : '')}
            onClick={() => navigateTo('inventory')}
          >
            My Items
          </button>
          <button 
            className={'nav-button' + (currentPage === 'lendings' ? ' active' : '')}
            onClick={() => navigateTo('lendings')}
          >
            Lendings
          </button>
          <button 
            className={'nav-button' + (currentPage === 'borrowings' ? ' active' : '')}
            onClick={() => navigateTo('borrowings')}
          >
            Borrowings
          </button>
          <button 
            className={'nav-button' + (currentPage === 'public-library' ? ' active' : '')}
            onClick={() => navigateTo('public-library')}
          >
            Discover
          </button>
          <button 
            className={'nav-button activity-nav' + (currentPage === 'activity' ? ' active' : '')}
            onClick={() => navigateTo('activity')}
          >
            Activity
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          {user.isAdmin && (
            <button 
              className={'nav-button admin-nav' + (currentPage === 'admin' ? ' active' : '')}
              onClick={() => navigateTo('admin')}
            >
              Admin
            </button>
          )}
        </nav>
        
        <div className="header-user">
          <div className="user-info" onClick={() => navigateTo('profile')}>
            <span className="user-name">{user.displayName}</span>
            <div className="user-trust">
              <span className={'trust-score ' + trustClass}>{user.trustScore}</span>
              <span className={'trust-badge ' + trustClass}>{user.badge.badge}</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
