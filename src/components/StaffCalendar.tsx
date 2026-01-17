import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '../types';

interface StaffCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: string) => void;
}

/**
 * Staff calendar: planning view (NOT a booking calendar).
 * - No blocked/greyed dates
 * - Highlights days that have assigned appointments
 * - Allows selecting any date
 */
export const StaffCalendar: React.FC<StaffCalendarProps> = ({ appointments, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const apptCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      if (!a?.date) continue;
      map.set(a.date, (map.get(a.date) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelect = (dateString: string) => {
    setSelectedDate(dateString);
    onDateSelect(dateString);
  };

  const renderDays = () => {
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = apptCountByDate.get(dateString) ?? 0;
      const isSelected = selectedDate === dateString;

      cells.push(
        <button
          key={dateString}
          type="button"
          onClick={() => handleSelect(dateString)}
          className={[
            'h-12 rounded-md flex flex-col items-center justify-center transition-colors',
            'border border-stone-200',
            'hover:bg-stone-100',
            isSelected ? 'bg-stone-900 text-white' : 'bg-white text-stone-800'
          ].join(' ')}
        >
          <span className={['text-sm', isSelected ? 'font-semibold' : ''].join(' ')}>{day}</span>

          {count > 0 && (
            <span
              className={[
                'mt-1 text-[10px] leading-none px-2 py-[2px] rounded-full',
                isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
              ].join(' ')}
            >
              {count} rdv
            </span>
          )}
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="bg-white rounded-lg border border-stone-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <button
          type="button"
          onClick={goPrevMonth}
          className="p-2 rounded-md hover:bg-stone-100 text-stone-700"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-sm font-medium capitalize text-stone-800">{monthLabel}</div>

        <button
          type="button"
          onClick={goNextMonth}
          className="p-2 rounded-md hover:bg-stone-100 text-stone-700"
          aria-label="Mois suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 p-4 text-xs text-stone-400">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d) => (
          <div key={d} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 px-4 pb-4">{renderDays()}</div>
    </div>
  );
};
