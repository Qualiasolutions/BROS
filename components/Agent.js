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
    { id: 'hours', name: 'Opening Hours and Location', icon: '🕒' }
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
          initialMessage += 'I can provide information about hosting private events, group bookings, or special occasions at ROMAIN, TOMAS & FAWZI Mayfair.';
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
        default:
          initialMessage += 'What would you like to know about ROMAIN, TOMAS & FAWZI restaurant?';
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
    try {
      console.log("Processing message with AI:", message);
      console.log("Current context:", conversationContext);
      
      // First, try to handle common questions directly without API call
      const lowerMessage = message.toLowerCase();
      
      // Business questions
      if (lowerMessage.includes('how many clients') || lowerMessage.includes('client count')) {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `We currently have ${conversationContext.knownClients.length} active clients in our system. You can view them all in the Clients tab.`
        }]);
        return;
      }
      
      if (lowerMessage.includes('how many suppliers') || lowerMessage.includes('supplier count')) {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `We currently have ${conversationContext.knownSuppliers.length} active suppliers in our system. You can view them all in the Suppliers tab.`
        }]);
        return;
      }
      
      // General knowledge questions
      if (lowerMessage.includes('what time') || lowerMessage.includes('current time')) {
        const now = new Date();
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `The current time is ${now.toLocaleTimeString()}.`
        }]);
        return;
      }
      
      if (lowerMessage.includes('what day') || lowerMessage.includes('what date') || lowerMessage.includes('today')) {
        const now = new Date();
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `Today is ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
        }]);
        return;
      }
      
      if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `I'm the ROMAIN, TOMAS & FAWZI assistant, designed to help you manage your restaurant data, including menu items, reservations, clients, suppliers, and invoices. I can answer questions about your business and help you navigate through different sections of the application.`
        }]);
        return;
      }
      
      if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `I can help you with:
          
1. **Menu Management**: Ask about specific dishes, update menu items, or browse all menu items.
2. **Reservation Management**: Create, modify, or cancel reservations for guests.
3. **Client Management**: Get information about clients and their history with the restaurant.
4. **Supplier Details**: Check supplier information and order status.
5. **Invoice Generation**: Create new invoices for clients with specific amounts.
6. **Navigation**: Switch between different tabs like Menu, Reservations, Clients, Suppliers.
7. **Business Insights**: Get summaries of your restaurant's performance.

You can ask questions like "Show me information about Harrods" or "Generate an invoice for The Ritz for £500".`
        }]);
        return;
      }
      
      // Prepare context for the AI
      const contextHistory = conversation.slice(-5); // Last 5 messages for context
      
      // Call the AI-powered chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: contextHistory,
          context: conversationContext
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from chat API: ${response.status}`, errorText);
        throw new Error(`Error from chat API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Chat API response:", data);
      
      // Add AI response to conversation
      setConversation(prev => {
        // If the last message was a "checking..." message, replace it
        if (prev.length > 0 && 
            prev[prev.length - 1].role === 'assistant' && 
            prev[prev.length - 1].content.includes('Checking')) {
          const newMessages = [...prev];
          newMessages.pop(); // Remove the "checking..." message
          return [...newMessages, { role: 'assistant', content: data.message }];
        }
        
        // Otherwise just add the new message
        return [...prev, { role: 'assistant', content: data.message }];
      });
      
      // Update context with any entities the AI might have identified
      if (data.entities) {
        setConversationContext(prev => ({
          ...prev,
          mentionedEntities: [...prev.mentionedEntities, ...data.entities],
          lastTopic: data.topic || prev.lastTopic
        }));
      }
      
    } catch (error) {
      console.error('Error processing with AI:', error);
      
      // Provide a more helpful fallback response based on the user's query
      const lowerMessage = message.toLowerCase();
      let fallbackResponse = 'I understand you\'re asking about ';
      
      if (lowerMessage.includes('menu') || lowerMessage.includes('dish') || lowerMessage.includes('food')) {
        fallbackResponse += `our menu. We have ${products.length} items on our menu including signature dishes like Beef Wellington, Truffle Risotto, and Dover Sole. You can ask about specific dishes or browse them in the Menu tab.`;
      } else if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
        fallbackResponse += 'clients. We have several active clients including Harrods, Selfridges, and others. You can ask about specific clients or browse them in the Clients tab.';
      } else if (lowerMessage.includes('supplier') || lowerMessage.includes('vendor')) {
        fallbackResponse += 'suppliers. We work with several suppliers including Smithfield Meats, Borough Market Produce, and others. You can ask about specific suppliers or browse them in the Suppliers tab.';
      } else if (lowerMessage.includes('invoice')) {
        fallbackResponse += 'invoices. I can help generate invoices. Please provide a client name and amount, for example: "Generate invoice for Harrods for £500"';
      } else if (lowerMessage.includes('reservation') || lowerMessage.includes('booking')) {
        fallbackResponse += 'reservations. I can help you create, modify, or cancel reservations. Please provide details like name, date, time, and number of guests.';
      } else {
        fallbackResponse = `I'm not sure I understand your question completely. I can help with information about our menu, reservations, clients, suppliers, and invoices. Could you please clarify what you'd like to know?`;
      }
      
      setConversation(prev => {
        // If the last message was a "checking..." message, replace it
        if (prev.length > 0 && 
            prev[prev.length - 1].role === 'assistant' && 
            prev[prev.length - 1].content.includes('Checking')) {
          const newMessages = [...prev];
          newMessages.pop(); // Remove the "checking..." message
          return [...newMessages, { role: 'assistant', content: fallbackResponse }];
        }
        
        // Otherwise just add the new message
        return [...prev, { role: 'assistant', content: fallbackResponse }];
      });
    }
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
        <h2>Who am I speaking to?</h2>
        <div className={styles.identityOptions}>
          <button onClick={() => handleIdentitySelection('Romain')} className={styles.identityButton}>Romain</button>
          <button onClick={() => handleIdentitySelection('Tomas')} className={styles.identityButton}>Tomas</button>
          <button onClick={() => handleIdentitySelection('Fawzi')} className={styles.identityButton}>Fawzi</button>
          <button onClick={() => handleIdentitySelection('Other team member')} className={styles.identityButton}>Other team member</button>
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
    <div className={styles.chatSection}>
      {showWelcomeScreen ? (
        renderWelcomeScreen()
      ) : showServiceSelection ? (
        renderServiceSelection()
      ) : (
        <>
          <div className={styles.messagesContainer}>
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                {message.role === 'assistant' && <AssistantAvatar />}
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            ))}
            {isProcessing && <LoadingScreen />}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about ROMAIN, TOMAS & FAWZI restaurant..."
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
  );
};

export default Agent; 