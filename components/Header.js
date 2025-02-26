import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { Menu, X, Bell, User, Search } from 'lucide-react';

const Header = ({ toggleMobileMenu, mobileMenuOpen, activeTab, onTabChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New reservation for tonight', read: false },
    { id: 2, message: 'Inventory alert: Wine stock low', read: false },
    { id: 3, message: 'Staff schedule updated', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          BROS <span>Mayfair</span>
        </div>

        <div className={styles.searchContainer}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <Search size={18} />
            </button>
          </form>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItem} onClick={() => onTabChange('dashboard')}>
            Dashboard
          </div>
          <div className={styles.navItem} onClick={() => onTabChange('reservations')}>
            Reservations
          </div>
          <div className={styles.navItem} onClick={() => onTabChange('menu')}>
            Menu
          </div>
          <div className={styles.navItem} onClick={() => onTabChange('agent')}>
            AI Assistant
          </div>
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.notificationContainer}>
            <button className={styles.iconButton} onClick={toggleNotifications}>
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications</h3>
                  <button onClick={markAllAsRead} className={styles.markReadButton}>
                    Mark all as read
                  </button>
                </div>
                <div className={styles.notificationList}>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                      >
                        {notification.message}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyNotifications}>No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.userContainer}>
            <button className={styles.iconButton} onClick={toggleUserMenu}>
              <User size={20} />
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>Restaurant Manager</div>
                  <div className={styles.userEmail}>manager@bros-mayfair.com</div>
                </div>
                <div className={styles.userMenuItems}>
                  <div className={styles.userMenuItem} onClick={() => onTabChange('settings')}>
                    Settings
                  </div>
                  <div className={styles.userMenuItem}>
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 