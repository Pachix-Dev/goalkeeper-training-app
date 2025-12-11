'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SessionCardProps {
  session: {
    id: number;
    title: string;
    description: string | null;
    session_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    team_name?: string;
    session_type: string;
    status: string;
    task_count?: number;
  };
  onDelete?: (id: number) => void;
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    training: 'bg-purple-100 text-purple-800',
    match: 'bg-orange-100 text-orange-800',
    recovery: 'bg-green-100 text-green-800',
    tactical: 'bg-blue-100 text-blue-800',
    physical: 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatTime = (timeString: string | null): string => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // HH:MM
};

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const t = useTranslations('sessions');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const handleView = () => {
    router.push(`/${locale}/sessions/${session.id}`);
  };

  const handleEdit = () => {
    router.push(`/${locale}/sessions/${session.id}/edit`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        {/* Date Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 mb-1">
              {formatDate(session.session_date)}
              {session.start_time && (
                <span className="ml-2">
                  {formatTime(session.start_time)}
                  {session.end_time && ` - ${formatTime(session.end_time)}`}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {session.title}
            </h3>
            {session.team_name && (
              <p className="text-sm text-gray-600 mt-1">{session.team_name}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(
              session.session_type
            )}`}
          >
            {t(session.session_type as any)}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
              session.status
            )}`}
          >
            {t(session.status as any)}
          </span>
          {session.location && (
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {session.location}
            </span>
          )}
          {session.task_count !== undefined && session.task_count > 0 && (
            <span className="text-xs text-gray-600">
              {session.task_count} {session.task_count === 1 ? 'tarea' : 'tareas'}
            </span>
          )}
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {session.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button variant="outline" onClick={handleView} className="flex-1">
            {t('sessionDetails')}
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            {t('editSession')}
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(session.id)}
              className="text-red-600 hover:bg-red-50"
            >
              {t('deleteSession')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
