import React from 'react';
import { UserStats, Domain } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export const GamificationStats = ({ stats }: { stats: UserStats }) => {
  const chartData = Object.entries(stats.skills).map(([name, value]) => ({
    subject: name,
    A: value,
    fullMark: Math.max(...Object.values(stats.skills), 100),
  }));

  const xpToNextLevel = 1000;
  const currentXP = stats.xp % xpToNextLevel;
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-baseline gap-2">
            Lvl {stats.level}
            <span className="text-sm font-normal text-white/40 uppercase tracking-widest">Architect</span>
          </h2>
          <p className="text-xs text-white/40 mt-1">Synapse Streak: {stats.streak} Days</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total XP</p>
          <p className="text-xl font-mono font-bold text-[#22C55E]">{stats.xp.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#22C55E] via-[#4ADE80] to-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        />
      </div>

      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} 
            />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="#22C55E"
              fill="#22C55E"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats.skills).map(([domain, value]) => (
          <div key={domain} className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{domain}</p>
            <p className="text-sm font-bold text-white">{value} XP</p>
          </div>
        ))}
      </div>
    </div>
  );
};
