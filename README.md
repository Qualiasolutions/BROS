# ROMAIN, TOMAS & FAWZI Restaurant Management System

A comprehensive restaurant management system for ROMAIN, TOMAS & FAWZI Mayfair, featuring reservation management, menu control, inventory tracking, and an AI assistant.

## Features

- **Dashboard**: Real-time overview of key restaurant metrics
- **Reservation Management**: Handle bookings, table assignments, and guest information
- **Menu Management**: Update menu items, prices, and availability
- **Staff Scheduling**: Manage employee shifts and roles
- **Inventory Management**: Track stock levels and receive alerts for low inventory
- **Financial Reports**: View sales data, revenue, and expenses
- **Customer Management**: Store customer information and preferences
- **AI Assistant**: Natural language interface to navigate the system and perform tasks

## Tech Stack

- **Frontend**: React, Next.js
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **Database**: MongoDB
- **AI Integration**: LangChain, Anthropic, OpenAI
- **Automation**: Playwright for reservation system integration

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/bros-mayfair.git
   cd bros-mayfair
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/bros-mayfair
   RESERVATION_SYSTEM_USERNAME=your_username
   RESERVATION_SYSTEM_PASSWORD=your_password
   LANGCHAIN_API_KEY=your_langchain_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/components`: React components
- `/pages`: Next.js pages and API routes
- `/public`: Static assets
- `/styles`: CSS modules
- `/utils`: Utility functions and helpers

## AI Assistant

The AI Assistant can help with:

- Creating and managing reservations
- Checking inventory levels
- Viewing financial data
- Managing staff schedules
- Answering questions about the restaurant

Example commands:
- "Show me today's reservations"
- "Create a reservation for James Wilson for 4 people tomorrow at 7:30 PM"
- "What are our top-selling menu items this week?"
- "Check inventory levels for wine"
- "Show me the revenue report for this month"

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For support or inquiries, please contact:
- Email: support@bros-mayfair.com
- Phone: +44 20 1234 5678