'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    subcategory: string | null;
    duration: number | null;
    difficulty: string | null;
    is_public: boolean;
  };
  onDelete?: (id: number) => void;
}

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

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };
  return colors[difficulty] || 'bg-gray-500';
};

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const t = useTranslations('tasks');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const handleView = () => {
    router.push(`/${locale}/tasks/${task.id}`);
  };

  const handleEdit = () => {
    router.push(`/${locale}/tasks/${task.id}/edit`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {task.title}
            </h3>
            {task.subcategory && (
              <p className="text-sm text-gray-500">{task.subcategory}</p>
            )}
          </div>
          {task.is_public && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {t('publicTasks')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(
              task.category
            )}`}
          >
            {t(task.category as any)}
          </span>
          {task.difficulty && (
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getDifficultyColor(
                  task.difficulty
                )}`}
              />
              <span className="text-xs text-gray-600">
                {t(task.difficulty as any)}
              </span>
            </div>
          )}
          {task.duration && (
            <span className="text-xs text-gray-600">
              {task.duration} {t('minutes')}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {task.description}
          </p>
        )}

        <div className="mt-auto flex gap-2">
          <Button variant="outline" onClick={handleView} className="flex-1">
            {t('taskDetails')}
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            {t('editTask')}
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(task.id)}
              className="text-red-600 hover:bg-red-50"
            >
              {t('deleteTask')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
