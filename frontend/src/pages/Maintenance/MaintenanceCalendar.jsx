import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PRIORITY_COLORS = {
  Critical: '#dc2626',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#6b7280',
};

export function MaintenanceCalendar({ schedules }) {
  const events = schedules.map((item) => {
    const start = new Date(item.scheduled_date);
    const end = new Date(start.getTime() + 1000 * 60 * 60 * 24);
    return {
      id: item.maintenance_schedule_id,
      title: `${item.schedule_number} ${item.priority_level}`,
      start,
      end,
      priority_level: item.priority_level,
      status: item.status,
    };
  });

  const eventStyleGetter = (event) => {
    const backgroundColor = PRIORITY_COLORS[event.priority_level] || '#6b7280';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
      },
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Maintenance Calendar</h3>
        <p className="text-sm text-gray-500">Monthly view of scheduled maintenance by priority.</p>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month']}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}
