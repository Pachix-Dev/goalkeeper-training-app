'use client';

interface UsageLimitsProps {
  limits: {
    teams: { current: number; max: number; canCreate: boolean };
    goalkeepers: { current: number; max: number; canCreate: boolean };
    tasks: { current: number; max: number; canCreate: boolean };
    sessions: { current: number; max: number; canCreate: boolean };
  };
  locale?: string;
}

export function UsageLimits({ limits, locale = 'es' }: UsageLimitsProps) {
  const texts = {
    es: {
      title: 'Uso del plan',
      teams: 'Equipos',
      goalkeepers: 'Porteros',
      tasks: 'Tareas',
      sessions: 'Sesiones este mes',
      unlimited: 'Ilimitado',
      of: 'de',
    },
    en: {
      title: 'Plan usage',
      teams: 'Teams',
      goalkeepers: 'Goalkeepers',
      tasks: 'Tasks',
      sessions: 'Sessions this month',
      unlimited: 'Unlimited',
      of: 'of',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  const resources = [
    { key: 'teams', label: t.teams, ...limits.teams },
    { key: 'goalkeepers', label: t.goalkeepers, ...limits.goalkeepers },
    { key: 'tasks', label: t.tasks, ...limits.tasks },
    { key: 'sessions', label: t.sessions, ...limits.sessions },
  ];

  const getProgressColor = (current: number, max: number) => {
    if (max >= 999) return 'bg-green-500'; // Unlimited
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getPercentage = (current: number, max: number) => {
    if (max >= 999) return 100;
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.title}</h3>

      <div className="space-y-5">
        {resources.map((resource) => (
          <div key={resource.key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{resource.label}</span>
              <span className="text-sm text-gray-600">
                {resource.current} {t.of}{' '}
                {resource.max >= 999 ? t.unlimited : resource.max}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(resource.current, resource.max)}`}
                style={{ width: `${getPercentage(resource.current, resource.max)}%` }}
              />
            </div>
            {!resource.canCreate && resource.max < 999 && (
              <p className="mt-1 text-xs text-red-600">
                Has alcanzado el límite de tu plan
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
