/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard, Brain, Calendar, Activity, User, LogOut, Kanban, BarChart3, Settings, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, UserStats, XPEvent, Domain, Quadrant } from './types';
import { fetchUser, fetchTasks, createTask, updateTask, deleteTask, addXP, fetchReport } from './services/api';
import { BrainDumpInput } from './components/BrainDumpInput';
import { EisenhowerBoard } from './components/EisenhowerBoard';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { GamificationStats } from './components/GamificationStats';
import { CognitiveReport } from './components/CognitiveReport';
import { FocusTimer } from './components/FocusTimer';
import { Card, Button } from './components/UI';
import { DOMAIN_COLORS } from './constants';

type View = 'dashboard' | 'matrix' | 'calendar' | 'report';

const GridLogo = () => (
  <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
    {[...Array(9)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
        className="bg-white rounded-[1px]"
      />
    ))}
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<UserStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reportData, setReportData] = useState<{ tasks: Task[], xpEvents: XPEvent[] } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [userData, tasksData, report] = await Promise.all([
      fetchUser(),
      fetchTasks(),
      fetchReport()
    ]);
    setUser(userData);
    setTasks(tasksData);
    setReportData(report);
  };

  const handleAddTask = async (title: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: 'Quickly added task',
      deadline: new Date().toISOString(),
      domain: Domain.PERSONAL,
      urgency: 5,
      importance: 5,
      duration: 30,
      quadrant: Quadrant.DO_NOW,
      completed: false,
      createdAt: new Date().toISOString()
    };
    await createTask(newTask);
    await loadData();
  };

  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    await updateTask(id, { completed: newCompleted });
    
    if (newCompleted) {
      // Award XP
      const xpAmount = Math.round(task.duration / 2) + 50;
      await addXP(xpAmount, `Completed: ${task.title}`, task.domain);
    }
    
    await loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    await loadData();
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Cortex Dashboard' },
    { id: 'matrix', icon: Kanban, label: 'Synapse Grid' },
    { id: 'calendar', icon: Calendar, label: 'Neural Snapshot' },
    { id: 'report', icon: BarChart3, label: 'Cognitive Report' },
  ];

  return (
    <div className="flex h-screen bg-[#121212] text-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-[#0A0A0A]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] via-[#4ADE80] to-[#16A34A] flex items-center justify-center shadow-lg shadow-[#22C55E]/30 border border-white/10">
            <GridLogo />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">neurogrid</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#22C55E] font-bold">Cortex Sync Active</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                view === item.id 
                  ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={clsx("w-5 h-5", view === item.id ? "text-[#22C55E]" : "text-white/20 group-hover:text-white/60")} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Neural Architect</p>
              <p className="text-[10px] text-white/30 truncate">Cortex Tier</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-white/30 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">Sever Link</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0A0A0A]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold capitalize">
              {view === 'dashboard' ? 'Neural Hub' : 
               view === 'matrix' ? 'Synapse Grid' : 
               view === 'calendar' ? 'Neural Snapshot' : 
               'Cognitive Report'}
            </h2>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-xs text-white/30 font-medium">Sunday, March 8, 2026</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/[0.02] px-4 py-2 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Cortex Sync Active</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#121212]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {view === 'dashboard' && (
                <div className="grid grid-cols-12 gap-8 h-full">
                  <div className="col-span-8 flex flex-col gap-8">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-4">Fast Capture</h3>
                      <BrainDumpInput onAdd={handleAddTask} />
                    </section>
                    <section className="flex-1 min-h-0">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-4">Critical Matrix</h3>
                      <EisenhowerBoard 
                        tasks={tasks.filter(t => !t.completed)} 
                        onComplete={handleCompleteTask}
                        onDelete={handleDeleteTask}
                      />
                    </section>
                  </div>
                  <div className="col-span-4 flex flex-col gap-8">
                    <Card className="p-6">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-6">Neural Metrics</h3>
                      {user && <GamificationStats stats={user} />}
                    </Card>
                    <Card className="flex-1 p-6 overflow-hidden flex flex-col">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-6">Active Signals</h3>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[task.domain] }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{task.title}</p>
                              <p className="text-[10px] text-white/30">{task.domain} • {task.duration}m</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {view === 'matrix' && (
                <div className="h-full">
                  <EisenhowerBoard 
                    tasks={tasks} 
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              )}

              {view === 'calendar' && (
                <div className="h-full">
                  <WeeklyCalendar tasks={tasks} onRefresh={loadData} />
                </div>
              )}

              {view === 'report' && reportData && user && (
                <div className="h-full">
                  <CognitiveReport tasks={reportData.tasks} xpEvents={reportData.xpEvents} skills={user.skills} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Focus Timer */}
      <FocusTimer />
    </div>
  );
}
