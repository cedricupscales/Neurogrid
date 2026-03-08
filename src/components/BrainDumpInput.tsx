import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './UI';

export const BrainDumpInput = ({ onGenerate }: { onGenerate: (text: string) => void }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await onGenerate(text);
    setText('');
    setLoading(false);
  };

  return (
    <div className="relative w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Brain-dump your week... 'I need to finish the marketing deck by Tuesday, hit the gym 3 times, and call my mom on Sunday.'"
        className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 pr-32 min-h-[120px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#22C55E]/50 transition-all resize-none shadow-inner"
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button 
          onClick={handleSubmit} 
          loading={loading}
          className="h-10 px-6 bg-gradient-to-br from-[#22C55E] via-[#4ADE80] to-[#16A34A]"
        >
          <Sparkles className="w-4 h-4" />
          Sync Neural Plan
        </Button>
      </div>
    </div>
  );
};
