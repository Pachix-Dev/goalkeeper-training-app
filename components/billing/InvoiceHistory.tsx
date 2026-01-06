'use client';

import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Invoice {
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
}

interface InvoiceHistoryProps {
  invoices: Invoice[];
  locale?: string;
}

export function InvoiceHistory({ invoices, locale = 'es' }: InvoiceHistoryProps) {
  const texts = {
    es: {
      title: 'Historial de facturas',
      noInvoices: 'No hay facturas disponibles',
      date: 'Fecha',
      amount: 'Monto',
      status: 'Estado',
      actions: 'Acciones',
      view: 'Ver',
      download: 'Descargar',
      paid: 'Pagada',
      open: 'Pendiente',
      void: 'Anulada',
      uncollectible: 'Incobrable',
      draft: 'Borrador',
    },
    en: {
      title: 'Invoice history',
      noInvoices: 'No invoices available',
      date: 'Date',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      download: 'Download',
      paid: 'Paid',
      open: 'Open',
      void: 'Void',
      uncollectible: 'Uncollectible',
      draft: 'Draft',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.es;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: t.paid },
      open: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t.open },
      void: { bg: 'bg-gray-100', text: 'text-gray-700', label: t.void },
      uncollectible: { bg: 'bg-red-100', text: 'text-red-700', label: t.uncollectible },
      draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: t.draft },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-500">{t.noInvoices}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.date}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.amount}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.status}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.paid_at || invoice.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatAmount(invoice.amount, invoice.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-3">
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        {t.view}
                      </a>
                    )}
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        {t.download}
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
