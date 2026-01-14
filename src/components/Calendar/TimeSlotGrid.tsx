import React from 'react';
import { TimeSlot } from '../../types';
import { formatTime, formatDate, isPastDateTime, isWithinAllowedPeriod, isWithin12HoursAdvance } from '../../utils/dateUtils';
import clsx from 'clsx';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot | null;
  isForCandidateScheduling?: boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  timeSlots,
  onSelectTimeSlot,
  selectedTimeSlot,
  isForCandidateScheduling = false
}) => {
  // Filter time slots based on context
  const filteredTimeSlots = timeSlots.filter(slot => {
    // Always filter out past time slots
    if (isPastDateTime(slot.date, slot.time)) return false;
    
    // Additional filters for candidate scheduling
    if (isForCandidateScheduling) {
      // Must be within allowed period (4 business days)
      if (!isWithinAllowedPeriod(slot.date)) return false;
      
      // Must be within 12 hours advance
      if (!isWithin12HoursAdvance(slot.date, slot.time)) return false;
    }
    
    return true;
  });

  // Group time slots by date
  const groupedSlots = filteredTimeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedSlots).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {isForCandidateScheduling 
          ? 'Nenhum horário disponível para agendamento (máximo 4 dias úteis e 12h de antecedência)'
          : 'Nenhum horário disponível'
        }
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date} className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 bg-gray-50 rounded-t-lg border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {formatDate(date)}
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {groupedSlots[date]
                .filter(slot => slot.available)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => onSelectTimeSlot(slot)}
                    className={clsx(
                      'px-4 py-3 rounded-md border text-sm font-medium transition-all duration-200',
                      selectedTimeSlot?.id === slot.id
                        ? 'bg-blue-600 text-white border-blue-600 transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105'
                    )}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};