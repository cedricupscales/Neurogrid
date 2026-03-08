import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './UI';

export const BrainDumpInput = ({ onAdd }: { onAdd: (title: string) => void }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Quickly add a task to your neural grid..."
        className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-6 py-4 pr-32 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-all shadow-inner"
      />
      <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-2">
        <Button 
          onClick={handleSubmit} 
          className="h-10 px-6 bg-gradient-to-br from-[#22C55E] via-[#4ADE80] to-[#16A34A]"
        >
          <Sparkles className="w-4 h-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
};
