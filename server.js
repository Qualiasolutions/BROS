const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Special handling for API routes that might use Playwright
    if (pathname.startsWith('/api/')) {
      // Add a try-catch block to handle any errors in API routes
      try {
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('API route error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    } else {
      // Regular page handling
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 