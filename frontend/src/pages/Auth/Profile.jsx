import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../components/Common/Toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState('general'); 
  const [loading, setLoading] = useState(false);

  // State
  const [username, setUsername] = useState(user?.username || '');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update Username
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.updateProfile({ username });
      updateUser(data.user); 
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      showToast('Password changed successfully', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar Tabs */}
          <div className="md:w-1/4 bg-gray-50 border-r border-gray-200 p-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${activeTab === 'general' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600'}`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'security' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-600'}`}
            >
              Security
            </button>
          </div>

          {/* Content */}
          <div className="md:w-3/4 p-8">
            {activeTab === 'general' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Email</label>
                   <input type="text" value={user?.email || ''} disabled className="mt-1 block w-full bg-gray-100 p-2 border rounded-md text-gray-500"/>
                </div>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                <button type="submit" disabled={loading} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;