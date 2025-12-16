import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recordsAPI } from '../../services/api';
import StatsCard from '../../components/Dashboard/StatsCard';
import { WeightChart, StepsChart, HeartRateChart, BloodPressureChart } from '../../components/Dashboard/Charts';
import Loading from '../../components/Common/Loading';
import { useToast } from '../../components/Common/Toast';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsData = await recordsAPI.getStatistics(period);
      setStatistics(statsData);

      // Fetch recent records pentru grafice
      const recordsData = await recordsAPI.getAll({ limit: 30, sortBy: 'date' });
      setRecentRecords(recordsData.records);

    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data pentru grafice
  const prepareChartData = () => {
  if (!recentRecords || recentRecords.length === 0) {
    return { 
      weightData: [], 
      stepsData: [], 
      heartRateData: [], 
      bloodPressureData: [] 
    };
  }

  const sortedRecords = [...recentRecords].sort((a, b) => new Date(a.date) - new Date(b.date));

  const weightData = sortedRecords.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: r.weight
  })).filter(d => d.weight);

  const stepsData = sortedRecords.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    steps: r.steps
  })).filter(d => d.steps);

  const heartRateData = sortedRecords.map(r => {
    const morning = r.vitalSigns?.find(v => v.timeOfDay === 'morning');
    const evening = r.vitalSigns?.find(v => v.timeOfDay === 'evening');
    
    return {
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      morning: morning?.heartRate,
      evening: evening?.heartRate
    };
  }).filter(d => d.morning || d.evening);

  const bloodPressureData = sortedRecords.map(r => {
    const morningVital = r.vitalSigns?.find(v => v.timeOfDay === 'morning');
    
    return {
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: morningVital?.bloodPressureSystolic,
      diastolic: morningVital?.bloodPressureDiastolic
    };
  }).filter(d => d.systolic || d.diastolic);

  return { weightData, stepsData, heartRateData, bloodPressureData };
};

  const { weightData, stepsData, heartRateData, bloodPressureData } = prepareChartData();

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  const stats = statistics?.statistics;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's your health overview.</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <div className="flex space-x-2">
            {['week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Average Weight"
            value={stats?.weight?.average}
            unit="kg"
            color="primary"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            }
          />
          
          <StatsCard
            title="Average Steps"
            value={stats?.steps?.average}
            unit="steps"
            color="purple"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Average Heart Rate"
            value={stats?.vitalSigns?.overall?.heartRate?.average}
            unit="bpm"
            color="pink"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Average Sleep"
            value={stats?.sleepHours?.average}
            unit="hours"
            color="green"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {weightData.length > 0 && <WeightChart data={weightData} />}
          {stepsData.length > 0 && <StepsChart data={stepsData} />}
          {heartRateData.length > 0 && <HeartRateChart data={heartRateData} />}
          {bloodPressureData.length > 0 && <BloodPressureChart data={bloodPressureData} />}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/add-record"
              className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-colors group"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Add New Record</p>
                <p className="text-sm text-gray-600">Track today's health</p>
              </div>
            </Link>

            <Link
              to="/records"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">View All Records</p>
                <p className="text-sm text-gray-600">Browse history</p>
              </div>
            </Link>

            <button
              onClick={fetchData}
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Refresh Data</p>
                <p className="text-sm text-gray-600">Update stats</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;