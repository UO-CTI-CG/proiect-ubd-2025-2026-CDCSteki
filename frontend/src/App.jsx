import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AddRecord from './pages/Records/AddRecord';
import RecordsList from './pages/Records/RecordsList';
import RecordDetails from './pages/Records/RecordDetails';
import Profile from './pages/Auth/profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/records"
              element={
                <ProtectedRoute>
                  <RecordsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/records/:id"
              element={
                <ProtectedRoute>
                  <RecordDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-record"
              element={
                <ProtectedRoute>
                  <AddRecord />
                </ProtectedRoute>
              }
            />
            <Route
              path="/records/:id/edit"
              element={
                <ProtectedRoute>
                  <AddRecord />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;