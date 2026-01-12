import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';

/**
 * Protected Route Component
 * Verifică autentificarea înainte de a randa componenta copil
 * Redirecționează la /login dacă utilizatorul nu este autentificat
 * 
 * @param {Object} children - Componenta React de protejat
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;