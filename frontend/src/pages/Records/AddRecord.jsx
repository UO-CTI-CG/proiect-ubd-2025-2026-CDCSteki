import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recordsAPI } from '../../services/api';
import { useToast } from '../../components/Common/Toast';
import Loading from '../../components/Common/Loading';

const AddRecord = () => {
  const { id } = useParams(); // Dacă există id, suntem în modul EDIT
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Record data - doar daily metrics
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [notes, setNotes] = useState('');

  // Vital Signs - doar pentru ADD mode
  const [vitalSigns, setVitalSigns] = useState([
    { timeOfDay: 'morning', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', temperature: '', oxygenSaturation: '', notes: '' }
  ]);

  useEffect(() => {
    if (isEditMode) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      const data = await recordsAPI.getById(id);
      
      // Încarcă doar daily metrics
      setDate(data.record.date.split('T')[0]);
      setWeight(data.record.weight || '');
      setSteps(data.record.steps || '');
      setSleepHours(data.record.sleepHours || '');
      setNotes(data.record.notes || '');
      
      setLoading(false);
    } catch (error) {
      showToast('Failed to load record', 'error');
      navigate('/records');
    }
  };

  const addVitalSign = () => {
    setVitalSigns([
      ...vitalSigns,
      { timeOfDay: 'evening', heartRate: '', bloodPressureSystolic: '', bloodPressureDiastolic: '', temperature: '', oxygenSaturation: '', notes: '' }
    ]);
  };

  const removeVitalSign = (index) => {
    setVitalSigns(vitalSigns.filter((_, i) => i !== index));
  };

  const updateVitalSign = (index, field, value) => {
    const updated = [...vitalSigns];
    updated[index][field] = value;
    setVitalSigns(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data - doar daily metrics
      const recordData = {
        date,
        weight: weight ? parseFloat(weight) : null,
        steps: steps ? parseInt(steps) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        notes: notes || null
      };

      // Adaugă vital signs doar dacă suntem în ADD mode
      if (!isEditMode) {
        recordData.vitalSigns = vitalSigns
          .filter(v => v.heartRate || v.bloodPressureSystolic || v.bloodPressureDiastolic || v.temperature || v.oxygenSaturation)
          .map(v => ({
            timeOfDay: v.timeOfDay,
            heartRate: v.heartRate ? parseInt(v.heartRate) : null,
            bloodPressureSystolic: v.bloodPressureSystolic ? parseInt(v.bloodPressureSystolic) : null,
            bloodPressureDiastolic: v.bloodPressureDiastolic ? parseInt(v.bloodPressureDiastolic) : null,
            temperature: v.temperature ? parseFloat(v.temperature) : null,
            oxygenSaturation: v.oxygenSaturation ? parseInt(v.oxygenSaturation) : null,
            notes: v.notes || null
          }));
      }

      if (isEditMode) {
        await recordsAPI.update(id, recordData);
        showToast('Daily metrics updated successfully!', 'success');
        setTimeout(() => navigate(`/records/${id}`), 1000);
      } else {
        await recordsAPI.create(recordData);
        showToast('Record created successfully!', 'success');
        setTimeout(() => navigate('/records'), 1000);
      }
    } catch (error) {
      showToast(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} record`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading record..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Daily Metrics' : 'Add Health Record'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode 
              ? 'Update your weight, steps, and sleep data' 
              : 'Track your daily health metrics and vital signs'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Daily Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isEditMode}
                  className={`input-field ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.5"
                  className="input-field"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="10000"
                  className="input-field"
                />
              </div>

              {/* Sleep Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                  className="input-field"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today?"
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Vital Signs Card - doar în ADD mode */}
          {!isEditMode && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Vital Signs
                </h2>
                <button
                  type="button"
                  onClick={addVitalSign}
                  className="btn-primary text-sm"
                >
                  + Add Vital Sign
                </button>
              </div>

              {vitalSigns.map((vital, index) => (
                <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Measurement #{index + 1}</h3>
                    {vitalSigns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVitalSign(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Time of Day */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                      <select
                        value={vital.timeOfDay}
                        onChange={(e) => updateVitalSign(index, 'timeOfDay', e.target.value)}
                        className="input-field"
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>

                    {/* Heart Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        value={vital.heartRate}
                        onChange={(e) => updateVitalSign(index, 'heartRate', e.target.value)}
                        placeholder="72"
                        className="input-field"
                      />
                    </div>

                    {/* BP Systolic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BP Systolic (mmHg)
                      </label>
                      <input
                        type="number"
                        value={vital.bloodPressureSystolic}
                        onChange={(e) => updateVitalSign(index, 'bloodPressureSystolic', e.target.value)}
                        placeholder="120"
                        className="input-field"
                      />
                    </div>

                    {/* BP Diastolic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BP Diastolic (mmHg)
                      </label>
                      <input
                        type="number"
                        value={vital.bloodPressureDiastolic}
                        onChange={(e) => updateVitalSign(index, 'bloodPressureDiastolic', e.target.value)}
                        placeholder="80"
                        className="input-field"
                      />
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={vital.temperature}
                        onChange={(e) => updateVitalSign(index, 'temperature', e.target.value)}
                        placeholder="36.6"
                        className="input-field"
                      />
                    </div>

                    {/* Oxygen Saturation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SpO2 (%)
                      </label>
                      <input
                        type="number"
                        value={vital.oxygenSaturation}
                        onChange={(e) => updateVitalSign(index, 'oxygenSaturation', e.target.value)}
                        placeholder="98"
                        className="input-field"
                      />
                    </div>

                    {/* Vital Notes */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        value={vital.notes}
                        onChange={(e) => updateVitalSign(index, 'notes', e.target.value)}
                        placeholder="After workout, resting, etc."
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info message în Edit mode */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900">Note</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You're editing only daily metrics (weight, steps, sleep, notes). To edit vital signs, go to the record details page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/records/${id}` : '/records')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? 'Update Metrics' : 'Save Record'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecord;