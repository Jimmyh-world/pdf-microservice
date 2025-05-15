const app = require('./index');

const port = process.env.PORT || 3000;

// Start the server on the specified port
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`PDF Service running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Export server for testing
module.exports = server;
