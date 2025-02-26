import React, { useState, useRef, useEffect } from 'react';
import InvoiceView from './InvoiceView';
import { formatPrice, smartSearch, formatEntityInfo, getProducts, searchProducts } from '../utils/data';
import { generateReservation, extractReservationInfo } from '../utils/reservation';
import { generateInvoice, extractInvoiceInfo } from '../utils/invoice';
import { getInsights } from '../utils/insights';
import styles from '../styles/Home.module.css';
import AssistantAvatar from './AssistantAvatar';
import LoadingScreen from './LoadingScreen';

// Client-side validation function that uses the API
const validateUnionCredentialsViaAPI = async (credentials) => {
  try {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validate',
        credentials
      }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
};

const Agent = ({ onTabChange }) => {
  // Add state for welcome screen, service selection, and user identity
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [userIdentity, setUserIdentity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  
  // Simplified state management - using only one message system
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [isInvoiceMode, setIsInvoiceMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const messagesEndRef = useRef(null);
  const [conversationContext, setConversationContext] = useState({
    lastQuery: '',
    lastTopic: '',
    mentionedEntities: [],
    awaitingResponse: false,
    pendingAction: null,
    pendingEntity: null,
    knownClients: ['Harrods', 'Selfridges', 'The Ritz', 'Claridge\'s'],
    knownSuppliers: ['Smithfield Meats', 'Borough Market Produce', 'Billingsgate Seafood']
  });
  const [lastUserMessage, setLastUserMessage] = useState(''); // Track last message to prevent repetition

  // Define service options for a London restaurant
  const serviceOptions = [
    { id: 'menu', name: 'Menu Information and Specials', icon: '🍽️' },
    { id: 'reservations', name: 'Table Reservations', icon: '📅' },
    { id: 'orders', name: 'Order Processing and Takeaway', icon: '🥡' },
    { id: 'events', name: 'Events and Private Dining', icon: '🎉' },
    { id: 'loyalty', name: 'Loyalty Program and Offers', icon: '🎁' },
    { id: 'feedback', name: 'Customer Feedback and Reviews', icon: '⭐' },
    { id: 'allergens', name: 'Allergen Information', icon: '🌱' },
    { id: 'hours', name: 'Opening Hours and Location', icon: '🕒' },
    { id: 'general', name: 'General Questions', icon: '❓' }
  ];

  // Initialize conversation after service selection
  useEffect(() => {
    if (selectedService) {
      let initialMessage = `Nice to meet you, ${userIdentity}! I'll help you with ${getServiceName(selectedService)}. `;
      
      switch(selectedService) {
        case 'menu':
          initialMessage += 'You can ask about our dishes, daily specials, ingredients, or browse our full menu.';
          break;
        case 'reservations':
          initialMessage += 'I can help you book a table, check availability, modify or cancel existing reservations.';
          break;
        case 'orders':
          initialMessage += 'I can assist with placing takeaway orders, checking order status, or arranging delivery.';
          break;
        case 'events':
          initialMessage += 'I can provide information about hosting private events, group bookings, or special occasions at BROS Mayfair.';
          break;
        case 'loyalty':
          initialMessage += 'I can help with our loyalty program, special offers, and membership benefits.';
          break;
        case 'feedback':
          initialMessage += 'I can collect your feedback, help with reviews, or address any concerns about your dining experience.';
          break;
        case 'allergens':
          initialMessage += 'I can provide detailed allergen information for any dish on our menu and suggest alternatives.';
          break;
        case 'hours':
          initialMessage += 'I can tell you about our opening hours, location details, parking information, and accessibility.';
          break;
        case 'general':
          initialMessage += 'I can answer any general questions you might have about BROS Mayfair or our services.';
          break;
        default:
          initialMessage += 'What would you like to know about BROS Mayfair restaurant?';
      }
      
      setConversation([
        { 
          role: 'assistant', 
          content: initialMessage
        }
      ]);
    }
  }, [selectedService]);

  // Get service name from ID
  const getServiceName = (serviceId) => {
    const service = serviceOptions.find(option => option.id === serviceId);
    return service ? service.name.toLowerCase() : 'your request';
  };

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productData = await getProducts();
        setProducts(productData || []);
        console.log("Products loaded:", productData?.length || 0);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Extract text from HTML content
  const extractTextFromHTML = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Get client information - hardcoded for demonstration
  const getClientInfo = (clientName) => {
    const clients = {
      'harrods': {
        name: 'Harrods',
        balance: '£2,450.00',
        status: 'Active',
        lastTransaction: '2023-05-15',
        contactPerson: 'James Wilson',
        email: 'james.wilson@harrods.com',
        phone: '+44 20 7730 1234',
        address: 'Brompton Road, Knightsbridge, London'
      },
      'selfridges': {
        name: 'Selfridges',
        balance: '£1,850.50',
        status: 'Active',
        lastTransaction: '2023-06-01',
        contactPerson: 'Olivia Thompson',
        email: 'olivia.thompson@selfridges.com'
      },
      'the ritz': {
        name: 'The Ritz',
        balance: '£3,200.00',
        status: 'Pending',
        lastTransaction: '2023-04-22',
        contactPerson: 'William Parker'
      },
      'claridge\'s': {
        name: 'Claridge\'s',
        balance: '£4,750.25',
        status: 'Active',
        lastTransaction: '2023-05-30',
        contactPerson: 'Sophia Mitchell'
      }
    };
    
    const normalizedName = clientName.toLowerCase();
    return clients[normalizedName] || null;
  };

  // Get supplier information - hardcoded for demonstration
  const getSupplierInfo = (supplierName) => {
    const suppliers = {
      'smithfield meats': {
        name: 'Smithfield Meats',
        balance: '£3,450.75',
        status: 'Active',
        lastTransaction: '2023-05-10',
        contactPerson: 'Harry Johnson',
        email: 'orders@smithfieldmeats.co.uk'
      },
      'borough market produce': {
        name: 'Borough Market Produce',
        balance: '£2,800.00',
        status: 'Active',
        lastTransaction: '2023-06-05',
        contactPerson: 'Emily Davies'
      },
      'billingsgate seafood': {
        name: 'Billingsgate Seafood',
        balance: '£1,950.25',
        status: 'Pending',
        contactPerson: 'Alexander Bennett'
      }
    };
    
    const normalizedName = supplierName.toLowerCase();
    return suppliers[normalizedName] || null;
  };

  // Format entity information for display
  const formatEntityDetails = (entity, type) => {
    if (!entity) return 'No information found for this entity.';
    
    let details = `**${entity.name}**\n`;
    details += `Status: ${entity.status}\n`;
    details += `Current Balance: ${entity.balance}\n`;
    details += `Last Transaction: ${entity.lastTransaction}\n`;
    
    if (entity.contactPerson) {
      details += `Contact: ${entity.contactPerson}`;
      if (entity.email) details += ` (${entity.email})`;
      details += '\n';
    }
    
    if (entity.address) {
      details += `Address: ${entity.address}\n`;
    }
    
    if (entity.phone) {
      details += `Phone: ${entity.phone}\n`;
    }
    
    return details;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    
    // Prevent processing the exact same message twice in a row
    if (userMessage === lastUserMessage) {
      setInput('');
      setConversation(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "I notice you've asked the same question again. Is there something specific about my previous answer that you'd like me to clarify?" }
      ]);
      return;
    }
    
    setLastUserMessage(userMessage);
    setInput('');
    
    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Check for reservation creation intent with automation
      if (userMessage.toLowerCase().includes('reservation') && 
          (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('make') || 
           userMessage.toLowerCase().includes('book') || userMessage.toLowerCase().includes('reserve'))) {
        
        // Add a loading message
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: 'I\'ll help you make a reservation. Let me process that for you...',
          isLoading: true
        }]);
        
        // Extract reservation information from the message
        const reservationData = extractReservationInfo(userMessage);
        
        // Validate that we have the necessary information
        if (!reservationData.customerName) {
          setConversation(prev => {
            const newConv = [...prev];
            newConv.pop(); // Remove loading message
            return [...newConv, { 
              role: 'assistant', 
              content: 'I need to know your name to make a reservation. Could you please provide your name?'
            }];
          });
          setIsProcessing(false);
          return;
        }
        
        // Generate the reservation
        try {
          const reservation = await generateReservation(reservationData);
          
          // Check if automation was successful
          if (reservation.automationError) {
            setConversation(prev => {
              const newConv = [...prev];
              newConv.pop(); // Remove loading message
              return [...newConv, { 
                role: 'assistant', 
                content: `I encountered an error while creating the reservation: ${reservation.automationError}. However, I've prepared the reservation details for you:\n\n` +
                         `• Name: ${reservation.customer.name}\n` +
                         `• Date: ${new Date(reservation.date).toLocaleDateString()}\n` +
                         `• Time: ${reservation.time}\n` +
                         `• Guests: ${reservation.guests}\n\n` +
                         `Would you like me to try again or would you prefer to call the restaurant directly at +44 20 1234 5678?`
              }];
            });
          } else {
            setConversation(prev => {
              const newConv = [...prev];
              newConv.pop(); // Remove loading message
              return [...newConv, { 
                role: 'assistant', 
                content: `I've successfully created a reservation for ${reservation.customer.name}.\n\n` +
                         `• Reservation ID: ${reservation.id}\n` +
                         `• Date: ${new Date(reservation.date).toLocaleDateString()}\n` +
                         `• Time: ${reservation.time}\n` +
                         `• Guests: ${reservation.guests}\n` +
                         `• Status: ${reservation.status}\n` +
                         (reservation.tableNumber ? `• Table: ${reservation.tableNumber}\n` : '') +
                         (reservation.confirmationCode ? `• Confirmation Code: ${reservation.confirmationCode}\n` : '') +
                         `\nIs there anything else you'd like to add to your reservation?`
              }];
            });
          }
        } catch (error) {
          setConversation(prev => {
            const newConv = [...prev];
            newConv.pop(); // Remove loading message
            return [...newConv, { 
              role: 'assistant', 
              content: `I encountered an error while processing the reservation: ${error.message}. Please try again with more specific details or call us directly at +44 20 1234 5678.`
            }];
          });
        }
        
        setIsProcessing(false);
        return;
      }
      
      // Check for invoice creation intent with union.gr automation
      if (userMessage.toLowerCase().includes('invoice') && 
          (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('generate'))) {
        
        // Add a loading message
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: 'I\'ll help you create an invoice. Let me process that for you...',
          isLoading: true
        }]);
        
        // Extract invoice information from the message
        const invoiceData = extractInvoiceInfo(userMessage);
        
        // Validate that we have the necessary information
        if (!invoiceData.customerName) {
          setConversation(prev => {
            const newConv = [...prev];
            newConv.pop(); // Remove loading message
            return [...newConv, { 
              role: 'assistant', 
              content: 'I need to know the customer name to create an invoice. Could you please provide the customer name?'
            }];
          });
          setIsProcessing(false);
          return;
        }
        
        // Check if automation is requested
        if (invoiceData.automate) {
          // Validate credentials via API
          const credentialsValid = await validateUnionCredentialsViaAPI();
          if (!credentialsValid) {
            setConversation(prev => {
              const newConv = [...prev];
              newConv.pop(); // Remove loading message
              return [...newConv, { 
                role: 'assistant', 
                content: 'I couldn\'t log in to the invoice system. Please check your credentials in the .env.local file and try again.'
              }];
            });
            setIsProcessing(false);
            return;
          }
        }
        
        // Generate the invoice with automation
        try {
          const invoice = await generateInvoice(invoiceData);
          
          // Check if automation was successful
          if (invoice.automationError) {
            setConversation(prev => {
              const newConv = [...prev];
              newConv.pop(); // Remove loading message
              return [...newConv, { 
                role: 'assistant', 
                content: `I encountered an error while creating the invoice: ${invoice.automationError}. However, I've prepared the invoice data for you:\n\n` +
                         `• Customer: ${invoice.customer.name}\n` +
                         `• Total Amount: ${formatPrice(invoice.total)}\n` +
                         `• Products: ${invoice.items.map(item => `${item.quantity}x ${item.description}`).join(', ')}`
              }];
            });
          } else {
            // Set the invoice data for display
            setInvoiceData(invoice);
            setIsInvoiceMode(true);
            
            setConversation(prev => {
              const newConv = [...prev];
              newConv.pop(); // Remove loading message
              return [...newConv, { 
                role: 'assistant', 
                content: `I've successfully created an invoice for ${invoice.customer.name}.\n\n` +
                         `• Invoice Number: ${invoice.invoiceNumber}\n` +
                         `• Reference: ${invoice.unionInvoiceNumber || 'N/A'}\n` +
                         `• Date: ${new Date(invoice.date).toLocaleDateString()}\n` +
                         `• Total Amount: ${formatPrice(invoice.total)}\n\n` +
                         `The invoice has been saved and is ready for download. You can view it in the invoice panel.`
              }];
            });
          }
        } catch (error) {
          setConversation(prev => {
            const newConv = [...prev];
            newConv.pop(); // Remove loading message
            return [...newConv, { 
              role: 'assistant', 
              content: `I encountered an error while processing the invoice: ${error.message}. Please try again with more specific details.`
            }];
          });
        }
        
        setIsProcessing(false);
        return;
      }
      
      // For all other queries, use the enhanced chat API
      await processWithAI(userMessage);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
      setIsProcessing(false);
    }
  };

  // Process with AI for all queries
  const processWithAI = async (message) => {
    // Simple keyword-based response system
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    // Check for general questions first
    if (selectedService === 'general' || true) { // Always allow general questions regardless of service
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = `Hello! How can I assist you with BROS Mayfair today?`;
      } else if (lowerMessage.includes('who are you') || lowerMessage.includes('what can you do')) {
        response = `I'm the BROS Mayfair AI assistant. I can help with reservations, menu information, orders, events, and answer general questions about our restaurant.`;
      } else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        response = `BROS Mayfair is located at 42 Berkeley Square, Mayfair, London W1J 5AW. We're in the heart of Mayfair, just a short walk from Green Park station.`;
      } else if (lowerMessage.includes('opening') || lowerMessage.includes('hours') || lowerMessage.includes('time')) {
        response = `Our opening hours are:\nLunch: Monday to Friday, 12pm - 2:30pm\nDinner: Monday to Saturday, 6pm - 10:30pm\nWe are closed on Sundays.`;
      } else if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('dish')) {
        response = `Our menu features modern British cuisine with European influences. Some of our signature dishes include Beef Wellington, Truffle Risotto, Dover Sole, and Lobster Linguine. Would you like to know more about any specific dish?`;
      } else if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
        response = `To make a reservation, you can provide your preferred date, time, and party size. We recommend booking at least 2 weeks in advance for dinner service.`;
      } else if (lowerMessage.includes('chef') || lowerMessage.includes('kitchen')) {
        response = `Our Executive Chef leads our talented kitchen team, creating seasonal menus that showcase the finest British ingredients with innovative cooking techniques.`;
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
        response = `Our lunch menu starts from £45 for two courses, and our dinner tasting menu is £95 per person. We also offer an à la carte menu with starters from £18 and main courses from £32.`;
      } else if (lowerMessage.includes('dress code') || lowerMessage.includes('attire')) {
        response = `We have a smart casual dress code. Gentlemen are required to wear a collared shirt, and we do not permit sportswear or sneakers in the dining room.`;
      } else if (lowerMessage.includes('parking') || lowerMessage.includes('car')) {
        response = `Valet parking is available for £25. Alternatively, there are several public car parks within walking distance, including the Q-Park at Berkeley Square.`;
      } else if (lowerMessage.includes('thank')) {
        response = `You're welcome! Is there anything else I can help you with?`;
      } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        response = `Thank you for chatting with BROS Mayfair's AI assistant. We look forward to welcoming you soon!`;
      }
    }
    
    // If no general response was generated, fall back to service-specific responses
    if (!response) {
      switch(selectedService) {
        case 'menu':
          // Menu-specific responses
          if (lowerMessage.includes('special')) {
            response = `Today's specials include a Cornish crab starter with apple and fennel, and a main course of aged Herefordshire beef ribeye with bone marrow sauce.`;
          } else if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
            response = `We offer several vegetarian options including our Truffle Risotto and Wild Mushroom Wellington. For vegans, we have a dedicated plant-based menu available upon request.`;
          } else if (lowerMessage.includes('wine')) {
            response = `Our sommelier has curated an extensive wine list featuring over 300 references from around the world, with a focus on French and Italian regions.`;
          } else {
            response = `Our menu changes seasonally to showcase the best ingredients. Is there a specific dish or dietary requirement you'd like to know about?`;
          }
          break;
          
        case 'reservations':
          // Reservation-specific responses
          if (lowerMessage.includes('cancel') || lowerMessage.includes('change')) {
            response = `To modify or cancel a reservation, please provide your booking reference number. Changes can be made up to 24 hours before your reservation without charge.`;
          } else if (lowerMessage.includes('large') || lowerMessage.includes('group')) {
            response = `For groups of 8 or more, we offer private dining options. Please let me know your preferred date and group size, and I can check availability.`;
          } else {
            response = `To make a reservation, please provide your preferred date, time, and number of guests. Our most popular times book up quickly, so we recommend reserving well in advance.`;
          }
          break;
          
        // Add more service-specific responses as needed
        
        default:
          response = `I'm not sure I understand. Could you please rephrase your question about BROS Mayfair?`;
      }
    }
    
    return response;
  };

  // Handle user identity selection
  const handleIdentitySelection = (identity) => {
    setUserIdentity(identity);
    setShowWelcomeScreen(false);
    setShowServiceSelection(true);
  };

  // Handle service selection
  const handleServiceSelection = (serviceId) => {
    setSelectedService(serviceId);
    setShowServiceSelection(false);
  };

  // Render welcome screen
  const renderWelcomeScreen = () => {
    return (
      <div className={styles.welcomeScreen}>
        <h2>Welcome to BROS Mayfair</h2>
        <p>Please tell us who you are:</p>
        <div className={styles.identityOptions}>
          <button className={styles.identityButton} onClick={() => handleIdentitySelection('Guest')}>Guest</button>
          <button className={styles.identityButton} onClick={() => handleIdentitySelection('Regular Customer')}>Regular Customer</button>
          <button className={styles.identityButton} onClick={() => handleIdentitySelection('Staff Member')}>Staff Member</button>
        </div>
      </div>
    );
  };

  // Render service selection screen
  const renderServiceSelection = () => {
    return (
      <div className={styles.serviceSelectionScreen}>
        <h2>Hello, {userIdentity}! What can I help you with today?</h2>
        <p>Please select a service to get started:</p>
        <div className={styles.serviceOptions}>
          {serviceOptions.map(service => (
            <button 
              key={service.id} 
              onClick={() => handleServiceSelection(service.id)} 
              className={styles.serviceButton}
            >
              <span className={styles.serviceIcon}>{service.icon}</span>
              <span className={styles.serviceName}>{service.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.componentContainer}>
      <div className={styles.chatSection}>
        <div className={styles.chatHeader}>
          <h2>BROS Mayfair AI Assistant</h2>
          {!showWelcomeScreen && !showServiceSelection && (
            <button 
              className={styles.resetButton} 
              onClick={() => {
                setShowWelcomeScreen(true);
                setShowServiceSelection(false);
                setConversation([]);
                setSelectedService('');
              }}
            >
              New Conversation
            </button>
          )}
        </div>
        
        {showWelcomeScreen ? (
          renderWelcomeScreen()
        ) : showServiceSelection ? (
          renderServiceSelection()
        ) : (
          <>
            <div className={styles.messagesContainer}>
              {conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                >
                  {msg.role === 'assistant' && <AssistantAvatar />}
                  <div className={styles.messageContent}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={styles.chatInput}
                disabled={isProcessing}
              />
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={isProcessing || !input.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
      
      {isInvoiceMode && invoiceData && (
        <InvoiceView 
          invoiceData={invoiceData} 
          onClose={() => setIsInvoiceMode(false)} 
        />
      )}
      
      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default Agent; 