import clientsData from '../public/clients.json';
import suppliersData from '../public/suppliers.json';
import path from 'path';
import Papa from 'papaparse';

// Core data access functions
export const getClients = () => {
  try {
    return clientsData.Φύλλο1.slice(1).filter(client => client.Column5);
  } catch (error) {
    console.error("Error loading clients:", error);
    return [];
  }
};

export const getSuppliers = () => {
  try {
    return suppliersData.Φύλλο1.slice(1).filter(supplier => supplier.Column5);
  } catch (error) {
    console.error("Error loading suppliers:", error);
    return [];
  }
};

export const getProducts = () => {
  // London-specific menu items
  return [
    {
      id: 'truffle-risotto',
      name: 'Truffle Risotto',
      category: 'Risotto',
      price: 28.50,
      description: 'Creamy Arborio rice with black truffle, wild mushrooms, and aged Parmesan',
      allergens: 'Dairy',
      vegetarian: true,
      image: '/menu/truffle-risotto.jpg'
    },
    {
      id: 'beef-wellington',
      name: 'Beef Wellington',
      category: 'Main Course',
      price: 42.00,
      description: 'Prime fillet of beef wrapped in mushroom duxelles and golden puff pastry, served with red wine jus',
      allergens: 'Gluten, Eggs',
      vegetarian: false,
      image: '/menu/beef-wellington.jpg'
    },
    {
      id: 'lobster-linguine',
      name: 'Lobster Linguine',
      category: 'Pasta',
      price: 36.00,
      description: 'Fresh linguine with native lobster, cherry tomatoes, chili, and garlic',
      allergens: 'Gluten, Crustaceans',
      vegetarian: false,
      image: '/menu/lobster-linguine.jpg'
    },
    {
      id: 'burrata-salad',
      name: 'Burrata & Heritage Tomato Salad',
      category: 'Starter',
      price: 18.00,
      description: 'Creamy burrata with heritage tomatoes, basil, and aged balsamic',
      allergens: 'Dairy',
      vegetarian: true,
      image: '/menu/burrata-salad.jpg'
    },
    {
      id: 'chocolate-fondant',
      name: 'Chocolate Fondant',
      category: 'Dessert',
      price: 14.00,
      description: 'Warm chocolate fondant with salted caramel ice cream and gold leaf',
      allergens: 'Gluten, Eggs, Dairy',
      vegetarian: true,
      image: '/menu/chocolate-fondant.jpg'
    },
    {
      id: 'dover-sole',
      name: 'Dover Sole',
      category: 'Fish',
      price: 48.00,
      description: 'Whole Dover sole cooked on the bone, served with brown butter, capers, and lemon',
      allergens: 'Fish, Dairy',
      vegetarian: false,
      image: '/menu/dover-sole.jpg'
    },
    {
      id: 'champagne-cocktail',
      name: 'Mayfair Champagne Cocktail',
      category: 'Drinks',
      price: 18.50,
      description: 'House champagne with cognac, bitters, and a brown sugar cube',
      allergens: 'Sulphites',
      vegetarian: true,
      image: '/menu/champagne-cocktail.jpg'
    },
    {
      id: 'lamb-rack',
      name: 'Rack of Lamb',
      category: 'Main Course',
      price: 38.00,
      description: 'Herb-crusted rack of lamb with dauphinoise potatoes and rosemary jus',
      allergens: 'Dairy',
      vegetarian: false,
      image: '/menu/lamb-rack.jpg'
    }
  ];
};

// NEW: Product search function
export const searchProducts = (query) => {
  if (!query) return [];
  
  const products = getProducts();
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) || 
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
};

// NEW: Get product by exact SKU
export const getProductBySKU = async (sku) => {
  if (!sku) return null;
  
  try {
    const products = await getProducts();
    return products.find(product => product.SKU === sku) || null;
  } catch (error) {
    console.error("Error finding product by SKU:", error);
    return null;
  }
};

// Formatting functions
export const formatPrice = (price) => {
  if (!price) return '£0.00';
  
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format with Pound symbol and 2 decimal places
  return `£${numPrice.toFixed(2)}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  
  try {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    
    const [day, month, year] = parts;
    const date = new Date(`${year}-${month}-${day}`);
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

// Entity formatting
export const formatEntityInfo = (entity, type) => {
  if (!entity) return '';
  
  if (type === 'menu') {
    return `
      **${entity.name}**
      Category: ${entity.category}
      Price: ${formatPrice(entity.price)}
      Description: ${entity.description}
      Allergens: ${entity.allergens}
      Vegetarian: ${entity.vegetarian ? 'Yes' : 'No'}
    `;
  }
  
  if (type === 'reservation') {
    return `
      **Reservation for ${entity.name}**
      Date: ${entity.date}
      Time: ${entity.time}
      Guests: ${entity.guests}
      Contact: ${entity.phone}
      Email: ${entity.email}
      Special Requests: ${entity.specialRequests || 'None'}
      Status: ${entity.status}
    `;
  }
  
  if (type === 'event') {
    return `
      **${entity.name}**
      Type: ${entity.type}
      Capacity: ${entity.capacity} people
      Price Per Person: ${formatPrice(entity.pricePerPerson)}
      Description: ${entity.description}
      Availability: ${entity.availability}
    `;
  }
  
  return JSON.stringify(entity, null, 2);
};

// Search functions
export const searchClients = (query) => {
  if (!query) return [];
  
  const clients = getClients();
  const lowerQuery = query.toLowerCase();
  
  return clients.filter(client => 
    client.name?.toLowerCase().includes(lowerQuery) || 
    client.email?.toLowerCase().includes(lowerQuery) ||
    client.phone?.includes(query)
  );
};

export const searchSuppliers = (query) => {
  if (!query) return [];
  
  const suppliers = getSuppliers();
  const lowerQuery = query.toLowerCase();
  
  return suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(lowerQuery) || 
    supplier.type?.toLowerCase().includes(lowerQuery) ||
    supplier.description?.toLowerCase().includes(lowerQuery)
  );
};

// Smart search for everything
export const smartSearch = (query) => {
  const menuResults = searchProducts(query).map(item => ({
    ...item,
    type: 'menu'
  }));
  
  const reservationResults = searchClients(query).map(item => ({
    ...item,
    type: 'reservation'
  }));
  
  const eventResults = searchSuppliers(query).map(item => ({
    ...item,
    type: 'event'
  }));
  
  return [...menuResults, ...reservationResults, ...eventResults];
}; 