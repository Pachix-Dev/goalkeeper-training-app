'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SubscriptionLimits {
  teams: { current: number; max: number; canCreate: boolean };
  goalkeepers: { current: number; max: number; canCreate: boolean };
  tasks: { current: number; max: number; canCreate: boolean };
  sessions: { current: number; max: number; canCreate: boolean };
}

interface SubscriptionFeatures {
  tactical_editor: boolean;
  statistics: boolean;
  match_analysis: boolean;
  penalty_tracking: boolean;
  export_pdf: boolean;
  priority_support: boolean;
}

interface SubscriptionPlan {
  name: string;
  slug: string;
}

interface SubscriptionState {
  isLoading: boolean;
  plan: SubscriptionPlan;
  status: string;
  billingCycle: 'monthly' | 'yearly' | null;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  refreshSubscription: () => Promise<void>;
  canCreate: (resource: keyof SubscriptionLimits) => boolean;
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  isPro: boolean;
  isElite: boolean;
  isFree: boolean;
}

const defaultLimits: SubscriptionLimits = {
  teams: { current: 0, max: 1, canCreate: true },
  goalkeepers: { current: 0, max: 3, canCreate: true },
  tasks: { current: 0, max: 5, canCreate: true },
  sessions: { current: 0, max: 10, canCreate: true },
};

const defaultFeatures: SubscriptionFeatures = {
  tactical_editor: false,
  statistics: false,
  match_analysis: false,
  penalty_tracking: false,
  export_pdf: false,
  priority_support: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    plan: { name: 'Free', slug: 'free' },
    status: 'active',
    billingCycle: null,
    limits: defaultLimits,
    features: defaultFeatures,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadSubscription = async () => {
      if (!user || !token) {
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
        return;
      }

      try {
        const response = await fetch('/api/stripe/subscription?include=limits,features', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          setState({
            isLoading: false,
            plan: data.plan || { name: 'Free', slug: 'free' },
            status: data.subscription?.status || 'active',
            billingCycle: data.subscription?.billing_cycle || null,
            limits: data.limits || defaultLimits,
            features: data.features || defaultFeatures,
            currentPeriodEnd: data.subscription?.current_period_end 
              ? new Date(data.subscription.current_period_end) 
              : null,
            cancelAtPeriodEnd: data.subscription?.cancel_at_period_end || false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    loadSubscription();
    
    return () => {
      isMounted = false;
    };
  }, [user, token]);

  const canCreate = (resource: keyof SubscriptionLimits): boolean => {
    return state.limits[resource]?.canCreate ?? false;
  };

  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return state.features[feature] ?? false;
  };

  const refreshSubscription = async (): Promise<void> => {
    if (!user || !token) return;

    try {
      const response = await fetch('/api/stripe/subscription?include=limits,features', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          isLoading: false,
          plan: data.plan || { name: 'Free', slug: 'free' },
          status: data.subscription?.status || 'active',
          billingCycle: data.subscription?.billing_cycle || null,
          limits: data.limits || defaultLimits,
          features: data.features || defaultFeatures,
          currentPeriodEnd: data.subscription?.current_period_end 
            ? new Date(data.subscription.current_period_end) 
            : null,
          cancelAtPeriodEnd: data.subscription?.cancel_at_period_end || false,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const value: SubscriptionContextType = {
    ...state,
    refreshSubscription,
    canCreate,
    hasFeature,
    isPro: state.plan.slug === 'pro',
    isElite: state.plan.slug === 'elite',
    isFree: state.plan.slug === 'free' || !state.plan.slug,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Hook para verificar límites antes de crear
export function useCanCreate(resource: keyof SubscriptionLimits) {
  const { limits, canCreate, plan } = useSubscription();
  
  return {
    canCreate: canCreate(resource),
    current: limits[resource].current,
    max: limits[resource].max,
    isUnlimited: limits[resource].max >= 999,
    planName: plan.name,
  };
}

// Hook para verificar features
export function useHasFeature(feature: keyof SubscriptionFeatures) {
  const { hasFeature, plan } = useSubscription();
  
  return {
    hasFeature: hasFeature(feature),
    planName: plan.name,
  };
}
