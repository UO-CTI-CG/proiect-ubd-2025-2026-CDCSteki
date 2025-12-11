import jwt from 'jsonwebtoken';

/**
 * Middleware pentru verificarea autentificării
 * Verifică dacă request-ul are un token JWT valid
 * Dacă da, adaugă userId în req.user
 * Dacă nu, returnează eroare 401/403
 */
const authenticateToken = (req, res, next) => {
  // 1. Extrage token-ul din header
  // Format așteptat: "Bearer TOKEN_HERE"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ia partea după "Bearer "

  // 2. Dacă nu există token, returnează 401 Unauthorized
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    // 3. Verifică token-ul cu JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Adaugă userId în request (îl putem folosi în controllers)
    req.user = decoded; // decoded = { userId: 123 }
    
    // 5. Continuă la următorul middleware/controller
    next();
  } catch (error) {
    // Token invalid sau expirat
    return res.status(403).json({ 
      error: 'Invalid or expired token.' 
    });
  }
};

export default authenticateToken;