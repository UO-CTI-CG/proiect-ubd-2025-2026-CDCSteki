import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { recordsAPI } from '../../services/api';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';

const datePickerStyles = `
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker__input-container input {
    width: 100%; 
    padding: 0.75rem 2.5rem 0.75rem 2.5rem; /* Loc stânga (calendar) și dreapta (X) */
    border-radius: 0.5rem;
    border: 1px solid #d1d5db; 
    outline: none; 
    transition: all 0.2s;
  }
  .react-datepicker__input-container input:focus {
    border-color: #8b5cf6; 
    ring: 2px solid #8b5cf6;
  }
  
  .react-datepicker__close-icon::after {
    background-color: transparent !important; /* Fără fundal */
    color: #9ca3af; /* X-ul este gri */
    font-size: 1.5rem;
    font-weight: bold;
    right: 5px; /* Ajustare poziție */
  }
`;

const RecordsList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchLatestRecords();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredRecords();
    } else if (!startDate && !endDate && isFiltered) {
      fetchLatestRecords();
    }
  }, [startDate, endDate]);

  const fetchLatestRecords = async () => {
    try {
      setLoading(true);
      setIsFiltered(false);
      const data = await recordsAPI.getAll({ limit: 5, sortBy: 'date' });
      setRecords(data.records);
    } catch (error) {
      showToast('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredRecords = async () => {
    try {
      setLoading(true);
      setIsFiltered(true);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await recordsAPI.getAll({ 
        limit: 1000, 
        sortBy: 'date',
        startDate: startDate.toISOString(),
        endDate: endOfDay.toISOString()
      });
      setRecords(data.records);
      
      if (data.records.length === 0) {
        showToast('No records found for this period', 'info');
      }
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
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getTimeBadgeColor = (time) => {
    switch(time) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-green-100 text-green-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      case 'night': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style>{datePickerStyles}</style>
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>
            <p className="mt-1 text-gray-600">
              {isFiltered ? 'Viewing filtered results' : 'Showing latest 5 records'}
            </p>
          </div>
          <Link
            to="/add-record"
            className="btn-primary flex items-center justify-center md:w-auto w-full shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Record
          </Link>
        </div>

        {/* ZONA FILTRARE */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Filter by Date Range
          </label>
          <div className="relative">
            {/* Calendar Icon - Stânga */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Select start and end date..."
              className="input-field cursor-pointer"
              dateFormat="MMM d, yyyy"
              maxDate={new Date()}
            />
          </div>
        </div>

        {/* REZULTATE */}
        {loading ? (
          <div className="py-12">
            <Loading message={isFiltered ? "Searching records..." : "Loading latest records..."} />
          </div>
        ) : (
          <>
            {records.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                <p className="text-gray-500 mt-1">
                  {isFiltered 
                    ? "Try adjusting your date range." 
                    : "You haven't added any health records yet."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 animate-fade-in">
              {records.map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-lg border border-primary-100">
                          {new Date(record.date).getDate()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{formatDate(record.date)}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                             {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/records/${record.id}`)}
                          className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(record.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {record.weight && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Weight</span>
                          <span className="font-semibold text-gray-900">{record.weight} kg</span>
                        </div>
                      )}
                      
                      {record.steps && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Steps</span>
                          <span className="font-semibold text-gray-900">{record.steps.toLocaleString()}</span>
                        </div>
                      )}

                      {/* --- SLEEP --- */}
                      {record.sleepHours && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 block">Sleep</span>
                          <span className="font-semibold text-gray-900">{record.sleepHours} hrs</span>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2 overflow-x-auto">
                         <span className="text-xs text-gray-500 block whitespace-nowrap">Vitals:</span>
                         {record.vitalSigns && record.vitalSigns.length > 0 ? (
                           record.vitalSigns.map(v => (
                             <span key={v.id} className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getTimeBadgeColor(v.timeOfDay)}`}>
                               {v.timeOfDay}
                             </span>
                           ))
                         ) : (
                           <span className="text-xs text-gray-400 italic">None</span>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Record?</h3>
            <p className="text-gray-600 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsList;