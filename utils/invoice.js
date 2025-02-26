import { searchClients, formatPrice, searchProducts } from './data';
// We don't import server-side functions directly
// import { createUnionInvoice } from './unionAutomation';

export const generateInvoice = async (data) => {
  const { customerName, amount, date, products, notes, productNames } = data;

  // Find customer details if name provided
  let customer = { name: customerName, code: 'NEW' };
  if (customerName) {
    const matchingClients = searchClients(customerName);
    if (matchingClients.length > 0) {
      const client = matchingClients[0];
      customer = {
        name: client.Column5 || client.Column2, // Use Column5 or fallback to Column2
        code: client.Column4 || 'NEW',
        vat: client.Column7 || '',
        phone: client.Column6 || client.Column4 || '', // Use Column6 or fallback to Column4
        address: client.Column14 || 'London, UK' // Adding address with default
      };
    }
  }

  // Generate unique invoice number based on UNION.GR pattern
  const invoiceNumber = generateInvoiceNumber();
  
  // Process product names if provided
  let invoiceProducts = [];
  
  if (productNames && productNames.length > 0) {
    // Search for products by name and add them to the invoice
    invoiceProducts = productNames.map(productName => {
      const foundProducts = searchProducts(productName);
      const product = foundProducts.length > 0 ? foundProducts[0] : null;
      
      return {
        description: product ? product.name : productName,
        quantity: 1,
        unitPrice: product ? product.price || 0 : 0,
        total: product ? product.price || 0 : 0
      };
    });
  } else if (products && products.length > 0) {
    // Use products if directly provided
    invoiceProducts = products;
  } else {
    // Default to a general service if no products specified
    invoiceProducts = [{
      description: "General Services",
      quantity: 1,
      unitPrice: amount || 0,
      total: amount || 0
    }];
  }
  
  // Calculate totals
  const subtotal = invoiceProducts.reduce((sum, product) => 
    sum + (product.total || product.unitPrice * product.quantity), 0
  );
  
  const vat = subtotal * 0.20; // 20% VAT in UK
  const total = subtotal + vat;

  // Create invoice object following standard UK invoice format
  const invoice = {
    invoiceNumber,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    customer,
    items: invoiceProducts,
    subtotal,
    vat,
    total,
    status: 'DRAFT',
    paymentTerms: 'Net 30',
    currency: 'GBP',
    notes: notes || '',
    issuer: {
      name: 'BROS Mayfair',
      address: '42 Berkeley Square, London, W1J 5AW',
      vat: 'GB123456789',
      phone: '+44 20 1234 5678'
    },
    created: new Date().toISOString()
  };

  // If automation is requested, create the invoice via API
  if (data.automate) {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          data: invoice
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        invoice.status = 'CREATED';
        invoice.unionInvoiceNumber = result.invoiceNumber;
      } else {
        invoice.automationError = result.error || result.message;
      }
    } catch (error) {
      invoice.automationError = error.message;
    }
  } else {
    // If not automating, still save to database via API
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          data: invoice
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to save invoice:', result.message);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  }

  return invoice;
};

export const extractInvoiceInfo = (query) => {
  // Customer name extraction
  const customerMatch = query.match(/for\s+([^,\.]+?)(?=\s+for|\s*£|\s*pound|\s*$)/i) || 
                        query.match(/customer\s+([^,\.]+)/i) ||
                        query.match(/client\s+([^,\.]+)/i);
  
  // Amount extraction - improved to catch more patterns
  const amountMatch = query.match(/(\d+(?:\.\d{1,2})?)\s*(?:pounds?|£)/i) ||
                      query.match(/£\s*(\d+(?:\.\d{1,2})?)/i) ||
                      query.match(/amount\s*(?:of|:)?\s*(\d+(?:\.\d{1,2})?)/i) ||
                      query.match(/for\s+(\d+(?:\.\d{1,2})?)\s*£/i);
  
  // Date extraction
  const dateMatch = query.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                    query.match(/date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  
  // Products extraction - enhanced to handle multiple formats
  const productMatches = query.match(/(\d+)\s*(?:units?|pcs?|pieces?)\s+of\s+([^,\.]+)/g) || [];
  const products = productMatches.map(match => {
    const [_, quantity, productName] = match.match(/(\d+)\s*(?:units?|pcs?|pieces?)\s+of\s+(.+)/i);
    return {
      description: productName.trim(),
      quantity: parseInt(quantity),
      unitPrice: 0, // This would be filled from product database in a real system
      total: 0      // This would be calculated in a real system
    };
  });
  
  // Extract product names without quantities
  const productNamesMatch = query.match(/products?\s+([^\.]+)/i) || 
                           query.match(/for\s+products?\s+([^\.]+)/i);
  
  let productNames = [];
  if (productNamesMatch) {
    // Split by "and" or commas and clean up
    productNames = productNamesMatch[1]
      .replace(/\s+and\s+/gi, ',')
      .split(',')
      .map(name => name.trim())
      .filter(name => name && name.length > 0);
  }
  
  // Check if automation is requested
  const automationRequested = query.toLowerCase().includes('union.gr') || 
                             query.toLowerCase().includes('automatically') ||
                             query.toLowerCase().includes('auto') ||
                             query.toLowerCase().includes('log in');

  return {
    customerName: customerMatch ? customerMatch[1].trim() : null,
    amount: amountMatch ? parseFloat(amountMatch[1]) : null,
    date: dateMatch ? new Date(dateMatch[1]) : new Date(),
    products: products.length > 0 ? products : null,
    productNames: productNames.length > 0 ? productNames : null,
    notes: '',
    automate: automationRequested
  };
};

function generateInvoiceNumber() {
  // Follow a pattern for UK invoices
  const today = new Date();
  const year = today.getFullYear().toString().slice(2); // Last 2 digits of year
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `BM-${year}${month}${day}-${random}`;
} 