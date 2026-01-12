/**
 * Stats Card Component
 * Afișează o statistică cu icon, valoare și trend opțional
 * 
 * @param {string} title - Titlul statisticii
 * @param {number} value - Valoarea statisticii
 * @param {string} unit - Unitatea de măsură (kg, bpm, etc.)
 * @param {JSX.Element} icon - Icon SVG de afișat
 * @param {string} color - Culoarea gradient-ului: primary, purple, pink, green, orange, red
 * @param {number} trend - Procentaj de creștere/scădere față de săptămâna trecută
 */
const StatsCard = ({ title, value, unit, icon, color = 'primary', trend }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {value !== null && value !== undefined ? value : '--'}
            </p>
            {unit && <span className="text-lg text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;