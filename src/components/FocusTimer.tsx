import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card } from './UI';
import { clsx } from 'clsx';

export const FocusTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Play sound or notification here if needed
      alert(mode === 'focus' ? "Focus session complete! Take a break." : "Break over! Time to focus.");
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 bg-[#1E1E1E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-full">
                <button 
                  onClick={() => switchMode('focus')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    mode === 'focus' ? "bg-[#22C55E] text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Focus
                </button>
                <button 
                  onClick={() => switchMode('break')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    mode === 'break' ? "bg-[#3B82F6] text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  Break
                </button>
              </div>

              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke={mode === 'focus' ? "#22C55E" : "#3B82F6"}
                    strokeWidth="8"
                    strokeDasharray={553}
                    animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-1">
                    {mode === 'focus' ? 'Deep Work' : 'Recovery'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full">
                <Button 
                  onClick={toggleTimer} 
                  className={clsx(
                    "flex-1 h-12 rounded-2xl",
                    mode === 'focus' ? "bg-[#22C55E]" : "bg-[#3B82F6]"
                  )}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="font-bold">{isActive ? 'Pause' : 'Start'}</span>
                </Button>
                <button 
                  onClick={resetTimer}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between text-white/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Neural Pulse</span>
                </div>
                <span className="text-[10px] font-mono">STABLE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300",
          isOpen ? "bg-white/10 rotate-90" : "bg-[#22C55E] shadow-[#22C55E]/20"
        )}
      >
        {isOpen ? <RotateCcw className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
      </button>
    </div>
  );
};
