import React from 'react';
import { Task, Quadrant } from '../types';
import { Card, Badge } from './UI';
import { CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { DOMAIN_COLORS } from '../constants';
import { clsx } from 'clsx';

const QuadrantBox = ({ 
  title, 
  tasks, 
  onComplete,
}: { 
  title: string; 
  tasks: Task[]; 
  quadrant: Quadrant;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{title}</h3>
        <Badge variant={tasks.length > 0 ? 'success' : 'default'}>{tasks.length}</Badge>
      </div>
      <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {tasks.map(task => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="p-3 group hover:border-white/20 transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: DOMAIN_COLORS[task.domain] }} />
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => onComplete(task.id)}
                  className={clsx(
                    "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    task.completed ? "bg-[#22C55E] border-[#22C55E]" : "border-white/20 hover:border-white/40"
                  )}
                  style={task.completed ? { backgroundColor: DOMAIN_COLORS[task.domain], borderColor: DOMAIN_COLORS[task.domain] } : {}}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className={clsx("text-sm font-medium truncate", task.completed && "text-white/30 line-through")}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[8px] bg-white/5" style={{ color: DOMAIN_COLORS[task.domain] }}>{task.domain}</Badge>
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <Clock className="w-3 h-3" />
                      {task.duration}m
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
            <span className="text-[10px] text-white/10 uppercase tracking-widest">Dormant</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const EisenhowerBoard = ({ 
  tasks, 
  onComplete,
  onDelete
}: { 
  tasks: Task[]; 
  onComplete: (id: string) => void; 
  onDelete: (id: string) => void;
}) => {
  const getTasks = (q: Quadrant) => tasks.filter(t => t.quadrant === q);

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <QuadrantBox 
        title="Immediate Synapse" 
        quadrant={Quadrant.DO_NOW} 
        tasks={getTasks(Quadrant.DO_NOW)} 
        onComplete={onComplete}
        onDelete={onDelete}
      />
      <QuadrantBox 
        title="Scheduled Pulse" 
        quadrant={Quadrant.SCHEDULE} 
        tasks={getTasks(Quadrant.SCHEDULE)} 
        onComplete={onComplete}
        onDelete={onDelete}
      />
      <QuadrantBox 
        title="External Signal" 
        quadrant={Quadrant.DELEGATE} 
        tasks={getTasks(Quadrant.DELEGATE)} 
        onComplete={onComplete}
        onDelete={onDelete}
      />
      <QuadrantBox 
        title="Noise Filter" 
        quadrant={Quadrant.ELIMINATE} 
        tasks={getTasks(Quadrant.ELIMINATE)} 
        onComplete={onComplete}
        onDelete={onDelete}
      />
    </div>
  );
};
