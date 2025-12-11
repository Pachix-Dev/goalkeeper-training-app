'use client';

import { useTranslations } from 'next-intl';
import { ComparisonResult } from '@/lib/db/models/GoalkeeperStatisticsModel';

interface ComparisonTableProps {
  comparisons: ComparisonResult[];
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  const t = useTranslations('statistics');

  if (comparisons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('comparison.noData')}</p>
      </div>
    );
  }

  const metrics = [
    { key: 'matches_played', label: t('fields.matchesPlayed'), format: (v: number) => v },
    { key: 'goals_conceded', label: t('fields.goalsConceded'), format: (v: number) => v },
    { key: 'clean_sheets', label: t('fields.cleanSheets'), format: (v: number) => v },
    { key: 'saves', label: t('fields.saves'), format: (v: number) => v },
    { key: 'goals_per_match', label: t('calculated.goalsPerMatch'), format: (v: number) => v.toFixed(2) },
    { key: 'clean_sheet_percentage', label: t('calculated.cleanSheetPercentage'), format: (v: number) => `${v.toFixed(1)}%` },
    { key: 'save_percentage', label: t('calculated.savePercentage'), format: (v: number) => `${v.toFixed(1)}%` }
  ];

  const getBestValue = (key: string) => {
    const values = comparisons.map(c => c[key as keyof ComparisonResult] as number);
    
    // Para goles recibidos y goles por partido, menor es mejor
    if (key === 'goals_conceded' || key === 'goals_per_match') {
      return Math.min(...values);
    }
    
    // Para el resto, mayor es mejor
    return Math.max(...values);
  };

  const isBestValue = (value: number, key: string) => {
    return value === getBestValue(key);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="text-left p-4 font-semibold">Métrica</th>
            {comparisons.map((goalkeeper) => (
              <th key={goalkeeper.goalkeeper_id} className="text-center p-4 font-semibold">
                {goalkeeper.goalkeeper_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, idx) => (
            <tr key={metric.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-4 font-medium text-gray-700">{metric.label}</td>
              {comparisons.map((goalkeeper) => {
                const value = goalkeeper[metric.key as keyof ComparisonResult] as number;
                const isBest = isBestValue(value, metric.key);
                
                return (
                  <td 
                    key={goalkeeper.goalkeeper_id} 
                    className={`text-center p-4 ${
                      isBest ? 'bg-green-100 font-bold text-green-800' : ''
                    }`}
                  >
                    {metric.format(value)}
                    {isBest && <span className="ml-2">🏆</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
