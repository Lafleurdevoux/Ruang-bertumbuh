import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { StoredReflection } from '../services/firebaseService';

interface ReflectionCalendarProps {
  reflections: StoredReflection[];
  onSelectDate: (reflections: StoredReflection[], date: Date) => void;
}

export const ReflectionCalendar: React.FC<ReflectionCalendarProps> = ({ reflections, onSelectDate }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getReflectionsForDay = (day: Date) => {
    return reflections.filter(r => r.timestamp && typeof r.timestamp.toDate === 'function' && isSameDay(r.timestamp.toDate(), day));
  };

  return (
    <div className="glass p-6 rounded-3xl w-full max-w-sm mx-auto border border-gray-100 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm uppercase tracking-widest text-brand-green font-sans font-semibold flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> Riwayat Jurnal
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-center mb-4 text-lg font-serif text-gray-900">
        {format(currentDate, 'MMMM yyyy')}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
          <div key={i} className="text-center text-[10px] uppercase font-bold text-gray-400 mb-2">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const reflectionsOfDay = getReflectionsForDay(day);
          const hasReflection = reflectionsOfDay.length > 0;
          return (
            <button
              key={i}
              onClick={() => hasReflection && onSelectDate(reflectionsOfDay, day)}
              disabled={!hasReflection}
              className={`relative aspect-square flex items-center justify-center text-sm rounded-xl transition-all
                ${hasReflection ? 'bg-brand-green text-white font-bold cursor-pointer hover:scale-110 active:scale-95 shadow-md shadow-brand-green/20' : 'text-gray-400 hover:bg-gray-50 cursor-default'}
                ${isToday(day) ? 'ring-2 ring-brand-green/50 ring-offset-2 ring-offset-white' : ''}
              `}
            >
              {format(day, 'd')}
              {hasReflection && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-brand-green/50 rounded-full border-2 border-white"
                />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-brand-green rounded-sm" />
          <span>Hari tercatat: {reflections.length} refleksi</span>
        </div>
      </div>
    </div>
  );
};
