/**
 * VIRK Tools & Equipment - Server Entry Point
 *
 * Initializes environment, tests database connectivity,
 * and starts the Express HTTP server.
 */

// Load environment variables first
require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server after verifying database connectivity.
 */
async function startServer() {
  try {
    // Test database connection before starting the server
    await testConnection();

    // Start listening for HTTP requests
    const server = app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('  VIRK Tools & Equipment - Backend API Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  Environment : ${NODE_ENV}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  URL         : http://localhost:${PORT}`);
      console.log(`  Health      : http://localhost:${PORT}/api/health`);
      console.log(`  API Base    : http://localhost:${PORT}/api/v1`);
      console.log('═══════════════════════════════════════════════════');
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });

      // Force close after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// =============================================================================
// GLOBAL ERROR HANDLERS
// =============================================================================

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error.name, error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
