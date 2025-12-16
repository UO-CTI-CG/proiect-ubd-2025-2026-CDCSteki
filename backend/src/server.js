/**
 * HEALTH TRACKER BACKEND SERVER
 * Server Express cu PostgreSQL (Neon) + Prisma 7 ORM
 */

// ============================================
// 1. IMPORT DEPENDENCIES
// ============================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.ts'; 

// Import routes
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';

// ============================================
// 2. CONFIGURARE
// ============================================

// Încarcă variabilele din .env
dotenv.config();

// Inițializează Express app
const app = express();

// Port (din .env sau default 5000)
const PORT = process.env.PORT || 5000;

// ============================================
// 3. MIDDLEWARE GLOBAL
// ============================================

/**
 * Body Parser - parsează JSON din request body
 * Fără asta, req.body ar fi undefined
 */
app.use(express.json());

/**
 * URL Encoded - parsează form data
 */
app.use(express.urlencoded({ extended: true }));

/**
 * CORS - permite frontend-ului să comunice cu backend-ul
 * Frontend rulează pe localhost:3000
 * Backend rulează pe localhost:5000
 */
app.use(cors({
  origin: 'http://localhost:3000', // URL-ul frontend-ului React
  credentials: true
}));

/**
 * Logger simplu - afișează fiecare request în consolă
 * Util pentru debugging
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================================
// 4. RUTE (ENDPOINTS)
// ============================================

/**
 * Rută de test - verifică dacă serverul funcționează
 * GET http://localhost:5000/
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Health Tracker API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      records: '/api/records'
    }
  });
});

/**
 * Health check - verifică conexiunea la baza de date
 * GET http://localhost:5000/health
 */
app.get('/health', async (req, res) => {
  try {
    // Încearcă o query simplă la DB
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

/**
 * Rute pentru autentificare
 * Base path: /api/auth
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET  /api/auth/profile
 */
app.use('/api/auth', authRoutes);

/**
 * Rute pentru health records
 * Base path: /api/records
 * - GET    /api/records
 * - GET    /api/records/:id
 * - POST   /api/records
 * - PUT    /api/records/:id
 * - DELETE /api/records/:id
 * - GET    /api/records/statistics
 */
app.use('/api/records', recordRoutes);

// ============================================
// 5. ERROR HANDLING
// ============================================

/**
 * 404 Handler - rută inexistentă
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.url}`,
    availableEndpoints: {
      auth: '/api/auth',
      records: '/api/records'
    }
  });
});

/**
 * Global Error Handler - prinde toate erorile
 */
app.use((error, req, res, next) => {
  console.error('Global Error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ============================================
// 6. START SERVER
// ============================================

/**
 * Pornește serverul
 */
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Health Tracker Backend Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log(`  - GET  http://localhost:${PORT}/`);
  console.log(`  - GET  http://localhost:${PORT}/health`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  - GET  http://localhost:${PORT}/api/records`);
  console.log('='.repeat(50));
});

/**
 * Graceful Shutdown - închide conexiunea la DB când oprești serverul
 */
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});