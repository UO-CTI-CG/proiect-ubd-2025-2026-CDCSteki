import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar Component
 * Bară de navigație principală cu logo, link-uri și user menu
 * Se afișează doar pentru utilizatori autentificați
 */
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Health Tracker</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              Dashboard
            </Link>
            <Link
              to="/records"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/records')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              Records
            </Link>
            <Link
              to="/add-record"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/add-record')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              Add Record
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="hidden md:flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/dashboard')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Dashboard
          </Link>
          <Link
            to="/records"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/records')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Records
          </Link>
          <Link
            to="/add-record"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${isActive('/add-record')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Add Record
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;