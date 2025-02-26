import { formatPrice } from './data';

/**
 * Get business insights for the restaurant
 * @param {Object} options - Options for filtering insights
 * @returns {Object} - Business insights data
 */
export const getInsights = async (options = {}) => {
  // In a real app, this would fetch data from an API or database
  // For now, we'll use mock data
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Mock revenue data
  const revenueData = {
    daily: [
      { date: '2023-05-01', amount: 8750 },
      { date: '2023-05-02', amount: 9200 },
      { date: '2023-05-03', amount: 7800 },
      { date: '2023-05-04', amount: 10500 },
      { date: '2023-05-05', amount: 12300 },
      { date: '2023-05-06', amount: 15600 },
      { date: '2023-05-07', amount: 14200 }
    ],
    weekly: [
      { week: '2023-W18', amount: 68350 },
      { week: '2023-W19', amount: 72450 },
      { week: '2023-W20', amount: 65800 },
      { week: '2023-W21', amount: 78900 }
    ],
    monthly: [
      { month: '2023-01', amount: 285000 },
      { month: '2023-02', amount: 310000 },
      { month: '2023-03', amount: 325000 },
      { month: '2023-04', amount: 295000 },
      { month: '2023-05', amount: 340000 }
    ]
  };
  
  // Mock customer data
  const customerData = {
    daily: [
      { date: '2023-05-01', count: 98 },
      { date: '2023-05-02', count: 105 },
      { date: '2023-05-03', count: 87 },
      { date: '2023-05-04', count: 112 },
      { date: '2023-05-05', count: 134 },
      { date: '2023-05-06', count: 168 },
      { date: '2023-05-07', count: 152 }
    ],
    weekly: [
      { week: '2023-W18', count: 756 },
      { week: '2023-W19', count: 812 },
      { week: '2023-W20', count: 734 },
      { week: '2023-W21', count: 856 }
    ],
    monthly: [
      { month: '2023-01', count: 3250 },
      { month: '2023-02', count: 3480 },
      { month: '2023-03', count: 3620 },
      { month: '2023-04', count: 3380 },
      { month: '2023-05', count: 3780 }
    ]
  };
  
  // Mock top selling items
  const topSellingItems = [
    { id: 1, name: 'Beef Wellington', count: 428, revenue: 17976 },
    { id: 2, name: 'Truffle Risotto', count: 356, revenue: 10146 },
    { id: 3, name: 'Dover Sole', count: 312, revenue: 14976 },
    { id: 4, name: 'Lobster Linguine', count: 287, revenue: 10332 },
    { id: 5, name: 'Rack of Lamb', count: 245, revenue: 9310 }
  ];
  
  // Mock reservation data
  const reservationData = {
    daily: [
      { date: '2023-05-01', count: 42 },
      { date: '2023-05-02', count: 45 },
      { date: '2023-05-03', count: 38 },
      { date: '2023-05-04', count: 48 },
      { date: '2023-05-05', count: 56 },
      { date: '2023-05-06', count: 68 },
      { date: '2023-05-07', count: 62 }
    ],
    weekly: [
      { week: '2023-W18', count: 312 },
      { week: '2023-W19', count: 342 },
      { week: '2023-W20', count: 298 },
      { week: '2023-W21', count: 359 }
    ],
    monthly: [
      { month: '2023-01', count: 1320 },
      { month: '2023-02', count: 1450 },
      { month: '2023-03', count: 1520 },
      { month: '2023-04', count: 1380 },
      { month: '2023-05', count: 1580 }
    ]
  };
  
  // Calculate summary metrics
  const calculateSummary = () => {
    // Get the most recent data
    const lastDayRevenue = revenueData.daily[revenueData.daily.length - 1].amount;
    const lastWeekRevenue = revenueData.weekly[revenueData.weekly.length - 1].amount;
    const lastMonthRevenue = revenueData.monthly[revenueData.monthly.length - 1].amount;
    
    const lastDayCustomers = customerData.daily[customerData.daily.length - 1].count;
    const lastWeekCustomers = customerData.weekly[customerData.weekly.length - 1].count;
    const lastMonthCustomers = customerData.monthly[customerData.monthly.length - 1].count;
    
    const lastDayReservations = reservationData.daily[reservationData.daily.length - 1].count;
    const lastWeekReservations = reservationData.weekly[reservationData.weekly.length - 1].count;
    const lastMonthReservations = reservationData.monthly[reservationData.monthly.length - 1].count;
    
    // Calculate average order value
    const avgOrderValue = lastDayRevenue / lastDayCustomers;
    
    return {
      revenue: {
        daily: lastDayRevenue,
        weekly: lastWeekRevenue,
        monthly: lastMonthRevenue,
        formatted: {
          daily: formatPrice(lastDayRevenue),
          weekly: formatPrice(lastWeekRevenue),
          monthly: formatPrice(lastMonthRevenue)
        }
      },
      customers: {
        daily: lastDayCustomers,
        weekly: lastWeekCustomers,
        monthly: lastMonthCustomers
      },
      reservations: {
        daily: lastDayReservations,
        weekly: lastWeekReservations,
        monthly: lastMonthReservations
      },
      avgOrderValue: {
        value: avgOrderValue,
        formatted: formatPrice(avgOrderValue)
      },
      topSellingItems: topSellingItems.map(item => ({
        ...item,
        formattedRevenue: formatPrice(item.revenue)
      }))
    };
  };
  
  return {
    summary: calculateSummary(),
    revenueData,
    customerData,
    reservationData,
    topSellingItems: topSellingItems.map(item => ({
      ...item,
      formattedRevenue: formatPrice(item.revenue)
    }))
  };
};