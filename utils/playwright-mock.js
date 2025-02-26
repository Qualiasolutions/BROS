/**
 * Mock implementation of Playwright for client-side use
 * This prevents the actual Playwright code from being included in the client bundle
 */

// Mock browser class
class MockBrowser {
  async newContext() {
    return new MockContext();
  }
  
  async close() {
    return Promise.resolve();
  }
}

// Mock context class
class MockContext {
  async newPage() {
    return new MockPage();
  }
}

// Mock page class with all the methods used in our automation
class MockPage {
  async goto() {
    return Promise.resolve();
  }
  
  async fill() {
    return Promise.resolve();
  }
  
  async click() {
    return Promise.resolve();
  }
  
  async waitForNavigation() {
    return Promise.resolve();
  }
  
  async waitForSelector() {
    return Promise.resolve();
  }
  
  async textContent() {
    return "MOCK-CONTENT";
  }
  
  async waitForTimeout() {
    return Promise.resolve();
  }
}

// Mock chromium object
const chromium = {
  launch: async () => {
    return new MockBrowser();
  }
};

// Export the mock implementation
export default {
  chromium
};

// Default export for ESM
export const __esModule = true; 