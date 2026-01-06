'use client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
}

interface PlanFeaturesProps {
  locale?: string;
}

export function PlanFeatures({ locale = 'es' }: PlanFeaturesProps) {
  const texts = {
    es: {
      title: 'Comparar características',
      subtitle: 'Encuentra el plan perfecto para tu equipo',
      free: 'Free',
      pro: 'Pro',
      elite: 'Elite',
      features: [
        { name: 'Equipos', free: '1', pro: '10', elite: 'Ilimitados' },
        { name: 'Porteros', free: '3', pro: '50', elite: 'Ilimitados' },
        { name: 'Tareas personalizadas', free: '5', pro: 'Ilimitadas', elite: 'Ilimitadas' },
        { name: 'Sesiones de entrenamiento', free: '10/mes', pro: 'Ilimitadas', elite: 'Ilimitadas' },
        { name: 'Editor táctico', free: false, pro: true, elite: true },
        { name: 'Estadísticas avanzadas', free: false, pro: true, elite: true },
        { name: 'Análisis de partidos', free: false, pro: true, elite: true },
        { name: 'Seguimiento de penaltis', free: false, pro: true, elite: true },
        { name: 'Exportar a PDF', free: false, pro: true, elite: true },
        { name: 'Soporte prioritario', free: false, pro: false, elite: true },
        { name: 'Acceso API', free: false, pro: false, elite: true },
        { name: 'Onboarding personalizado', free: false, pro: false, elite: true },
      ] as Feature[],
    },
    en: {
      title: 'Compare features',
      subtitle: 'Find the perfect plan for your team',
      free: 'Free',
      pro: 'Pro',
      elite: 'Elite',
      features: [
        { name: 'Teams', free: '1', pro: '10', elite: 'Unlimited' },
        { name: 'Goalkeepers', free: '3', pro: '50', elite: 'Unlimited' },
        { name: 'Custom tasks', free: '5', pro: 'Unlimited', elite: 'Unlimited' },
        { name: 'Training sessions', free: '10/month', pro: 'Unlimited', elite: 'Unlimited' },
        { name: 'Tactical editor', free: false, pro: true, elite: true },
        { name: 'Advanced statistics', free: false, pro: true, elite: true },
        { name: 'Match analysis', free: false, pro: true, elite: true },
        { name: 'Penalty tracking', free: false, pro: true, elite: true },
        { name: 'Export to PDF', free: false, pro: true, elite: true },
        { name: 'Priority support', free: false, pro: false, elite: true },
        { name: 'API access', free: false, pro: false, elite: true },
        { name: 'Personalized onboarding', free: false, pro: false, elite: true },
      ] as Feature[],
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="mx-auto h-5 w-5 text-green-500" />
      ) : (
        <XMarkIcon className="mx-auto h-5 w-5 text-gray-300" />
      );
    }
    return <span className="text-gray-900 font-medium">{value}</span>;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="mt-2 text-gray-600">{t.subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
          <div className="p-4"></div>
          <div className="p-4 text-center font-semibold text-gray-700">{t.free}</div>
          <div className="p-4 text-center font-semibold text-blue-600 bg-blue-50">{t.pro}</div>
          <div className="p-4 text-center font-semibold text-gray-700">{t.elite}</div>
        </div>

        {/* Features */}
        {t.features.map((feature, index) => (
          <div
            key={index}
            className={`grid grid-cols-4 border-b border-gray-100 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className="p-4 text-sm text-gray-700">{feature.name}</div>
            <div className="p-4 text-center text-sm">{renderValue(feature.free)}</div>
            <div className="p-4 text-center text-sm bg-blue-50/50">{renderValue(feature.pro)}</div>
            <div className="p-4 text-center text-sm">{renderValue(feature.elite)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
