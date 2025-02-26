import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { 
  Users, 
  Utensils, 
  PoundSterling, 
  Calendar, 
  TrendingUp, 
  Clock, 
  ShoppingBag,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    reservations: { today: 0, week: 0, month: 0 },
    revenue: { today: 0, week: 0, month: 0 },
    customers: { today: 0, week: 0, month: 0 },
    avgOrderValue: 0,
    topSellingItems: [
      { id: 1, name: 'Beef Wellington', count: 0, revenue: 0 },
      { id: 2, name: 'Truffle Risotto', count: 0, revenue: 0 },
      { id: 3, name: 'Dover Sole', count: 0, revenue: 0 },
      { id: 4, name: 'Lobster Linguine', count: 0, revenue: 0 }
    ],
    upcomingReservations: [
      { id: 'RES-230525-001', name: 'James Wilson', time: '18:30', guests: 0, table: 'T15' },
      { id: 'RES-230525-002', name: 'Olivia Thompson', time: '19:00', guests: 0, table: 'T7' },
      { id: 'RES-230525-003', name: 'William Parker', time: '19:30', guests: 0, table: 'T22' },
      { id: 'RES-230525-004', name: 'Sophia Mitchell', time: '20:00', guests: 0, table: 'T9' }
    ],
    inventoryAlerts: []
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <p>Welcome to BROS Mayfair Restaurant Management System</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar />
          </div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Today's Reservations</div>
          <div className={styles.statTrend}>
            <TrendingUp size={14} />
            <span>+0% vs. last week</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <PoundSterling />
          </div>
          <div className={styles.statValue}>£0.00</div>
          <div className={styles.statLabel}>Today's Revenue</div>
          <div className={styles.statTrend}>
            <TrendingUp size={14} />
            <span>+0% vs. avg day</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users />
          </div>
          <div className={styles.statValue}>0</div>
          <div className={styles.statLabel}>Today's Customers</div>
          <div className={styles.statTrend}>
            <TrendingUp size={14} />
            <span>+0% vs. avg day</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingBag />
          </div>
          <div className={styles.statValue}>£0.00</div>
          <div className={styles.statLabel}>Average Order Value</div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <h2>Top Selling Items</h2>
            <span className={styles.cardHeaderAction}>
              View All <ChevronRight size={16} />
            </span>
          </div>
          <div className={`${styles.cardContent} ${styles.tableContainer}`}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSellingItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>0</td>
                      <td>£0.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <h2>Upcoming Reservations</h2>
            <span className={styles.cardHeaderAction}>
              View All <ChevronRight size={16} />
            </span>
          </div>
          <div className={`${styles.cardContent} ${styles.tableContainer}`}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Table</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingReservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td>{reservation.name}</td>
                      <td>{reservation.time}</td>
                      <td>0</td>
                      <td>{reservation.table}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <h2>Inventory Alerts</h2>
            <span className={styles.cardHeaderAction}>
              View All <ChevronRight size={16} />
            </span>
          </div>
          <div className={`${styles.cardContent} ${styles.emptyStateContainer}`}>
            <div className={styles.emptyState}>
              <AlertTriangle size={24} />
              <p>No inventory alerts</p>
            </div>
          </div>
        </div>

        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <h2>Revenue Overview</h2>
            <div className={styles.cardHeaderTabs}>
              <span className={styles.cardHeaderTabActive}>Daily</span>
              <span className={styles.cardHeaderTab}>Weekly</span>
              <span className={styles.cardHeaderTab}>Monthly</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.revenueStats}>
              <div className={styles.revenueStat}>
                <div className={styles.revenueStatLabel}>Today</div>
                <div className={styles.revenueStatValue}>£0.00</div>
              </div>
              <div className={styles.revenueStat}>
                <div className={styles.revenueStatLabel}>This Week</div>
                <div className={styles.revenueStatValue}>£0.00</div>
              </div>
              <div className={styles.revenueStat}>
                <div className={styles.revenueStatLabel}>This Month</div>
                <div className={styles.revenueStatValue}>£0.00</div>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.chartPlaceholder}>
                {/* In a real app, this would be a chart component */}
                <div className={styles.mockChart}>
                  <div className={styles.mockChartBar} style={{ height: '30%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '50%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '70%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '40%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '60%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '80%' }}></div>
                  <div className={styles.mockChartBar} style={{ height: '45%' }}></div>
                </div>
                <div className={styles.chartLabels}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 