'use client';

import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon 
} from '@heroicons/react/24/solid';

interface SubscriptionStatusProps {
  status: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodEnd?: Date | string;
  cancelAtPeriodEnd?: boolean;
  locale?: string;
}

export function SubscriptionStatus({
  status,
  planName,
  billingCycle,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
  locale = 'es',
}: SubscriptionStatusProps) {
  const texts = {
    es: {
      active: 'Activa',
      trialing: 'Período de prueba',
      past_due: 'Pago pendiente',
      cancelled: 'Cancelada',
      inactive: 'Inactiva',
      monthly: 'Mensual',
      yearly: 'Anual',
      renewsOn: 'Se renueva el',
      endsOn: 'Finaliza el',
      trialEndsOn: 'Prueba termina el',
      willCancel: 'Se cancelará al finalizar el período',
      updatePayment: 'Actualizar método de pago',
      reactivate: 'Reactivar suscripción',
    },
    en: {
      active: 'Active',
      trialing: 'Trial period',
      past_due: 'Payment due',
      cancelled: 'Cancelled',
      inactive: 'Inactive',
      monthly: 'Monthly',
      yearly: 'Yearly',
      renewsOn: 'Renews on',
      endsOn: 'Ends on',
      trialEndsOn: 'Trial ends on',
      willCancel: 'Will cancel at end of period',
      updatePayment: 'Update payment method',
      reactivate: 'Reactivate subscription',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: t.active,
        };
      case 'trialing':
        return {
          icon: ClockIcon,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: t.trialing,
        };
      case 'past_due':
        return {
          icon: ExclamationCircleIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: t.past_due,
        };
      case 'cancelled':
        return {
          icon: XCircleIcon,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: t.cancelled,
        };
      default:
        return {
          icon: XCircleIcon,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: t.inactive,
        };
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-10 w-10 ${config.color} shrink-0`} />
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">{planName}</h3>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
              {config.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600">
            {t[billingCycle as keyof typeof t]}
          </p>

          {currentPeriodEnd && (
            <p className="mt-3 text-sm text-gray-700">
              {cancelAtPeriodEnd ? (
                <span className="text-orange-600 font-medium">
                  ⚠️ {t.willCancel}: {formatDate(currentPeriodEnd)}
                </span>
              ) : status === 'trialing' ? (
                <>
                  {t.trialEndsOn}: <span className="font-medium">{formatDate(currentPeriodEnd)}</span>
                </>
              ) : (
                <>
                  {t.renewsOn}: <span className="font-medium">{formatDate(currentPeriodEnd)}</span>
                </>
              )}
            </p>
          )}

          {status === 'past_due' && (
            <div className="mt-4">
              <button className="text-sm font-medium text-yellow-700 hover:text-yellow-800 underline">
                {t.updatePayment}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
