import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Task } from '../types';
import { Card, Badge, Button } from './UI';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { suggestSchedule } from '../services/ai';
import { updateTask } from '../services/api';
import { DOMAIN_COLORS } from '../constants';
import { clsx } from 'clsx';

export const WeeklyCalendar = ({ tasks, onRefresh }: { tasks: Task[], onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const startDate = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const suggestions = await suggestSchedule(tasks);
      for (const suggestion of suggestions) {
        await updateTask(suggestion.taskId, { 
          timeblockStart: suggestion.start, 
          timeblockEnd: suggestion.end,
          deadline: suggestion.start // Sync deadline with start for simplicity
        });
      }
      onRefresh();
    } catch (error: any) {
      console.error("Failed to suggest schedule", error);
      alert("Neural Optimization failed. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">Neural Activity Map</h3>
        <Button onClick={handleSuggest} loading={loading} variant="secondary" className="h-8 text-[10px]">
          <Sparkles className="w-3 h-3" />
          Neural Sync Optimization
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-4 flex-1">
        {days.map((day) => {
          const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day));
          
          return (
            <div key={day.toString()} className="flex flex-col gap-4 h-full">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{format(day, 'EEE')}</p>
                <p className={clsx(
                  "text-lg font-bold mt-1",
                  isSameDay(day, new Date()) ? "text-[#22C55E]" : "text-white"
                )}>
                  {format(day, 'd')}
                </p>
              </div>
              
              <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {dayTasks.map(task => (
                  <Card key={task.id} className="p-2 border-l-2 bg-[#1A1A1A]" style={{ borderLeftColor: DOMAIN_COLORS[task.domain] }}>
                    <p className="text-[10px] font-medium text-white truncate">{task.title}</p>
                    <p className="text-[8px] text-white/30 mt-0.5">{task.duration}m</p>
                  </Card>
                ))}
                {dayTasks.length === 0 && (
                  <div className="flex-1 border border-dashed border-white/5 rounded-xl flex items-center justify-center opacity-20">
                    <span className="text-[8px] uppercase tracking-tighter">Dormant</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
