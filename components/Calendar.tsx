import React, { useMemo } from 'react'
import type { LeaveRequest } from '../types'
import { getHoliday, isWeekend } from '../utils/dateUtils'

interface CalendarProps {
  date: Date
  setDate: (date: Date) => void
  requests: LeaveRequest[]
}

const statusColors: Record<string, string> = {
  approved: 'bg-blue-500 dark:bg-blue-400 text-white dark:text-black',
  pending: 'bg-yellow-500 dark:bg-yellow-400 text-black',
  rejected: 'bg-red-500 dark:bg-red-400 text-white dark:text-black opacity-50',
  cancelled: 'bg-gray-400 dark:bg-gray-500 text-white opacity-50',
}

const statusLabels: Record<string, string> = {
  approved: '✓',
  pending: '⏳',
  rejected: '✗',
  cancelled: '⊘',
}

const Calendar: React.FC<CalendarProps> = ({ date, setDate, requests }) => {
  const month = date.getMonth();
  const year = date.getFullYear();

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month + offset, 1);
    setDate(newDate);
  };

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfMonth = useMemo(() => new Date(year, month, 1).getDay(), [year, month]); // 0=Sun, 1=Mon...
  const weekDays = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  const calendarDays = useMemo(() => {
    const days = [];
    // Adjust for Sunday being 0, we want Monday as 0
    const startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [firstDayOfMonth, daysInMonth, year, month]);
  
  const getRequestsForDay = (day: Date | null): (LeaveRequest & {isStart: boolean, isEnd: boolean})[] => {
    if (!day) return [];
    const dayStr = day.toISOString().split('T')[0];
    return requests
      .filter(req => req.start_date <= dayStr && req.end_date >= dayStr)
      .map(req => ({
          ...req,
          isStart: req.start_date === dayStr,
          isEnd: req.end_date === dayStr
      }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          data-testid="calendar-prev-button"
          aria-label="Előző hónap"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold" data-testid="calendar-month-year">
          {new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long' }).format(date)}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          data-testid="calendar-next-button"
          aria-label="Következő hónap"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
           if (!day) {
            return <div key={index} className="rounded-md bg-gray-50 dark:bg-gray-800/50"></div>;
          }
          
          const dayRequests = getRequestsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const holidayName = getHoliday(day);
          const isDayWeekend = isWeekend(day);

          const cellClasses = [
            'h-32 md:h-40 lg:h-44 p-2 border border-gray-200 dark:border-gray-700 rounded-md flex flex-col overflow-hidden transition-all hover:shadow-lg',
            isDayWeekend && !holidayName ? 'bg-gray-100 dark:bg-gray-800/60' : 'bg-white dark:bg-gray-800',
            holidayName ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700' : ''
          ].filter(Boolean).join(' ');

          const dateNumberClasses = [
            'text-sm',
            isToday ? 'bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center font-bold' : 'font-semibold',
            isDayWeekend && !isToday ? 'text-gray-500' : ''
          ].filter(Boolean).join(' ');


          return (
            <div key={index} className={cellClasses}>
              <span className={dateNumberClasses}>
                {day.getDate()}
              </span>
              <div className="flex-grow overflow-y-auto space-y-1 mt-1 pr-1 text-xs">
                {holidayName && (
                  <div
                    className="p-1 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 font-medium text-center text-[10px] leading-tight"
                    title={holidayName}
                  >
                    {holidayName}
                  </div>
                )}
                {dayRequests.map(req => {
                  const userName = req.users?.full_name?.split(' ')[1] || req.users?.full_name || 'Unknown';
                  const statusIcon = statusLabels[req.status] || '';
                  const leaveTypeColor = req.leave_types?.color || '#6B7280';

                  return (
                    <div
                      key={req.id}
                      className={`p-1 text-left rounded-md ${statusColors[req.status]} ${req.isStart ? 'font-bold' : ''}`}
                      style={{
                        borderLeft: req.isStart ? `3px solid ${leaveTypeColor}` : 'none',
                        borderRight: req.isEnd ? `3px solid ${leaveTypeColor}` : 'none'
                      }}
                      title={`${userName} - ${req.leave_types?.name || 'Szabadság'}\n${req.start_date} → ${req.end_date} (${req.days_count} nap)\nStátusz: ${req.status}\n${req.reason ? `Indok: ${req.reason}` : ''}`}
                    >
                      <span className="text-xs flex items-center gap-1">
                        <span>{statusIcon}</span>
                        <span className="truncate">{userName}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
