import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TeamWithStats } from '@/lib/types/database';

interface TeamCardProps {
  team: TeamWithStats;
  onDelete: () => void;
}

export function TeamCard({ team, onDelete }: TeamCardProps) {
  const locale = useLocale();
  const t = useTranslations('teams');
  const tc = useTranslations('common');

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Color Bar */}
      <div 
        className="h-2"
        style={{ backgroundColor: team.color }}
      />

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {team.name}
            </h3>
            <p className="text-sm text-gray-600">{team.category}</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {team.season}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {team.total_goalkeepers || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">{t('totalGoalkeepers')}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {team.total_goalkeepers || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">{t('activePlayers')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/${locale}/teams/${team.id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {tc('view')}
          </Link>
          <Link
            href={`/${locale}/teams/${team.id}/edit`}
            className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {tc('edit')}
          </Link>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium cursor-pointer"
          >
            {tc('delete')}
          </button>
        </div>

        {/* Coach Name */}
        {team.coach_name && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Coach: <span className="font-medium text-gray-700">{team.coach_name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
