
import React from 'react';
import { MoodConfig, MoodType } from '../types';
import { Cloud, Sun, Moon, Zap, Coffee, Flame } from 'lucide-react';

interface MoodGridProps {
  onSelect: (mood: MoodType) => void;
}

// Standard Calm Pattern (Used as fallback/end state)
// 4s In, 6s Out
export const CALM_BREATHING_STEPS = [
  { label: '吸气 (Inhale)', duration: 4000, scale: 2.2, opacity: 1 },
  { label: '呼气 (Exhale)', duration: 6000, scale: 1.0, opacity: 0.6 },
];

export const MOODS: MoodConfig[] = [
  { 
    id: 'calm', 
    label: '平静 (Calm)', 
    icon: 'cloud', 
    color: 'bg-teal-100 text-teal-700', 
    gradient: 'from-teal-50 to-teal-100',
    tipTextClass: 'text-teal-800 dark:text-teal-100',
    breathingMode: {
      name: "共鸣呼吸 (Resonance)",
      description: "平衡身心",
      steps: [
        { label: '吸气 (Inhale)', duration: 5000, scale: 2.2, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 5000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
  { 
    id: 'anxious', 
    label: '焦虑 (Anxious)', 
    icon: 'wind', 
    color: 'bg-orange-100 text-orange-700', 
    gradient: 'from-orange-50 to-orange-100',
    tipTextClass: 'text-orange-900 dark:text-orange-100',
    breathingMode: {
      name: "4-7-8 呼吸法",
      description: "缓解焦虑",
      steps: [
        { label: '吸气 (Inhale)', duration: 4000, scale: 2.2, opacity: 1 },
        { label: '屏息 (Hold)', duration: 7000, scale: 2.2, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 8000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
  { 
    id: 'creative', 
    label: '灵感 (Creative)', 
    icon: 'zap', 
    color: 'bg-purple-100 text-purple-700', 
    gradient: 'from-purple-50 to-purple-100',
    tipTextClass: 'text-purple-900 dark:text-purple-100',
    breathingMode: {
      name: "流动呼吸 (Flow)",
      description: "激活思维",
      steps: [
        { label: '吸气 (Inhale)', duration: 4000, scale: 2.4, opacity: 1 },
        { label: '屏息 (Hold)', duration: 2000, scale: 2.4, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 4000, scale: 1.0, opacity: 0.6 },
        { label: '屏息 (Hold)', duration: 1000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
  { 
    id: 'tired', 
    label: '疲惫 (Tired)', 
    icon: 'moon', 
    color: 'bg-indigo-100 text-indigo-700', 
    gradient: 'from-indigo-50 to-indigo-100',
    tipTextClass: 'text-indigo-900 dark:text-indigo-100',
    breathingMode: {
      name: "充能呼吸 (Energy)",
      description: "唤醒身体",
      steps: [
        { label: '吸气 (Inhale)', duration: 6000, scale: 2.5, opacity: 1 },
        { label: '屏息 (Hold)', duration: 2000, scale: 2.5, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 4000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
  { 
    id: 'stressed', 
    label: '压力 (Stressed)', 
    icon: 'sun', 
    color: 'bg-red-100 text-red-700', 
    gradient: 'from-red-50 to-red-100',
    tipTextClass: 'text-red-900 dark:text-red-100',
    breathingMode: {
      name: "箱式呼吸 (Box)",
      description: "重获掌控",
      steps: [
        { label: '吸气 (Inhale)', duration: 4000, scale: 2.2, opacity: 1 },
        { label: '屏息 (Hold)', duration: 4000, scale: 2.2, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 4000, scale: 1.0, opacity: 0.6 },
        { label: '屏息 (Hold)', duration: 4000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
  { 
    id: 'angry', 
    label: '愤怒 (Angry)', 
    icon: 'flame', 
    color: 'bg-rose-100 text-rose-700', 
    gradient: 'from-rose-50 to-rose-100',
    tipTextClass: 'text-rose-900 dark:text-rose-100',
    breathingMode: {
      name: "释放呼吸 (Release)",
      description: "平息怒火",
      steps: [
        { label: '吸气 (Inhale)', duration: 4000, scale: 2.4, opacity: 1 },
        { label: '屏息 (Hold)', duration: 2000, scale: 2.4, opacity: 1 },
        { label: '呼气 (Exhale)', duration: 8000, scale: 1.0, opacity: 0.6 },
      ]
    }
  },
];

const IconMap: Record<string, React.ReactNode> = {
  cloud: <Cloud size={24} />,
  wind: <Coffee size={24} />,
  zap: <Zap size={24} />,
  moon: <Moon size={24} />,
  sun: <Sun size={24} />,
  flame: <Flame size={24} />,
};

const MoodGrid: React.FC<MoodGridProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-center text-xl text-gray-500 dark:text-gray-400 mb-8 font-light tracking-wide animate-fade-in">
        此刻的心情如何？<br/><span className="text-sm opacity-60">How are you feeling right now?</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MOODS.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={`
              group relative overflow-hidden p-6 rounded-2xl transition-all duration-300
              hover:shadow-lg hover:-translate-y-1 
              bg-white border border-gray-100
              dark:bg-gray-800 dark:border-gray-700
              flex flex-col items-center justify-center gap-3
              animate-fade-in
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className={`relative z-10 p-3 rounded-full ${mood.color} bg-opacity-20 dark:bg-opacity-20 dark:bg-gray-700 group-hover:bg-opacity-0 transition-all`}>
              {IconMap[mood.icon]}
            </div>
            <span className="relative z-10 text-gray-700 dark:text-gray-200 font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodGrid;
