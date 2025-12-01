import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, InsightData, MoodType } from './types';
import { generateInsight } from './services/geminiService';
import MoodGrid, { MOODS } from './components/MoodGrid';
import DurationSelector from './components/DurationSelector';
import BreathingCircle from './components/BreathingCircle';
import InsightCard from './components/InsightCard';
import { Wind, Sparkles, Moon, Sun, Home, Music, Music2 } from 'lucide-react';
import { audioManager } from './services/audioManager';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30000); // Default 30s
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  // Ref to hold the promise of the data generation while user breathes
  const insightPromise = useRef<Promise<InsightData> | null>(null);

  // Toggle Dark Mode Class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentMoodConfig = selectedMood 
    ? MOODS.find(m => m.id === selectedMood) 
    : null;

  const handleMoodSelect = useCallback((mood: MoodType) => {
    setSelectedMood(mood);
    setAppState(AppState.SELECT_DURATION);
  }, []);

  const handleDurationSelect = useCallback((duration: number) => {
    setSelectedDuration(duration);
    setAppState(AppState.BREATHING);
    
    // PREFETCHING: Start generating insight immediately when breathing starts
    if (selectedMood) {
      insightPromise.current = generateInsight(selectedMood);
    }
  }, [selectedMood]);

  const handleBreathingComplete = useCallback(async () => {
    if (!selectedMood) return;
    
    setAppState(AppState.GENERATING);
    try {
      // Enforce a minimum display time of 0.75s (750ms) for the transition state
      // to create a smooth, controlled visual flow, even if data is already ready.
      const [data] = await Promise.all([
        insightPromise.current || generateInsight(selectedMood),
        new Promise(resolve => setTimeout(resolve, 750)) 
      ]);
      
      setInsight(data as InsightData);
      setAppState(AppState.SHOWING_INSIGHT);
    } catch (error) {
      console.error("Failed to generate insight", error);
      setAppState(AppState.IDLE);
    }
  }, [selectedMood]);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setSelectedMood(null);
    setInsight(null);
    insightPromise.current = null; // Clear any pending promise
    // Ensure music stops if we go home manually
    audioManager.toggleBGM(false); 
  }, []);

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    // If we are currently breathing, toggle it immediately
    if (appState === AppState.BREATHING) {
      audioManager.toggleBGM(!musicEnabled);
    }
  };

  // Dynamic Background based on mood
  const getBackgroundClass = () => {
    if (darkMode) return 'bg-gray-900'; // Dark mode background
    if (!currentMoodConfig) return 'bg-gray-50';
    return `bg-gradient-to-br ${currentMoodConfig.gradient}`;
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${getBackgroundClass()} flex flex-col text-gray-800 dark:text-gray-100`}>
      
      {/* Header - Sticky for easy access */}
      <header className="sticky top-0 w-full p-6 flex items-center justify-between z-50 backdrop-blur-sm bg-white/30 dark:bg-black/20 transition-all duration-300">
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:opacity-80 transition-opacity"
        >
          <Wind className="animate-float" size={24} />
          <h1 className="text-xl font-semibold tracking-tight hidden sm:block">Mindful Moments</h1>
        </button>
        
        <div className="flex items-center gap-3 bg-white/50 dark:bg-black/30 p-1.5 rounded-full shadow-sm backdrop-blur-md">
            {/* Home Button */}
            <button
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                title="Return Home"
            >
              <Home size={18} />
            </button>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Music Toggle */}
            <button 
                onClick={toggleMusic}
                className={`p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors ${musicEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`}
                title={musicEnabled ? "Mute Background Music" : "Enable Background Music"}
            >
                {musicEnabled ? <Music size={18} /> : <Music2 size={18} />}
            </button>

            {/* Divider */}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            {/* Theme Toggle */}
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 relative w-full max-w-4xl mx-auto">
        
        {/* State: IDLE - Mood Selection */}
        {appState === AppState.IDLE && (
          <div className="w-full flex flex-col items-center">
             <div className="mb-12 text-center space-y-4 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 dark:text-white tracking-tight">
                  寻找你的<span className="font-serif italic text-gray-500 dark:text-gray-400">心流</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Find your flow. Select a mood to begin a short journey of breathing and AI-curated wisdom.
                </p>
             </div>
             <MoodGrid onSelect={handleMoodSelect} />
          </div>
        )}

        {/* State: SELECT_DURATION */}
        {appState === AppState.SELECT_DURATION && (
          <DurationSelector 
            onSelect={handleDurationSelect}
            onBack={() => setAppState(AppState.IDLE)}
          />
        )}

        {/* State: BREATHING - Exercise */}
        {appState === AppState.BREATHING && currentMoodConfig && (
          <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
            <BreathingCircle 
              onComplete={handleBreathingComplete} 
              moodConfig={currentMoodConfig}
              duration={selectedDuration}
              musicEnabled={musicEnabled}
            />
          </div>
        )}

        {/* State: GENERATING - Loading */}
        {appState === AppState.GENERATING && (
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <Sparkles className="text-gray-400 dark:text-gray-500 animate-spin-slow" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-light tracking-widest uppercase text-sm text-center">
              正在生成感悟...<br/>
              <span className="text-xs opacity-70">Generating Insight...</span>
            </p>
          </div>
        )}

        {/* State: SHOWING_INSIGHT - Result */}
        {appState === AppState.SHOWING_INSIGHT && insight && currentMoodConfig && (
          <InsightCard 
            data={insight} 
            moodConfig={currentMoodConfig} 
            onReset={handleReset}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-gray-400 dark:text-gray-600 text-sm font-light">
        <p>© {new Date().getFullYear()} Mindful Moments. Powered by Gemini.</p>
      </footer>

    </div>
  );
};

export default App;