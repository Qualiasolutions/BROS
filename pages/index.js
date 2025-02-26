import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ReservationList from '../components/ReservationList';
import MenuManagement from '../components/MenuManagement';
import StaffSchedule from '../components/StaffSchedule';
import InventoryManagement from '../components/InventoryManagement';
import FinancialReports from '../components/FinancialReports';
import CustomerManagement from '../components/CustomerManagement';
import Settings from '../components/Settings';
import Agent from '../components/Agent';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservations':
        return <ReservationList />;
      case 'menu':
        return <MenuManagement />;
      case 'staff':
        return <StaffSchedule />;
      case 'inventory':
        return <InventoryManagement />;
      case 'finances':
        return <FinancialReports />;
      case 'customers':
        return <CustomerManagement />;
      case 'settings':
        return <Settings />;
      case 'agent':
        return <Agent onTabChange={handleTabChange} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={styles.main}>
      <Head>
        <title>ROMAIN, TOMAS & FAWZI | Restaurant Management</title>
        <meta name="description" content="ROMAIN, TOMAS & FAWZI Restaurant Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header 
        toggleMobileMenu={toggleMobileMenu} 
        mobileMenuOpen={mobileMenuOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className={styles.dashboard}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          mobileMenuOpen={mobileMenuOpen}
        />
        
        <main className={styles.dashboardContent}>
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}