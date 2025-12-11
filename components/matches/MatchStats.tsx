import { useTranslations } from 'next-intl';

interface MatchStatsProps {
  stats: {
    total_matches: number;
    total_minutes: number;
    total_goals_conceded: number;
    total_saves: number;
    total_high_balls: number;
    total_crosses: number;
    avg_rating: number;
    avg_distribution: number;
    clean_sheets: number;
  };
}

export default function MatchStats({ stats }: MatchStatsProps) {
  const t = useTranslations('matches.stats');

  const statCards = [
    {
      label: t('totalMatches'),
      value: stats.total_matches,
      icon: '🏆',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: t('totalMinutes'),
      value: stats.total_minutes,
      icon: '⏱️',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      label: t('totalSaves'),
      value: stats.total_saves,
      icon: '🧤',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      label: t('totalGoals'),
      value: stats.total_goals_conceded,
      icon: '⚽',
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      label: t('cleanSheets'),
      value: stats.clean_sheets,
      icon: '🛡️',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: t('avgRating'),
      value: stats.avg_rating ? stats.avg_rating.toFixed(2) : 'N/A',
      icon: '⭐',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      label: t('avgDistribution'),
      value: stats.avg_distribution ? `${stats.avg_distribution.toFixed(1)}%` : 'N/A',
      icon: '🎯',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      label: 'Balones Aéreos',
      value: stats.total_high_balls,
      icon: '🔝',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${stat.color} transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-right">
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
          <p className="text-sm font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
