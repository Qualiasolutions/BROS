import { searchClients } from './data';
// We don't import server-side functions directly
// import { insertDocument, findDocuments, updateDocument, findDocument } from './db';

/**
 * Generate a new reservation
 * @param {Object} data - Reservation data
 * @returns {Object} - The created reservation
 */
export const generateReservation = async (data) => {
  const { customerName, date, time, guests, specialRequests, phone, email, automate } = data;

  // Find customer details if name provided
  let customer = { name: customerName };
  if (customerName) {
    const matchingClients = searchClients(customerName);
    if (matchingClients.length > 0) {
      const client = matchingClients[0];
      customer = {
        name: client.name,
        phone: client.phone,
        email: client.email
      };
    }
  }

  // Add phone and email if provided
  if (phone) customer.phone = phone;
  if (email) customer.email = email;

  // Create reservation object
  const reservation = {
    id: generateReservationId(),
    customer,
    date,
    time,
    guests,
    specialRequests,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    tableNumber: assignTable(guests, date, time)
  };

  // If automation is requested, use the API to create the reservation
  if (automate) {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          data: reservation
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        reservation.confirmationCode = result.confirmationCode;
        reservation.tableNumber = result.tableNumber || reservation.tableNumber;
      } else {
        console.error('Failed to automate reservation:', result.message);
      }
    } catch (error) {
      console.error('Error automating reservation:', error);
    }
  } else {
    // If not automating, still save to database via API
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          data: reservation
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to save reservation:', result.message);
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  }

  return reservation;
};

/**
 * Extract reservation information from a natural language query
 * @param {string} query - The natural language query
 * @returns {Object} - Extracted reservation information
 */
export const extractReservationInfo = (query) => {
  // Customer name extraction
  const customerMatch = query.match(/for\s+([^,\.]+?)(?=\s+for|\s+on|\s+at|\s*\d|\s*$)/i) || 
                        query.match(/name\s+(?:is|:)?\s+([^,\.]+)/i) ||
                        query.match(/(?:^|\s)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s|$)/);
  
  // Date extraction
  const dateMatch = query.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i) ||
                    query.match(/on\s+(\d{1,2}\/\d{1,2})/i) ||
                    query.match(/on\s+([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?)/i) ||
                    query.match(/date\s*(?:is|:)?\s*([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?)/i) ||
                    query.match(/(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/i);
  
  // Time extraction
  const timeMatch = query.match(/at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i) ||
                    query.match(/time\s*(?:is|:)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i) ||
                    query.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  
  // Number of guests extraction
  const guestsMatch = query.match(/for\s+(\d+)\s+(?:people|persons|guests)/i) ||
                      query.match(/(\d+)\s+(?:people|persons|guests)/i) ||
                      query.match(/party\s+(?:of|size|:)?\s+(\d+)/i) ||
                      query.match(/table\s+(?:for|of)\s+(\d+)/i);
  
  // Special requests extraction
  const specialRequestsMatch = query.match(/(?:special\s+requests?|notes?)\s*(?::|is|are)?\s*([^\.]+)/i);
  
  // Phone extraction
  const phoneMatch = query.match(/phone\s*(?:number|:)?\s*((?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i) ||
                     query.match(/((?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i);
  
  // Email extraction
  const emailMatch = query.match(/email\s*(?::|is)?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                     query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  
  // Check if automation is requested
  const automationRequested = query.toLowerCase().includes('confirm') || 
                             query.toLowerCase().includes('book now') ||
                             query.toLowerCase().includes('reserve now') ||
                             query.toLowerCase().includes('make reservation');

  // Process date
  let parsedDate = new Date();
  if (dateMatch) {
    try {
      parsedDate = new Date(dateMatch[1]);
      if (isNaN(parsedDate.getTime())) {
        // Try alternative date parsing for formats like "June 15th"
        const monthNames = ["january", "february", "march", "april", "may", "june",
                           "july", "august", "september", "october", "november", "december"];
        const monthMatch = dateMatch[1].match(/([a-z]+)\s+(\d{1,2})/i);
        if (monthMatch) {
          const month = monthNames.findIndex(m => m.toLowerCase() === monthMatch[1].toLowerCase());
          if (month !== -1) {
            const day = parseInt(monthMatch[2].replace(/(?:st|nd|rd|th)/, ''));
            parsedDate = new Date();
            parsedDate.setMonth(month);
            parsedDate.setDate(day);
          }
        }
      }
    } catch (e) {
      parsedDate = new Date();
    }
  }

  // Process time
  let parsedTime = '19:00'; // Default to 7 PM
  if (timeMatch) {
    const timeStr = timeMatch[1].toLowerCase();
    if (timeStr.includes('am') || timeStr.includes('pm')) {
      // Convert 12-hour format to 24-hour
      const isPM = timeStr.includes('pm');
      const timeParts = timeStr.replace(/[^\d:]/g, '').split(':');
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
      
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      parsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // Assume 24-hour format
      parsedTime = timeStr.includes(':') ? timeStr : `${timeStr}:00`;
    }
  }

  return {
    customerName: customerMatch ? customerMatch[1].trim() : null,
    date: parsedDate,
    time: parsedTime,
    guests: guestsMatch ? parseInt(guestsMatch[1]) : 2,
    specialRequests: specialRequestsMatch ? specialRequestsMatch[1].trim() : '',
    phone: phoneMatch ? phoneMatch[1].trim() : '',
    email: emailMatch ? emailMatch[1].trim() : '',
    automate: automationRequested
  };
};

/**
 * Generate a unique reservation ID
 * @returns {string} - Unique reservation ID
 */
function generateReservationId() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(2); // Last 2 digits of year
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `RES-${year}${month}${day}-${random}`;
}

/**
 * Assign a table for a reservation
 * @param {number} guests - Number of guests
 * @param {Date} date - Reservation date
 * @param {string} time - Reservation time
 * @returns {string} - Assigned table number
 */
function assignTable(guests, date, time) {
  // Simple table assignment logic - in a real system this would check availability
  if (guests <= 2) {
    return `T${Math.floor(Math.random() * 10) + 1}`; // Tables 1-10 for couples
  } else if (guests <= 4) {
    return `T${Math.floor(Math.random() * 10) + 11}`; // Tables 11-20 for small groups
  } else if (guests <= 8) {
    return `T${Math.floor(Math.random() * 5) + 21}`; // Tables 21-25 for medium groups
  } else {
    return `T${Math.floor(Math.random() * 3) + 26}`; // Tables 26-28 for large groups
  }
}

/**
 * Get all reservations for a specific date
 * @param {Date} date - The date to get reservations for
 * @returns {Array} - List of reservations
 */
export const getReservationsForDate = async (date) => {
  try {
    // Convert date to ISO string and match the date part only
    const dateString = date.toISOString().split('T')[0];
    const reservations = await findDocuments('reservations', {
      date: { $regex: `^${dateString}` }
    });
    return reservations;
  } catch (error) {
    console.error('Error getting reservations for date:', error);
    return [];
  }
};

/**
 * Get a reservation by ID
 * @param {string} id - Reservation ID
 * @returns {Object} - The reservation
 */
export const getReservationById = async (id) => {
  try {
    return await findDocument('reservations', { id });
  } catch (error) {
    console.error('Error getting reservation by ID:', error);
    return null;
  }
}; 