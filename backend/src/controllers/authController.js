import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.ts';

/**
 * Înregistrează un utilizator nou
 * 
 * @route POST /api/auth/register
 * @param {Object} req.body - { username, email, password }
 * @returns {Object} { message, token, user }
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Autentifică un utilizator existent
 * 
 * @route POST /api/auth/login
 * @param {Object} req.body - { email, password }
 * @returns {Object} { message, token, user }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    res.status(500).json({ error: 'Server error during login' });
  }
};

/**
 * Obține informații despre utilizatorul autentificat
 * 
 * @route GET /api/auth/profile
 * @requires Authentication
 * @returns {Object} { user }
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Actualizează profilul utilizatorului (Username)
 * * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Opțional: Verificăm dacă username-ul este luat deja de altcineva
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: username,
        NOT: { id: userId } // Excludem userul curent
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
    });

    // Returnăm userul fără parolă
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Could not update profile' });
  }
};

/**
 * Schimbă parola utilizatorului
 * * @route PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // 1. Găsim userul pentru a lua parola hash-uită curentă
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Verificăm parola veche
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // 3. Hash parola nouă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update în DB
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Could not change password' });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};