'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface UpcomingSession {
  id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  team_name: string;
  session_type: string;
  status: string;
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  locale: string;
}

export default function UpcomingSessions({ sessions, locale }: UpcomingSessionsProps) {
  const t = useTranslations('dashboard');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'match': return 'bg-green-100 text-green-800';
      case 'recovery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Próximas Sesiones</h2>
        <p className="text-gray-500 text-center py-8">No hay sesiones programadas</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📅 Próximas Sesiones</h2>
        <Link 
          href={`/${locale}/sessions`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Ver todas →
        </Link>
      </div>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <Link 
            key={session.id}
            href={`/${locale}/sessions/${session.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.session_type)}`}>
                    {session.session_type}
                  </span>
                  {session.team_name && (
                    <span className="text-sm text-gray-600">🔵 {session.team_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="font-medium">{formatDate(session.session_date)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
