'use client';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  link?: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50'
  };

  return (
    <div className={`rounded-lg border border-gray-200 ${bgColorClasses[color]} p-6 transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-full p-4 text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
