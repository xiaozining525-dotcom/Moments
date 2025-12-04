
import React, { useEffect, useState, useRef } from 'react';
import { MoodConfig, BreathingStep } from '../types';
import { CALM_BREATHING_STEPS } from './MoodGrid';
import { Timer } from 'lucide-react';
import { audioManager } from '../services/audioManager';

interface BreathingCircleProps {
  moodConfig: MoodConfig;
  duration: number; // Total duration in ms
  onComplete: () => void;
  musicEnabled: boolean;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({ moodConfig, duration, onComplete, musicEnabled }) => {
  const [phase, setPhase] = useState<'COUNTDOWN' | 'BREATHING' | 'DONE'>('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(duration);
  
  // Breathing State
  const [currentStep, setCurrentStep] = useState<BreathingStep>({ label: '准备 (Ready)', duration: 0, scale: 1, opacity: 1 });
  const [instruction, setInstruction] = useState('准备 (Ready)');

  // Refs for logic loop
  const stepIndexRef = useRef(0);
  const cycleCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const MIN_MOOD_CYCLES = 2; // Perform at least 2 cycles of the specific mood pattern

  // Format Milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Manage BGM based on prop
  useEffect(() => {
    if (phase === 'BREATHING') {
      audioManager.toggleBGM(musicEnabled);
    }
    return () => {
      // Don't stop BGM on unmount immediately if we want it to persist, 
      // but here we likely want it to stop when leaving the circle.
      audioManager.toggleBGM(false); 
    };
  }, [musicEnabled, phase]);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Handle Countdown Phase
    if (phase === 'COUNTDOWN') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setPhase('BREATHING');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }

    // 2. Handle Breathing Phase
    if (phase === 'BREATHING') {
      // Start global countdown timer
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      const runBreathingLoop = () => {
        if (!isMountedRef.current) return;

        // Determine which pattern to use: Mood specific OR transition to Calm
        const useCalmPattern = cycleCountRef.current >= MIN_MOOD_CYCLES;
        const currentPatternSteps = useCalmPattern ? CALM_BREATHING_STEPS : moodConfig.breathingMode.steps;

        // Get current step details
        const step = currentPatternSteps[stepIndexRef.current];
        
        // Update Visuals
        setCurrentStep(step);
        setInstruction(step.label);

        // Schedule next step
        timeoutRef.current = setTimeout(() => {
          // Check if we should finish
          const isEndOfCycle = stepIndexRef.current === currentPatternSteps.length - 1;
          
          if (isEndOfCycle) {
            cycleCountRef.current += 1;
            stepIndexRef.current = 0; // Reset index for next cycle

            // Check if time is up
            const remaining = duration - (Date.now() - startTime); 
            
            if (remaining < 5000) { 
              // Time is up or close to up
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              setPhase('DONE');
              onComplete();
              return; 
            }
          } else {
            stepIndexRef.current += 1;
          }

          // Recursive call for next step
          runBreathingLoop();

        }, step.duration);
      };

      const startTime = Date.now();
      // Start the loop
      runBreathingLoop();

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }

    return () => { isMountedRef.current = false; };
  }, [phase, moodConfig, onComplete, duration]);

  // Handle manual finish
  const handleFinishEarly = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    audioManager.toggleBGM(false); // Stop music immediately
    setPhase('DONE');
    onComplete();
  };

  // Color extraction for the rings
  const colorClass = moodConfig.color.split(' ')[0]; // e.g. "bg-teal-100"

  if (phase === 'COUNTDOWN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-8xl font-light text-gray-300 dark:text-gray-600 font-mono animate-pulse">
          {countdown}
        </div>
        <p className="mt-8 text-gray-500 dark:text-gray-400 tracking-widest uppercase text-sm">
          Relax & Focus
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in py-8 relative w-full overflow-hidden">
      
      {/* Top Timer Display */}
      <div className="absolute top-0 right-0 md:right-10 flex items-center gap-2 text-gray-400 dark:text-gray-500 font-mono text-sm bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm z-50">
        <Timer size={14} />
        <span>{formatTime(timeLeft)}</span>
      </div>

      {/* Visual Circle Area */}
      <div className="relative flex items-center justify-center w-[500px] h-[500px]">
        
        {/* Outer Glow / Ripple */}
        <div className={`absolute w-60 h-60 rounded-full opacity-10 dark:opacity-5 ${colorClass} blur-3xl transition-all duration-[3000ms]`}
             style={{ transform: `scale(${currentStep.scale * 1.5})` }}>
        </div>

        {/* Breathing Ring 1 */}
        <div 
          className={`absolute w-60 h-60 rounded-full opacity-30 dark:opacity-20 ${colorClass} blur-2xl`}
          style={{ 
            transform: `scale(${currentStep.scale})`,
            transition: `transform ${currentStep.duration}ms ease-in-out`
          }}
        ></div>
        
        {/* Core Circle */}
        <div 
          className={`relative flex items-center justify-center w-40 h-40 rounded-full shadow-2xl bg-white dark:bg-gray-800 z-10 border-4 border-gray-50 dark:border-gray-700`}
          style={{ 
            transform: `scale(${currentStep.scale === 1.0 ? 1.0 : 1.15})`,
            transition: `transform ${currentStep.duration}ms ease-in-out`
          }}
        >
          {/* Inner Dot */}
          <div className={`w-3 h-3 rounded-full ${colorClass.replace('bg-', 'bg-')}-500 opacity-50`}></div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center space-y-4 h-24 z-20">
        <h3 className="text-3xl md:text-5xl font-light text-gray-700 dark:text-gray-200 tracking-wider transition-all duration-500">
          {instruction}
        </h3>
        <div className="flex flex-col gap-1">
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest">
            {cycleCountRef.current < MIN_MOOD_CYCLES ? moodConfig.breathingMode.name : "回归平静 (Calming Down)"}
          </p>
        </div>
      </div>

      {/* Refined End Session Button - Prominent Semi-transparent White */}
      <button 
        onClick={handleFinishEarly}
        className="
          mt-12 px-10 py-3 rounded-full
          bg-white/40 dark:bg-white/10
          hover:bg-white/60 dark:hover:bg-white/20
          border border-white/50 dark:border-white/10
          text-gray-800 dark:text-gray-100
          shadow-lg hover:shadow-xl
          backdrop-blur-md
          text-sm tracking-[0.2em] uppercase font-semibold
          transition-all duration-300
          z-20
        "
      >
        结束
      </button>

    </div>
  );
};

export default BreathingCircle;
