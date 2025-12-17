import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';
import { authProtection, arcjetMiddleware } from '../config/arcjet.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Înregistrare utilizator nou
 * @access Public
 * @protection Arcjet (5 requests / 15 min per IP)
 */
router.post('/register', arcjetMiddleware(authProtection), register);

/**
 * @route POST /api/auth/login
 * @desc Autentificare utilizator
 * @access Public
 * @protection Arcjet anti brute-force (5 requests / 15 min per IP)
 */
router.post('/login', arcjetMiddleware(authProtection), login);

/**
 * @route GET /api/auth/profile
 * @desc Obține profilul utilizatorului curent
 * @access Private
 * @requires Authorization header: Bearer <token>
 */
router.get('/profile', authenticateToken, getProfile);

export default router;