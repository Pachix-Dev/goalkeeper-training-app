'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface RecentMatch {
  id: number;
  match_date: string;
  opponent: string;
  result: string;
  rating: number | null;
  goalkeeper_name: string;
}

interface RecentActivityProps {
  recentMatches: RecentMatch[];
  locale: string;
}

export default function RecentActivity({ recentMatches, locale }: RecentActivityProps) {
  const t = useTranslations('dashboard');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating >= 8) return 'bg-green-100 text-green-800';
    if (rating >= 6) return 'bg-blue-100 text-blue-800';
    if (rating >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (recentMatches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Actividad Reciente</h2>
        <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🎯 Análisis de Partidos Recientes</h2>
        <Link 
          href={`/${locale}/matches`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Ver todos →
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentMatches.map((match) => (
          <Link 
            key={match.id}
            href={`/${locale}/matches/${match.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{match.goalkeeper_name}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-gray-700">{match.opponent}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{formatDate(match.match_date)}</span>
                  {match.result && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700 font-medium">{match.result}</span>
                    </>
                  )}
                  {match.rating !== null && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRatingColor(match.rating)}`}>
                        ⭐ {match.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
