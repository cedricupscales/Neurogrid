import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, setHours, setMinutes } from 'date-fns';
import { Task } from '../types';
import { Card, Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { updateTask } from '../services/api';
import { DOMAIN_COLORS } from '../constants';
import { clsx } from 'clsx';
import { Plus, X, Clock, Check } from 'lucide-react';

export const WeeklyCalendar = ({ tasks, onRefresh }: { tasks: Task[], onRefresh: () => void }) => {
  const [editingDay, setEditingDay] = useState<Date | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);

  const startDate = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handleAddTimeblock = async () => {
    if (!selectedTaskId || !editingDay) return;
    setLoading(true);
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const start = setMinutes(setHours(editingDay, startH), startM).toISOString();
    const end = setMinutes(setHours(editingDay, endH), endM).toISOString();

    try {
      await updateTask(selectedTaskId, {
        timeblockStart: start,
        timeblockEnd: end,
        deadline: start // Sync deadline with start
      });
      onRefresh();
      setEditingDay(null);
      setSelectedTaskId('');
    } catch (error) {
      console.error("Failed to update timeblock", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">Neural Activity Map</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-4 flex-1">
        {days.map((day) => {
          const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day));
          const timeblockedTasks = dayTasks
            .filter(t => t.timeblockStart && t.timeblockEnd)
            .sort((a, b) => new Date(a.timeblockStart!).getTime() - new Date(b.timeblockStart!).getTime());
          const unblockedTasks = dayTasks.filter(t => !t.timeblockStart);
          
          return (
            <div key={day.toString()} className="flex flex-col gap-4 h-full">
              <div className="text-center relative group">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{format(day, 'EEE')}</p>
                <p className={clsx(
                  "text-lg font-bold mt-1",
                  isSameDay(day, new Date()) ? "text-[#22C55E]" : "text-white"
                )}>
                  {format(day, 'd')}
                </p>
                <button 
                  onClick={() => setEditingDay(day)}
                  className="absolute -right-2 top-0 opacity-40 hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-white shadow-lg"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {timeblockedTasks.length > 0 && (
                  <div className="flex flex-col gap-2 mb-2">
                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold px-1">Blocks</p>
                    {timeblockedTasks.map(task => (
                      <Card key={task.id} className="p-2 border-l-2 bg-[#1A1A1A] relative group" style={{ borderLeftColor: DOMAIN_COLORS[task.domain] }}>
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-medium text-white truncate flex-1">{task.title}</p>
                          <button 
                            onClick={() => {
                              setEditingDay(day);
                              setSelectedTaskId(task.id);
                              setStartTime(format(new Date(task.timeblockStart!), 'HH:mm'));
                              setEndTime(format(new Date(task.timeblockEnd!), 'HH:mm'));
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity text-white/40 hover:text-white"
                          >
                            <Clock className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[8px] text-[#22C55E] mt-0.5 font-mono">
                          {format(new Date(task.timeblockStart!), 'HH:mm')} - {format(new Date(task.timeblockEnd!), 'HH:mm')}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}

                {unblockedTasks.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold px-1">Unscheduled</p>
                    {unblockedTasks.map(task => (
                      <Card key={task.id} className="p-2 border-l-2 bg-[#1A1A1A]/50" style={{ borderLeftColor: DOMAIN_COLORS[task.domain] }}>
                        <p className="text-[10px] font-medium text-white/60 truncate">{task.title}</p>
                        <p className="text-[8px] text-white/20 mt-0.5">{task.duration}m</p>
                      </Card>
                    ))}
                  </div>
                )}

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

      {/* Timeblock Modal */}
      <AnimatePresence>
        {editingDay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 w-[400px] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white">
                  Neural Timeblock: {format(editingDay, 'MMM d')}
                </h4>
                <button onClick={() => setEditingDay(null)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block">Select Signal</label>
                  <select 
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]/50"
                  >
                    <option value="">Choose a task...</option>
                    {tasks.filter(t => !t.completed).map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block">Start Pulse</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/30 mb-2 block">End Pulse</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]/50"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddTimeblock} 
                  loading={loading}
                  disabled={!selectedTaskId}
                  className="w-full h-12 mt-4"
                >
                  <Check className="w-4 h-4" />
                  Sync Timeblock
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
