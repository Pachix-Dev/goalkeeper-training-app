'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface SessionTaskItemProps {
  task: {
    id: number;
    task_id: number;
    order_number: number;
    duration: number | null;
    intensity: string | null;
    notes: string | null;
    task_title?: string;
    task_category?: string;
    task_difficulty?: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const getIntensityColor = (intensity: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    very_high: 'bg-red-500'
  };
  return colors[intensity] || 'bg-gray-500';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-800',
    tactical: 'bg-purple-100 text-purple-800',
    physical: 'bg-green-100 text-green-800',
    psychological: 'bg-yellow-100 text-yellow-800',
    goalkeeper_specific: 'bg-red-100 text-red-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export function SessionTaskItem({ task, onEdit, onDelete }: SessionTaskItemProps) {
  const t = useTranslations('sessions');
  const tTasks = useTranslations('tasks');

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-700">
              #{task.order_number}
            </span>
            <h4 className="text-md font-semibold text-gray-900">
              {task.task_title || 'Tarea sin título'}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {task.task_category && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(
                  task.task_category
                )}`}
              >
                {tTasks(task.task_category as any)}
              </span>
            )}
            {task.intensity && (
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${getIntensityColor(
                    task.intensity
                  )}`}
                />
                <span className="text-xs text-gray-600">
                  {t(task.intensity as any)}
                </span>
              </div>
            )}
            {task.duration && (
              <span className="text-xs text-gray-600">
                {task.duration} {tTasks('minutes')}
              </span>
            )}
            {task.task_difficulty && (
              <span className="text-xs text-gray-600">
                {tTasks(task.task_difficulty as any)}
              </span>
            )}
          </div>

          {task.notes && (
            <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(task.id)}
              className="text-sm py-1 px-2"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(task.id)}
              className="text-sm py-1 px-2 text-red-600 hover:bg-red-50"
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
