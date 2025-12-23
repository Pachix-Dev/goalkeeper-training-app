'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import TopGoalkeepers from '@/components/dashboard/TopGoalkeepers';

interface DashboardStats {
  totals: {
    teams: number;
    goalkeepers: number;
    tasks: number;
    sessions: number;
  };
  upcomingSessions: Array<{
    id: number;
    team_name: string;
    session_type: string;
    session_date: string;
    start_time: string;
    end_time: string | null;
    status: string;
  }>;
  recentMatches: Array<{
    id: number;
    goalkeeper_name: string;
    opponent: string;
    match_date: string;
    result: string;
    rating: number | null;
  }>;
  topGoalkeepers: Array<{
    goalkeeper_name: string;
    team_name: string | null;
    matches_played: number;
    clean_sheets: number;
    clean_sheet_percentage: number;
  }>;
}

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, isLoading, router, locale]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!isAuthenticated || !token) return;
      
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Error response:', response.status);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [isAuthenticated, token]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const modules = [
    {
      title: t('nav.teams'),
      description: 'Gestiona tus equipos',
      href: `/${locale}/teams`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: t('nav.goalkeepers'),
      description: 'Administra tus porteros',
      href: `/${locale}/goalkeepers`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },    
    {
      title: t('nav.tasks'),
      description: 'Biblioteca de tareas',
      href: `/${locale}/tasks`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: t('nav.sessions'),
      description: 'Planifica entrenamientos',
      href: `/${locale}/sessions`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: t('nav.statistics'),
      description: 'Analiza estadisticas',
      href: `/${locale}/statistics`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: t('nav.penalties'),
      description: 'Scouting de penaltis',
      href: `/${locale}/penalties`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t('nav.matchAnalysis'),
      description: 'Analisis de partido',
      href: `/${locale}/matches`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.welcome')}, {user?.name}
        </h2>
        <p className="text-gray-600">Panel de control general</p>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('nav.teams')}
            value={dashboardData.totals.teams}
            icon="TEAMS"
            color="blue"
          />
          <StatsCard
            title={t('nav.goalkeepers')}
            value={dashboardData.totals.goalkeepers}
            icon="GK"
            color="green"
          />
          <StatsCard
            title={t('nav.sessions')}
            value={dashboardData.totals.sessions}
            icon="SESS"
            color="purple"
          />
          <StatsCard
            title={t('nav.tasks')}
            value={dashboardData.totals.tasks}
            icon="TASK"
            color="orange"
          />
        </div>
      ) : null}

      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingSessions sessions={dashboardData.upcomingSessions} locale={locale} />
          <RecentActivity recentMatches={dashboardData.recentMatches} locale={locale} />
        </div>
      )}

      {dashboardData && dashboardData.topGoalkeepers.length > 0 && (
        <div className="mb-8">
          <TopGoalkeepers goalkeepers={dashboardData.topGoalkeepers} locale={locale} />
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Modulos de la Aplicacion</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <a key={index} href={module.href || '#'} className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {module.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
