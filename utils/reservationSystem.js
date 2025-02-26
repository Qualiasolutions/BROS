// Server-side only module
// We don't import playwright directly here to avoid client-side imports
let playwright;

// Import our mock implementation for client-side use
import mockPlaywright from './playwright-mock';

/**
 * Automates the process of creating a reservation in the restaurant's booking system
 * @param {Object} reservationData - The reservation data object
 * @param {Object} credentials - The login credentials for the reservation system
 * @returns {Object} - Result of the operation including success status and any error messages
 */
export async function createReservation(reservationData, credentials) {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    console.error('createReservation can only be called from the server side');
    return {
      success: false,
      message: 'This function can only be called from the server side',
    };
  }

  // Dynamically import playwright only on the server side
  if (!playwright) {
    try {
      playwright = await import('playwright').catch(() => mockPlaywright);
    } catch (error) {
      console.error('Failed to import playwright:', error);
      return {
        success: false,
        message: 'Failed to load automation dependencies',
        error: error.message
      };
    }
  }

  // Default credentials if not provided
  const loginCredentials = credentials || {
    username: process.env.RESERVATION_SYSTEM_USERNAME,
    password: process.env.RESERVATION_SYSTEM_PASSWORD
  };

  let browser = null;
  try {
    // Launch browser
    browser = await playwright.chromium.launch({ headless: true }); // Set to true in production
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to reservation system - using a London-specific URL
    await page.goto('https://reservations.bros-mayfair.com/login');
    
    // Login
    await page.fill('input[name="username"]', loginCredentials.username);
    await page.fill('input[name="password"]', loginCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation();
    
    // Navigate to reservation creation page
    await page.click('a[href*="reservations"]');
    await page.click('button:has-text("New Reservation")');
    
    // Fill in reservation details
    await page.fill('input[name="customer-name"]', reservationData.customer.name);
    
    // Format date for the input field (YYYY-MM-DD)
    const reservationDate = new Date(reservationData.date);
    const formattedDate = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}-${String(reservationDate.getDate()).padStart(2, '0')}`;
    await page.fill('input[name="date"]', formattedDate);
    
    // Fill time
    await page.fill('input[name="time"]', reservationData.time);
    
    // Fill number of guests
    await page.fill('input[name="guests"]', reservationData.guests.toString());
    
    // Fill contact information if available
    if (reservationData.customer.phone) {
      await page.fill('input[name="phone"]', reservationData.customer.phone);
    }
    
    if (reservationData.customer.email) {
      await page.fill('input[name="email"]', reservationData.customer.email);
    }
    
    // Add special requests if available
    if (reservationData.specialRequests) {
      await page.fill('textarea[name="special-requests"]', reservationData.specialRequests);
    }
    
    // Submit the reservation
    await page.click('button:has-text("Create Reservation")');
    
    // Wait for confirmation and get reservation details
    await page.waitForSelector('.reservation-confirmation');
    const confirmationCode = await page.textContent('.confirmation-code');
    const tableNumber = await page.textContent('.table-number');
    
    await browser.close();
    
    return {
      success: true,
      message: 'Reservation created successfully',
      confirmationCode,
      tableNumber
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      message: 'Failed to create reservation',
      error: error.message
    };
  }
}

/**
 * Checks if the reservation system credentials are valid
 * @param {Object} credentials - The login credentials for the reservation system
 * @returns {Boolean} - Whether the credentials are valid
 */
export async function validateReservationCredentials(credentials) {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    console.error('validateReservationCredentials can only be called from the server side');
    return false;
  }

  // Dynamically import playwright only on the server side
  if (!playwright) {
    try {
      playwright = await import('playwright').catch(() => mockPlaywright);
    } catch (error) {
      console.error('Failed to import playwright:', error);
      return false;
    }
  }

  const loginCredentials = credentials || {
    username: process.env.RESERVATION_SYSTEM_USERNAME,
    password: process.env.RESERVATION_SYSTEM_PASSWORD
  };
  
  let browser = null;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://reservations.bros-mayfair.com/login');
    await page.fill('input[name="username"]', loginCredentials.username);
    await page.fill('input[name="password"]', loginCredentials.password);
    await page.click('button[type="submit"]');
    
    // Check if login was successful
    const loginSuccessful = await Promise.race([
      page.waitForSelector('.dashboard', { timeout: 5000 }).then(() => true),
      page.waitForSelector('.error-message', { timeout: 5000 }).then(() => false)
    ]);
    
    await browser.close();
    return loginSuccessful;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    return false;
  }
} 