'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { UsageLimits } from '@/components/billing/UsageLimits';
import { 
  CreditCardIcon, 
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

// Texts for i18n - defined outside component to avoid useEffect warnings
const texts = {
  es: {
    title: 'Facturación y Suscripción',
    subtitle: 'Gestiona tu plan y métodos de pago',
    loading: 'Cargando...',
    notLoggedIn: 'Inicia sesión para ver tu suscripción',
    login: 'Iniciar sesión',
    freePlan: 'Plan Gratuito',
    freePlanDesc: 'Actualmente estás en el plan gratuito',
    upgrade: 'Mejorar plan',
    manageBilling: 'Gestionar facturación',
    cancelSubscription: 'Cancelar suscripción',
    reactivate: 'Reactivar suscripción',
    confirmCancel: '¿Estás seguro de que quieres cancelar tu suscripción? Seguirás teniendo acceso hasta el final del período actual.',
    paymentSuccess: '¡Pago realizado con éxito! Tu suscripción está activa.',
    features: 'Características de tu plan',
    included: 'Incluido',
    notIncluded: 'No incluido',
  },
  en: {
    title: 'Billing & Subscription',
    subtitle: 'Manage your plan and payment methods',
    loading: 'Loading...',
    notLoggedIn: 'Log in to view your subscription',
    login: 'Log in',
    freePlan: 'Free Plan',
    freePlanDesc: 'You are currently on the free plan',
    upgrade: 'Upgrade plan',
    manageBilling: 'Manage billing',
    cancelSubscription: 'Cancel subscription',
    reactivate: 'Reactivate subscription',
    confirmCancel: 'Are you sure you want to cancel your subscription? You will continue to have access until the end of the current period.',
    paymentSuccess: 'Payment successful! Your subscription is now active.',
    features: 'Your plan features',
    included: 'Included',
    notIncluded: 'Not included',
  },
};

interface SubscriptionData {
  subscription: {
    id: number;
    status: string;
    billing_cycle: 'monthly' | 'yearly';
    current_period_end?: string;
    cancel_at_period_end: boolean;
    plan_name?: string;
    plan_slug?: string;
  } | null;
  plan: {
    name: string;
    slug: string;
  };
  limits: {
    teams: { current: number; max: number; canCreate: boolean };
    goalkeepers: { current: number; max: number; canCreate: boolean };
    tasks: { current: number; max: number; canCreate: boolean };
    sessions: { current: number; max: number; canCreate: boolean };
  };
  features: {
    tactical_editor: boolean;
    statistics: boolean;
    match_analysis: boolean;
    penalty_tracking: boolean;
    export_pdf: boolean;
    priority_support: boolean;
  };
  invoices: Array<{
    id: number;
    stripe_invoice_id: string;
    amount: number;
    amount_paid: number;
    currency: string;
    status: string;
    invoice_url?: string;
    invoice_pdf?: string;
    hosted_invoice_url?: string;
    period_start?: string;
    period_end?: string;
    paid_at?: string;
    created_at: string;
  }>;
}

export default function BillingPage() {
  const locale = useLocale();
  const { user, token } = useAuth();
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay sesión de checkout exitosa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      const localizedTexts = texts[locale as keyof typeof texts];
      setSuccessMessage(localizedTexts?.paymentSuccess || 'Payment successful!');
      // Limpiar URL
      window.history.replaceState({}, '', `/${locale}/billing`);
    }
  }, [locale]);

  // Cargar datos de suscripción
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/subscription?include=limits,features,invoices', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSubscriptionData(data);
        } else {
          setError(data.error || 'Error loading subscription');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error loading subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user, token]);

  const handleManageBilling = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-locale': locale,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Redirigir al portal de Stripe
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error opening billing portal');
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token || !confirm(texts[locale as keyof typeof texts]?.confirmCancel || 'Are you sure?')) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccessMessage(data.message);
      // Recargar datos
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelling subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccessMessage(data.message);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reactivating subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  // Usuario no autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">{t.notLoggedIn}</p>
          <a
            href={`/${locale}/login`}
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.login}
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscriptionData?.subscription && 
    ['active', 'trialing'].includes(subscriptionData.subscription.status);
  const isFree = subscriptionData?.plan.slug === 'free' || !hasActiveSubscription;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-gray-600">{t.subtitle}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <p className="text-green-800">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Subscription Status */}
          {isFree ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t.freePlan}</h3>
                  <p className="mt-1 text-gray-600">{t.freePlanDesc}</p>
                </div>
                <a
                  href={`/${locale}/pricing`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {t.upgrade}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : subscriptionData?.subscription && (
            <SubscriptionStatus
              status={subscriptionData.subscription.status}
              planName={subscriptionData.plan.name}
              billingCycle={subscriptionData.subscription.billing_cycle}
              currentPeriodEnd={subscriptionData.subscription.current_period_end}
              cancelAtPeriodEnd={subscriptionData.subscription.cancel_at_period_end}
              locale={locale}
            />
          )}

          {/* Actions for paid plans */}
          {hasActiveSubscription && (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleManageBilling}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                <CreditCardIcon className="h-5 w-5" />
                {t.manageBilling}
                {isProcessing && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              </button>

              {subscriptionData?.subscription?.cancel_at_period_end ? (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {t.reactivate}
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                >
                  {t.cancelSubscription}
                </button>
              )}
            </div>
          )}

          {/* Usage Limits */}
          {subscriptionData?.limits && (
            <UsageLimits limits={subscriptionData.limits} locale={locale} />
          )}

          {/* Features */}
          {subscriptionData?.features && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.features}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(subscriptionData.features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice History */}
          {subscriptionData?.invoices && subscriptionData.invoices.length > 0 && (
            <InvoiceHistory invoices={subscriptionData.invoices} locale={locale} />
          )}
        </div>
      </div>
    </div>
  );
}
