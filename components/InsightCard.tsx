
import React from 'react';
import { InsightData, MoodConfig } from '../types';
import { Share2, RefreshCw } from 'lucide-react';

interface InsightCardProps {
  data: InsightData;
  moodConfig: MoodConfig;
  onReset: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ data, moodConfig, onReset }) => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Main Card */}
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700 transition-colors duration-500">
        
        {/* Header Gradient */}
        <div className={`h-2 bg-gradient-to-r ${moodConfig.gradient}`}></div>
        
        <div className="p-8 md:p-10 space-y-8">
          
          {/* Haiku Section */}
          <div className="text-center space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-semibold">Haiku</h3>
            <div className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-serif leading-relaxed italic whitespace-pre-line">
              {data.haiku}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 w-1/2 mx-auto"></div>

          {/* Quote Section */}
          <div className="space-y-4">
            <blockquote className="text-lg text-gray-600 dark:text-gray-300 text-center font-light leading-loose">
              "{data.quote}"
            </blockquote>
            <p className="text-right text-sm text-gray-400 dark:text-gray-500">— {data.author}</p>
          </div>

          {/* Actionable Tip */}
          <div className={`
            relative overflow-hidden
            bg-gradient-to-br ${moodConfig.gradient} dark:bg-none
            dark:bg-gray-700/30
            rounded-xl p-5 
            transform transition-transform hover:scale-[1.02] 
            border border-transparent dark:border-gray-600
          `}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2 h-2 rounded-full ${moodConfig.color.split(' ')[0]}`}></div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider ${moodConfig.tipTextClass}`}>Mindful Action</h4>
            </div>
            <p className={`text-sm leading-relaxed ${moodConfig.tipTextClass}`}>
              {data.tip}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Start Over</span>
          </button>
          
          <button 
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors opacity-50 cursor-not-allowed"
            title="Sharing coming soon"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
