import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';
import { authProtection, arcjetMiddleware } from '../config/arcjet.js';

const router = express.Router();

/**
 * RUTE PENTRU AUTENTIFICARE
 * Base path: /api/auth
 * Toate rutele publice (register, login) au protecție Arcjet
 */

/**
 * @route   POST /api/auth/register
 * @desc    Înregistrare utilizator nou
 * @access  Public
 * @body    { username, email, password }
 * @returns { token, user }
 * @protection Arcjet (rate limiting STRICT + bot detection)
 */
router.post('/register', arcjetMiddleware(authProtection), register);

/**
 * @route   POST /api/auth/login
 * @desc    Autentificare utilizator existent
 * @access  Public
 * @body    { email, password }
 * @returns { token, user }
 * @protection Arcjet (rate limiting STRICT + bot detection)
 * 
 * IMPORTANT: Protecție anti brute-force
 * - Max 5 încercări în 15 minute per IP
 * - Blochează bot-uri automate
 */
router.post('/login', arcjetMiddleware(authProtection), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obține profilul utilizatorului curent
 * @access  Private (necesită token în header)
 * @header  Authorization: Bearer <token>
 * @returns { user }
 */
router.get('/profile', authenticateToken, getProfile);

export default router;