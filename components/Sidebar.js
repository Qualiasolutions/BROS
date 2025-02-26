import styles from '../styles/Home.module.css';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Utensils, 
  Users, 
  Package, 
  PieChart, 
  UserCircle, 
  Settings,
  Bot
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, mobileMenuOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarClock size={20} /> },
    { id: 'menu', label: 'Menu Management', icon: <Utensils size={20} /> },
    { id: 'staff', label: 'Staff Schedule', icon: <Users size={20} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
    { id: 'finances', label: 'Financial Reports', icon: <PieChart size={20} /> },
    { id: 'customers', label: 'Customers', icon: <UserCircle size={20} /> },
    { id: 'agent', label: 'AI Assistant', icon: <Bot size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <h3>BROS Mayfair</h3>
        <p>Restaurant Management</p>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`${styles.sidebarLink} ${activeTab === item.id ? styles.sidebarLinkActive : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div className={styles.sidebarFooter}>
        <div className={styles.restaurantInfo}>
          <p><strong>BROS Mayfair</strong></p>
          <p>42 Berkeley Square</p>
          <p>London, W1J 5AW</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 