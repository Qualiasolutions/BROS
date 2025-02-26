/**
 * Custom module resolver for Next.js to handle Playwright imports
 */
module.exports = function(source) {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Replace imports of Playwright with empty objects
    if (source.includes('playwright') || source.includes('playwright-core')) {
      // Replace direct imports
      source = source.replace(/import\s+.*\s+from\s+['"]playwright.*['"]/g, 
        'const playwright = {}; const chromium = {}; const firefox = {}; const webkit = {};');
      
      // Replace dynamic imports
      source = source.replace(/import\(['"]playwright.*['"]\)/g, 
        'Promise.resolve({})');
    }
  }
  
  return source;
}; 