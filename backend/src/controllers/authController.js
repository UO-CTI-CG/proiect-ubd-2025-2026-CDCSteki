import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.ts'; // ← .js obligatoriu în ES Modules!

/**
 * REGISTER - Creează cont nou
 * POST /api/auth/register
 * Body: { username, email, password }
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validări de bază
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // 2. Verifică dacă user-ul există deja
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // 3. Hash-uiește parola (IMPORTANT - nu salvăm parola plain!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Creează user-ul în DB
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    // 5. Generează JWT token
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token-ul expiră după 7 zile
    );

    // 6. Returnează succes (NU returnăm parola!)
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Server error during registration' 
    });
  }
};

/**
 * LOGIN - Autentificare
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validări
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // 2. Caută user-ul după email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // 3. Verifică parola (compară cu hash-ul din DB)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // 4. Generează token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Returnează success
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login' 
    });
  }
};

/**
 * GET PROFILE - Informații user curent
 * GET /api/auth/profile
 * Necesită autentificare (token în header)
 */
const getProfile = async (req, res) => {
  try {
    // req.user vine din middleware-ul authenticateToken
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        // NU selectăm password!
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Server error' 
    });
  }
};

export {
  register,
  login,
  getProfile
};