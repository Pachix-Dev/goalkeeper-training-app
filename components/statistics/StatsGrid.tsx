'use client';

import { useTranslations } from 'next-intl';
import { GoalkeeperStatistics } from '@/lib/db/models/GoalkeeperStatisticsModel';

interface StatsGridProps {
  statistics: GoalkeeperStatistics;
}

export default function StatsGrid({ statistics }: StatsGridProps) {
  const t = useTranslations('statistics');

  const stats = [
    {
      label: t('fields.matchesPlayed'),
      value: statistics.matches_played,
      icon: '⚽',
      color: 'blue' as const
    },
    {
      label: t('fields.minutesPlayed'),
      value: statistics.minutes_played,
      icon: '⏱️',
      color: 'purple' as const
    },
    {
      label: t('fields.goalsConceded'),
      value: statistics.goals_conceded,
      icon: '🥅',
      color: 'red' as const
    },
    {
      label: t('fields.cleanSheets'),
      value: statistics.clean_sheets,
      icon: '🧤',
      color: 'green' as const
    },
    {
      label: t('fields.saves'),
      value: statistics.saves,
      icon: '✋',
      color: 'blue' as const
    },
    {
      label: t('calculated.goalsPerMatch'),
      value: typeof statistics.goals_per_match === 'number' 
        ? statistics.goals_per_match.toFixed(2) 
        : parseFloat(statistics.goals_per_match || '0').toFixed(2),
      icon: '📊',
      color: 'yellow' as const
    },
    {
      label: t('calculated.cleanSheetPercentage'),
      value: typeof statistics.clean_sheet_percentage === 'number'
        ? `${statistics.clean_sheet_percentage.toFixed(1)}%`
        : `${parseFloat(statistics.clean_sheet_percentage || '0').toFixed(1)}%`,
      icon: '💯',
      color: 'green' as const
    },
    {
      label: t('calculated.savePercentage'),
      value: typeof statistics.save_percentage === 'number'
        ? `${statistics.save_percentage.toFixed(1)}%`
        : `${parseFloat(statistics.save_percentage || '0').toFixed(1)}%`,
      icon: '🎯',
      color: 'blue' as const
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${colorClasses[stat.color]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
