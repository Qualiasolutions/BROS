// Server-side only module
// We don't import playwright directly here to avoid client-side imports
let playwright;

// Import our mock implementation for client-side use
import mockPlaywright from './playwright-mock';

/**
 * Automates the process of logging into union.gr and creating an invoice
 * @param {Object} invoiceData - The invoice data object
 * @param {Object} credentials - The login credentials for union.gr
 * @returns {Object} - Result of the operation including success status and any error messages
 */
export async function createUnionInvoice(invoiceData, credentials) {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    console.error('createUnionInvoice can only be called from the server side');
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
    username: process.env.UNION_USERNAME,
    password: process.env.UNION_PASSWORD
  };

  let browser = null;
  try {
    // Launch browser
    browser = await playwright.chromium.launch({ headless: true }); // Set to true in production
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to union.gr
    await page.goto('https://www.union.gr/login');
    
    // Login
    await page.fill('input[name="username"]', loginCredentials.username);
    await page.fill('input[name="password"]', loginCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation();
    
    // Navigate to invoice creation page
    await page.click('a[href*="invoices"]');
    await page.click('button:has-text("New Invoice")');
    
    // Fill in invoice details
    await page.fill('input[name="customer"]', invoiceData.customer.name);
    
    // If customer VAT is available, fill it
    if (invoiceData.customer.vat) {
      await page.fill('input[name="vat"]', invoiceData.customer.vat);
    }
    
    // Add line items
    for (let i = 0; i < invoiceData.items.length; i++) {
      const item = invoiceData.items[i];
      
      if (i > 0) {
        // Click add item button for additional items
        await page.click('button:has-text("Add Item")');
      }
      
      // Fill item details
      await page.fill(`input[name="description-${i+1}"]`, item.description);
      await page.fill(`input[name="quantity-${i+1}"]`, item.quantity.toString());
      await page.fill(`input[name="price-${i+1}"]`, item.unitPrice.toString());
    }
    
    // Add notes if available
    if (invoiceData.notes) {
      await page.fill('textarea[name="notes"]', invoiceData.notes);
    }
    
    // Submit the invoice
    await page.click('button:has-text("Create Invoice")');
    
    // Wait for confirmation and get invoice number
    await page.waitForSelector('.invoice-confirmation');
    const invoiceNumber = await page.textContent('.invoice-number');
    
    // Download the invoice PDF
    await page.click('button:has-text("Download PDF")');
    
    // Wait for download to complete
    await page.waitForTimeout(2000);
    
    await browser.close();
    
    return {
      success: true,
      message: 'Invoice created successfully',
      invoiceNumber
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    };
  }
}

/**
 * Checks if the union.gr credentials are valid
 * @param {Object} credentials - The login credentials for union.gr
 * @returns {Boolean} - Whether the credentials are valid
 */
export async function validateUnionCredentials(credentials) {
  // Ensure this only runs on the server
  if (typeof window !== 'undefined') {
    console.error('validateUnionCredentials can only be called from the server side');
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
    username: process.env.UNION_USERNAME,
    password: process.env.UNION_PASSWORD
  };
  
  let browser = null;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.union.gr/login');
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