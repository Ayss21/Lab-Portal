// src/Components/Timetable/TimetableFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

const TimetableFormModal = ({ labId, labName, currentTimetable, onClose, onSave, onDelete }) => { // Added labName prop
  const timeSlots = [
    { period: 1, time: "9:00 - 9:50" },
    { period: 2, time: "9:50 - 10:40" },
    { period: 3, time: "10:55 - 11:45" },
    { period: 4, time: "11:45 - 12:35" },
    { period: 5, time: "1:20 - 2:10" },
    { period: 6, time: "2:10 - 3:00" },
    { period: 7, time: "3:15 - 4:05" },
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const [scheduleData, setScheduleData] = useState({});

  useEffect(() => {
    const initialSchedule = {};
    days.forEach(day => {
      initialSchedule[day] = timeSlots.map(slot => ({
        hour: slot.time,
        subject: '',
        faculty: '',
        class: '',
        isAvailable: true
      }));
    });

    if (currentTimetable && currentTimetable.length > 0) {
      currentTimetable.forEach(dayEntry => {
        if (initialSchedule[dayEntry.day]) {
          dayEntry.timeSlots.forEach(ts => {
            const index = initialSchedule[dayEntry.day].findIndex(s => s.hour === ts.hour);
            if (index !== -1) {
              initialSchedule[dayEntry.day][index] = {
                hour: ts.hour,
                subject: ts.subject || '',
                faculty: ts.faculty || '',
                class: ts.class || '',
                isAvailable: ts.isAvailable !== undefined ? ts.isAvailable : true
              };
            }
          });
        }
      });
    }
    setScheduleData(initialSchedule);
  }, [currentTimetable]);

  const handleCellChange = (day, timeSlotHour, field, value) => {
    setScheduleData(prevData => {
      const newDaySchedule = prevData[day].map(slot =>
        slot.hour === timeSlotHour ? { ...slot, [field]: value } : slot
      );
      return {
        ...prevData,
        [day]: newDaySchedule
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedSchedule = days.map(day => ({
      day: day,
      timeSlots: scheduleData[day].filter(ts => ts.subject || ts.faculty || ts.class)
    }));
    onSave(formattedSchedule);
  };

  const handleDeleteTimetable = () => {
    if (window.confirm("Are you sure you want to delete this timetable? This action cannot be undone.")) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        {/* Updated title to include labName */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Weekly Timetable for {labName || `Lab ${labId}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-20"> {/* Made sticky for horizontal scroll */}
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Day / Time
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.period}
                      // Reduced min-width to make cells shorter and potentially fit more
                      className="text-center py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]"
                    >
                      {slot.time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10">
                      {day}
                    </td>
                    {timeSlots.map((slot) => (
                      <td
                        key={slot.period}
                        className="py-1 px-1 text-center text-sm text-gray-700 whitespace-nowrap" // Reduced padding
                      >
                        <div className="flex flex-col space-y-1"> {/* Flex column with space-y */}
                          <input
                            type="text"
                            value={scheduleData[day]?.find(s => s.hour === slot.time)?.subject || ''}
                            onChange={(e) => handleCellChange(day, slot.time, 'subject', e.target.value)}
                            placeholder="Subject"
                            className="w-full border border-gray-300 rounded-md py-1 px-1 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500" // Smaller text, less padding
                          />
                          <input
                            type="text"
                            value={scheduleData[day]?.find(s => s.hour === slot.time)?.faculty || ''}
                            onChange={(e) => handleCellChange(day, slot.time, 'faculty', e.target.value)}
                            placeholder="Faculty"
                            className="w-full border border-gray-300 rounded-md py-1 px-1 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500" // Smaller text, less padding
                          />
                          <input
                            type="text"
                            value={scheduleData[day]?.find(s => s.hour === slot.time)?.class || ''}
                            onChange={(e) => handleCellChange(day, slot.time, 'class', e.target.value)}
                            placeholder="Class"
                            className="w-full border border-gray-300 rounded-md py-1 px-1 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500" // Smaller text, less padding
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center gap-4 mt-6">
            <button
              type="button"
              onClick={handleDeleteTimetable}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 className="w-5 h-5" /> Delete Timetable
            </button>
            <button
              type="submit"
              className="flex-grow bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" /> Save Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimetableFormModal;