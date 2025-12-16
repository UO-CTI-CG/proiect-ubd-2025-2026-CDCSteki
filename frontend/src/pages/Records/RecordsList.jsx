import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recordsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';

const RecordsList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await recordsAPI.getAll({ limit: 100, sortBy: 'date' });
      setRecords(data.records);
    } catch (error) {
      showToast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await recordsAPI.delete(id);
      showToast('Record deleted successfully', 'success');
      setRecords(records.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      showToast('Failed to delete record', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeOfDayBadge = (timeOfDay) => {
    const colors = {
      morning: 'bg-yellow-100 text-yellow-800',
      afternoon: 'bg-orange-100 text-orange-800',
      evening: 'bg-purple-100 text-purple-800',
      night: 'bg-blue-100 text-blue-800'
    };
    return colors[timeOfDay] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loading message="Loading records..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
            <p className="mt-2 text-gray-600">View and manage your health history</p>
          </div>
          <Link
            to="/add-record"
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Record
          </Link>
        </div>

        {/* Empty State */}
        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No records yet</h3>
            <p className="mt-2 text-gray-600">Start tracking your health by creating your first record.</p>
            <Link to="/add-record" className="mt-6 inline-block btn-primary">
              Create First Record
            </Link>
          </div>
        ) : (
          /* Records Grid */
          <div className="grid grid-cols-1 gap-6">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{formatDate(record.date)}</h3>
                        <p className="text-sm text-gray-500">ID: {record.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/records/${record.id}`)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Basic Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {record.weight && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{record.weight} kg</p>
                      </div>
                    )}
                    {record.steps && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Steps</p>
                        <p className="text-lg font-semibold text-gray-900">{record.steps.toLocaleString()}</p>
                      </div>
                    )}
                    {record.sleepHours && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Sleep</p>
                        <p className="text-lg font-semibold text-gray-900">{record.sleepHours} hrs</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Vital Signs</p>
                      <p className="text-lg font-semibold text-gray-900">{record.vitalSigns?.length || 0}</p>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  {record.vitalSigns && record.vitalSigns.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Vital Signs</h4>
                      <div className="space-y-2">
                        {record.vitalSigns.map((vital) => (
                          <div key={vital.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getTimeOfDayBadge(vital.timeOfDay)}`}>
                                {vital.timeOfDay}
                              </span>
                              <div className="flex items-center space-x-4 text-sm">
                                {vital.heartRate && (
                                  <span className="text-gray-700">
                                    <span className="font-medium">HR:</span> {vital.heartRate} bpm
                                  </span>
                                )}
                                {(vital.bloodPressureSystolic || vital.bloodPressureDiastolic) && (
                                  <span className="text-gray-700">
                                    <span className="font-medium">BP:</span> {vital.bloodPressureSystolic || '--'}/{vital.bloodPressureDiastolic || '--'}
                                  </span>
                                )}
                                {vital.temperature && (
                                  <span className="text-gray-700">
                                    <span className="font-medium">Temp:</span> {vital.temperature}°C
                                  </span>
                                )}
                                {vital.oxygenSaturation && (
                                  <span className="text-gray-700">
                                    <span className="font-medium">SpO2:</span> {vital.oxygenSaturation}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3">
                      <p className="text-sm text-blue-800">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Record</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsList;