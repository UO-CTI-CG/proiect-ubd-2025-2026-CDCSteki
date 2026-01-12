import { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

/**
 * Custom Tooltip Component
 * Afișează valori detaliate și unități de măsură corecte
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => {

          let unit = '';
          const name = entry.name || '';
          
          if (name.includes('Weight')) unit = ' kg';
          else if (name.includes('Sys') || name.includes('Dia')) unit = ' mmHg';
          else if (['Morning', 'Afternoon', 'Evening', 'Night'].includes(name)) unit = ' bpm';
          else if (name === 'Steps') unit = '';

          return (
            <p key={index} className="text-sm flex justify-between space-x-4" style={{ color: entry.color }}>
              <span>{name}:</span>
              <span className="font-bold">
                {entry.value}{unit}
              </span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

/**
 * Weight Trend Chart
 */
export const WeightChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            dot={{ fill: '#0ea5e9', r: 4 }}
            activeDot={{ r: 6 }}
            name="Weight"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Daily Steps Chart
 */
export const StepsChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Steps</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="steps" 
            fill="url(#stepsGradient)" 
            radius={[8, 8, 0, 0]}
            name="Steps"
          />
          <defs>
            <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Heart Rate Chart
 * Afișează toate cele 4 momente ale zilei
 */
export const HeartRateChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line type="monotone" dataKey="morning" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} name="Morning" connectNulls />
          <Line type="monotone" dataKey="afternoon" stroke="#10b981" strokeWidth={2} dot={{r:3}} name="Afternoon" connectNulls />
          <Line type="monotone" dataKey="evening" stroke="#8b5cf6" strokeWidth={2} dot={{r:3}} name="Evening" connectNulls />
          <Line type="monotone" dataKey="night" stroke="#1e40af" strokeWidth={2} dot={{r:3}} name="Night" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Blood Pressure Chart
 * Include sistem de filtrare cu TAB-uri pentru a evita aglomerarea
 */
export const BloodPressureChart = ({ data }) => {
  // State pentru filtrare: 'all', 'morning', 'afternoon', 'evening', 'night'
  // Default 'morning' pentru că este cel mai relevant medical
  const [activeFilter, setActiveFilter] = useState('morning');

  const filters = [
    { key: 'all', label: 'All Day' },
    { key: 'morning', label: 'Morning' },
    { key: 'afternoon', label: 'Afternoon' },
    { key: 'evening', label: 'Evening' },
    { key: 'night', label: 'Night' },
  ];

  const shouldShow = (timeOfDay) => activeFilter === 'all' || activeFilter === timeOfDay;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blood Pressure Trend</h3>
          <div className="text-xs text-gray-500 mt-1 flex space-x-3">
            <span className="flex items-center"><span className="w-3 h-0.5 bg-gray-400 mr-1"></span>Systolic</span>
            <span className="flex items-center"><span className="w-3 h-0.5 bg-gray-400 border-b border-dashed border-gray-400 mr-1"></span>Diastolic</span>
          </div>
        </div>
        
        {/* Butoane tip Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg mt-3 sm:mt-0 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeFilter === f.key
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[40, 180]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* === MORNING (Portocaliu) === */}
          {shouldShow('morning') && (
            <>
              <Line type="monotone" dataKey="morningSys" name="Morning Sys" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="morningDia" name="Morning Dia" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={false} connectNulls />
            </>
          )}

          {/* === AFTERNOON (Verde) === */}
          {shouldShow('afternoon') && (
            <>
              <Line type="monotone" dataKey="afternoonSys" name="Afternoon Sys" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="afternoonDia" name="Afternoon Dia" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} connectNulls />
            </>
          )}

          {/* === EVENING (Violet) === */}
          {shouldShow('evening') && (
            <>
              <Line type="monotone" dataKey="eveningSys" name="Evening Sys" stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="eveningDia" name="Evening Dia" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={false} connectNulls />
            </>
          )}

          {/* === NIGHT (Albastru) === */}
          {shouldShow('night') && (
            <>
              <Line type="monotone" dataKey="nightSys" name="Night Sys" stroke="#1e40af" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="nightDia" name="Night Dia" stroke="#1e40af" strokeWidth={2} strokeDasharray="3 3" dot={false} connectNulls />
            </>
          )}

        </LineChart>
      </ResponsiveContainer>
      
    </div>
  );
};