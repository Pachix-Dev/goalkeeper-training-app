'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SessionTaskItem } from '@/components/sessions/SessionTaskItem';
import { DiagramGallery } from '@/components/sessions/DiagramGallery';
import { apiGet, apiDelete, apiPost } from '@/lib/utils/api';

interface Session {
  id: number;
  title: string;
  description: string | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  team_name?: string;
  session_type: string;
  status: string;
  notes: string | null;
  weather: string | null;
}

interface SessionTask {
  id: number;
  task_id: number;
  order_number: number;
  duration: number | null;
  intensity: string | null;
  notes: string | null;
  task_title?: string;
  task_category?: string;
  task_difficulty?: string;
  design_id?: number | null;
  design_img?: string | null;
}

interface Task {
  id: number;
  title: string;
}

export default function SessionDetailPage() {
  const t = useTranslations('sessions');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    task_id: '',
    duration: '',
    intensity: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionData, tasksData, allTasks] = await Promise.all([
        apiGet<Session>(`/api/sessions/${sessionId}`),
        apiGet<SessionTask[]>(`/api/sessions/${sessionId}/tasks`),
        apiGet<Task[]>('/api/tasks')
      ]);
      setSession(sessionData);
      setSessionTasks(Array.isArray(tasksData) ? tasksData : []);
      setTasks(Array.isArray(allTasks) ? allTasks : []);
    } catch (error) {
      console.error(t('errorLoading'), error);
      router.push(`/${locale}/sessions`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await apiDelete(`/api/sessions/${sessionId}`);
      router.push(`/${locale}/sessions`);
    } catch (error) {
      console.error(t('errorDeleting'), error);
      alert(t('errorDeleting'));
    }
  };

  const handleAddTask = async () => {
    try {
      const orderNumber = sessionTasks.length + 1;
      await apiPost(`/api/sessions/${sessionId}/tasks`, {
        task_id: parseInt(newTask.task_id),
        order_number: orderNumber,
        duration: newTask.duration ? parseInt(newTask.duration) : undefined,
        intensity: newTask.intensity || undefined,
        notes: newTask.notes || undefined
      });
      setShowAddTask(false);
      setNewTask({ task_id: '', duration: '', intensity: '', notes: '' });
      loadData();
    } catch (error) {
      console.error(t('errorAddingTask'), error);
      alert(t('errorAddingTask'));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiDelete(`/api/sessions/${sessionId}/tasks/${taskId}`);
      loadData();
    } catch (error) {
      console.error(t('errorDeletingTask'), error);    
    alert(t('errorDeletingTask'));
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  if (loading || !session) {
    return <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-4xl mx-auto px-4"><p className="text-center text-gray-600">Cargando...</p></div></div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => router.push(`/${locale}/sessions`)} className="mb-4">
          ← Volver
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-gray-600 mt-2">{formatDate(session.session_date)}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="print:hidden"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('print')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/${locale}/sessions/${sessionId}/attendance`)}
              className="print:hidden"
            >
              📋 Asistencia
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/${locale}/sessions/${sessionId}/edit`)}
              className="print:hidden"
            >
              {t('editSession')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete} 
              className="text-red-600 hover:bg-red-50 print:hidden"
            >
              {t('deleteSession')}
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('team')}</p>
              <p className="font-medium">{session.team_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('sessionType')}</p>
              <p className="font-medium">{t(session.session_type as any)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('status')}</p>
              <p className="font-medium">{t(session.status as any)}</p>
            </div>
            {session.location && (
              <div>
                <p className="text-sm text-gray-500">{t('location')}</p>
                <p className="font-medium">{session.location}</p>
              </div>
            )}
          </div>
          {session.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">{t('description')}</p>
              <p className="text-gray-700">{session.description}</p>
            </div>
          )}
          {session.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">{t('notes')}</p>
              <p className="text-gray-700">{session.notes}</p>
            </div>
          )}
        </Card>

        {/* Galería de diagramas tácticos */}
        <DiagramGallery tasks={sessionTasks} />

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('tasks')}</h2>
            <Button onClick={() => setShowAddTask(true)} className="print:hidden">+ {t('addTask')}</Button>
          </div>

          {showAddTask && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                  value={newTask.task_id}
                  onChange={(e) => setNewTask({ ...newTask, task_id: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">{t('selectTask')}</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder={t('taskDuration')}
                  value={newTask.duration}
                  onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <select
                  value={newTask.intensity}
                  onChange={(e) => setNewTask({ ...newTask, intensity: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">{t('selectIntensity')}</option>
                  <option value="low">{t('low')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="very_high">{t('very_high')}</option>
                </select>
                <input
                  placeholder={t('taskNotes')}
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTask} disabled={!newTask.task_id}>Agregar</Button>
                <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {sessionTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('noTasksDescription')}</p>
            ) : (
              sessionTasks.map((task) => (
                <SessionTaskItem key={task.id} task={task} onDelete={handleDeleteTask} />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
