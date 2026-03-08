import React from 'react';
import { Task, XPEvent, Domain } from '../types';
import { Card, Badge } from './UI';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { format, subDays } from 'date-fns';
import { DOMAIN_COLORS } from '../constants';

export const CognitiveReport = ({ tasks, xpEvents, skills }: { tasks: Task[], xpEvents: XPEvent[], skills: Record<Domain, number> }) => {
  const quadrantData = [
    { name: 'Do Now', value: tasks.filter(t => t.quadrant === 'Do Now').length },
    { name: 'Schedule', value: tasks.filter(t => t.quadrant === 'Schedule').length },
    { name: 'Delegate', value: tasks.filter(t => t.quadrant === 'Delegate').length },
    { name: 'Eliminate', value: tasks.filter(t => t.quadrant === 'Eliminate').length },
  ].filter(d => d.value > 0);

  const QUADRANT_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayXP = xpEvents
      .filter(e => format(new Date(e.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: format(date, 'EEE'),
      xp: dayXP,
    };
  }).reverse();

  const skillData = Object.entries(skills).map(([domain, value]) => ({
    subject: domain,
    A: value,
    fullMark: 100,
  }));

  const totalTime = tasks.reduce((sum, t) => sum + t.duration, 0);
  const completedTime = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1 flex flex-col gap-4 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Synapse Distribution</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={quadrantData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {quadrantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={QUADRANT_COLORS[index % QUADRANT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quadrantData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[i] }} />
              <span className="text-[10px] text-white/40">{d.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-1 flex flex-col gap-4 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Cortex Map</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="col-span-1 flex flex-col gap-4 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Signal Velocity</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="xp" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="col-span-3 grid grid-cols-4 gap-6 p-6">
        <div className="text-center border-r border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Neural Efficiency</p>
          <p className="text-2xl font-bold text-white">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
          </p>
        </div>
        <div className="text-center border-r border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Deep Focus Time</p>
          <p className="text-2xl font-bold text-white">{Math.round(completedTime / 60)}h</p>
        </div>
        <div className="text-center border-r border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Active Signals</p>
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Avg Pulse</p>
          <p className="text-2xl font-bold text-white">
            {tasks.length > 0 ? Math.round(totalTime / tasks.length) : 0}m
          </p>
        </div>
      </Card>
    </div>
  );
};
