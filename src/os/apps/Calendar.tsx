import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarApp: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const today = new Date();

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay }, () => 0).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setDate(new Date(year, month - 1))} className="p-1 rounded hover:bg-white/10">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">
          {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setDate(new Date(year, month + 1))} className="p-1 rounded hover:bg-white/10">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[10px] font-medium opacity-40 py-1">{d}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} className={`text-xs py-1.5 rounded-lg transition-all ${
            d === 0 ? '' : isToday(d) ? 'bg-cyan-500/30 text-cyan-300 font-medium' : 'hover:bg-white/5 cursor-pointer'
          }`}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarApp;
