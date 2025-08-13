import React from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  title: string;
  color?: string;
  unit?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ 
  value, 
  max, 
  title, 
  color = '#10b981',
  unit = '%'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180;
  
  const getColor = () => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const gaugeColor = color === '#10b981' ? getColor() : color;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-20 mb-4">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
            style={{
              transition: 'stroke-dasharray 1s ease-in-out'
            }}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2={100 + 60 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={80 + 60 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transition: 'all 1s ease-in-out'
            }}
          />
          {/* Center dot */}
          <circle
            cx="100"
            cy="80"
            r="4"
            fill="#374151"
          />
        </svg>
        
        {/* Value display */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {value.toFixed(0)}{unit}
            </div>
            <div className="text-sm text-gray-500">{title}</div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between w-full text-xs text-gray-500 px-4">
        <span>0{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default GaugeChart;
