'use client';

import Link from 'next/link';

interface TopGoalkeeper {
  goalkeeper_name: string;
  team_name: string | null;
  matches_played: number;
  clean_sheets: number;
  clean_sheet_percentage: number;
}

interface TopGoalkeepersProps {
  goalkeepers: TopGoalkeeper[];
  locale: string;
}

export default function TopGoalkeepers({ goalkeepers, locale }: TopGoalkeepersProps) {
  if (goalkeepers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Porteros</h2>
        <p className="text-gray-500 text-center py-8">No hay datos suficientes</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🏆 Top Porteros (Temporada Actual)</h2>
        <Link 
          href={`/${locale}/statistics`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Ver estadísticas →
        </Link>
      </div>
      
      <div className="space-y-3">
        {goalkeepers.map((goalkeeper, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-orange-400 text-orange-900' :
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{goalkeeper.goalkeeper_name}</p>
                <p className="text-sm text-gray-600">
                  {goalkeeper.team_name || 'Sin equipo'} • {goalkeeper.matches_played} partidos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {goalkeeper.clean_sheet_percentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">{goalkeeper.clean_sheets} porterías a cero</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
