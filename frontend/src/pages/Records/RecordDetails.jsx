import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recordsAPI, vitalSignsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';

const RecordDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingVital, setEditingVital] = useState(null);
  const [showAddVital, setShowAddVital] = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const data = await recordsAPI.getById(id);
      setRecord(data.record);
    } catch (error) {
      showToast('Failed to load record', 'error');
      navigate('/records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeOfDayBadge = (timeOfDay) => {
    const configs = {
      morning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🌅' },
      afternoon: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '☀️' },
      evening: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🌆' },
      night: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🌙' }
    };
    const config = configs[timeOfDay] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⏰' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {timeOfDay}
      </span>
    );
  };

  const handleDeleteVital = async (vitalId) => {
    if (!window.confirm('Are you sure you want to delete this vital sign?')) return;
    
    try {
      await vitalSignsAPI.delete(id, vitalId);
      showToast('Vital sign deleted successfully', 'success');
      fetchRecord();
    } catch (error) {
      showToast('Failed to delete vital sign', 'error');
    }
  };

  if (loading) {
    return <Loading message="Loading record details..." />;
  }

  if (!record) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/records')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Records
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{formatDate(record.date)}</h1>
              <p className="mt-2 text-gray-600">Record ID: {record.id}</p>
            </div>
            <Link
              to={`/records/${id}/edit`}
              className="btn-secondary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Daily Metrics
            </Link>
          </div>
        </div>

        {/* Basic Metrics Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Daily Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-primary-700">Weight</p>
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{record.weight || '--'} <span className="text-lg text-gray-600">kg</span></p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-700">Steps</p>
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{record.steps?.toLocaleString() || '--'}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Sleep</p>
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900">{record.sleepHours || '--'} <span className="text-lg text-gray-600">hrs</span></p>
            </div>
          </div>

          {record.notes && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
              <p className="text-blue-800">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Vital Signs Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Vital Signs ({record.vitalSigns?.length || 0})
            </h2>
            <button
              onClick={() => setShowAddVital(true)}
              className="btn-primary text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vital Sign
            </button>
          </div>

          {record.vitalSigns && record.vitalSigns.length > 0 ? (
            <div className="space-y-4">
              {record.vitalSigns.map((vital) => (
                <VitalSignCard
                  key={vital.id}
                  vital={vital}
                  onEdit={() => setEditingVital(vital)}
                  onDelete={() => handleDeleteVital(vital.id)}
                  formatTime={formatTime}
                  getTimeOfDayBadge={getTimeOfDayBadge}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-gray-600">No vital signs recorded yet</p>
              <button
                onClick={() => setShowAddVital(true)}
                className="mt-4 btn-primary text-sm"
              >
                Add First Vital Sign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Vital Sign Modal */}
      {editingVital && (
        <EditVitalModal
          vital={editingVital}
          recordId={id}
          onClose={() => setEditingVital(null)}
          onSuccess={() => {
            fetchRecord();
            setEditingVital(null);
          }}
          showToast={showToast}
        />
      )}

      {/* Add Vital Sign Modal */}
      {showAddVital && (
        <AddVitalModal
          recordId={id}
          onClose={() => setShowAddVital(false)}
          onSuccess={() => {
            fetchRecord();
            setShowAddVital(false);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// Vital Sign Card Component
const VitalSignCard = ({ vital, onEdit, onDelete, formatTime, getTimeOfDayBadge }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-primary-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTimeOfDayBadge(vital.timeOfDay)}
          <span className="text-sm text-gray-500">{formatTime(vital.timestamp)}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {vital.heartRate && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Heart Rate</p>
            <p className="text-lg font-semibold text-gray-900">{vital.heartRate} <span className="text-sm text-gray-600">bpm</span></p>
          </div>
        )}
        {vital.bloodPressureSystolic && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
            <p className="text-lg font-semibold text-gray-900">
              {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic || '--'} <span className="text-sm text-gray-600">mmHg</span>
            </p>
          </div>
        )}
        {vital.temperature && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Temperature</p>
            <p className="text-lg font-semibold text-gray-900">{vital.temperature} <span className="text-sm text-gray-600">°C</span></p>
          </div>
        )}
        {vital.oxygenSaturation && (
          <div>
            <p className="text-xs text-gray-600 mb-1">SpO2</p>
            <p className="text-lg font-semibold text-gray-900">{vital.oxygenSaturation} <span className="text-sm text-gray-600">%</span></p>
          </div>
        )}
      </div>

      {vital.notes && (
        <div className="mt-4 bg-white border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-700">{vital.notes}</p>
        </div>
      )}
    </div>
  );
};

// Edit Vital Modal Component
const EditVitalModal = ({ vital, recordId, onClose, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    timeOfDay: vital.timeOfDay,
    heartRate: vital.heartRate || '',
    bloodPressureSystolic: vital.bloodPressureSystolic || '',
    bloodPressureDiastolic: vital.bloodPressureDiastolic || '',
    temperature: vital.temperature || '',
    oxygenSaturation: vital.oxygenSaturation || '',
    notes: vital.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vitalSignsAPI.update(recordId, vital.id, {
        timeOfDay: formData.timeOfDay,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
        notes: formData.notes || null
      });
      showToast('Vital sign updated successfully', 'success');
      onSuccess();
    } catch (error) {
      showToast('Failed to update vital sign', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VitalFormModal
      title="Edit Vital Sign"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onClose={onClose}
      loading={loading}
      submitText="Update"
    />
  );
};

// Add Vital Modal Component
const AddVitalModal = ({ recordId, onClose, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    timeOfDay: 'morning',
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    oxygenSaturation: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vitalSignsAPI.add(recordId, {
        timeOfDay: formData.timeOfDay,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
        notes: formData.notes || null
      });
      showToast('Vital sign added successfully', 'success');
      onSuccess();
    } catch (error) {
      showToast('Failed to add vital sign', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VitalFormModal
      title="Add Vital Sign"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onClose={onClose}
      loading={loading}
      submitText="Add"
    />
  );
};

// Reusable Vital Form Modal
const VitalFormModal = ({ title, formData, setFormData, onSubmit, onClose, loading, submitText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <form onSubmit={onSubmit}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Time of Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
              <select
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                className="input-field"
                required
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  placeholder="72"
                  className="input-field"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="36.6"
                  className="input-field"
                />
              </div>

              {/* BP Systolic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  placeholder="120"
                  className="input-field"
                />
              </div>

              {/* BP Diastolic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  placeholder="80"
                  className="input-field"
                />
              </div>

              {/* SpO2 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation (%)</label>
                <input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  placeholder="98"
                  className="input-field"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="After workout, resting, etc."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDetails;