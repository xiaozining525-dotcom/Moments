
import React, { useState } from 'react';
import { Clock, Hourglass } from 'lucide-react';

interface DurationSelectorProps {
  onSelect: (durationMs: number) => void;
  onBack: () => void;
}

const PRESETS = [
  { label: '30 秒 (30s)', value: 30 * 1000 },
  { label: '1 分钟 (1m)', value: 60 * 1000 },
  { label: '3 分钟 (3m)', value: 3 * 60 * 1000 },
];

const DurationSelector: React.FC<DurationSelectorProps> = ({ onSelect, onBack }) => {
  const [customMinutes, setCustomMinutes] = useState<number>(5);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-2xl text-gray-700 dark:text-gray-200 font-light">
          选择呼吸时长
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose your breathing duration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onSelect(preset.value)}
            className="
              group p-6 rounded-2xl bg-white dark:bg-gray-800 
              border border-gray-100 dark:border-gray-700
              hover:shadow-lg hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700
              transition-all duration-300 flex flex-col items-center gap-3
            "
          >
            <div className="p-3 rounded-full bg-teal-50 text-teal-600 dark:bg-gray-700 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-gray-600 transition-colors">
              <Hourglass size={24} />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Duration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-gray-400" size={20} />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">自定义时长 (Custom)</h3>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-end">
             <span className="text-4xl font-light text-teal-600 dark:text-teal-400">
               {customMinutes} <span className="text-lg text-gray-500 dark:text-gray-400">min</span>
             </span>
             <span className="text-sm text-gray-400 mb-1">Max 60 min</span>
          </div>

          <input
            type="range"
            min="1"
            max="60"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-500"
          />

          <button
            onClick={() => onSelect(customMinutes * 60 * 1000)}
            className="w-full py-4 mt-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium tracking-wide"
          >
            开始呼吸 (Start {customMinutes}m)
          </button>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="mt-8 w-full text-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm"
      >
        返回上一步 (Back)
      </button>
    </div>
  );
};

export default DurationSelector;
