import { User, SubscriptionPlan, SubscriptionTier, Currency, Subscription } from '../types';

const subscriptionPlans: Record<Currency, SubscriptionPlan[]> = {
    USD: [
        {
            id: 'basic',
            name: 'Basic',
            price: 0,
            currency: 'USD',
            interval: 'month',
            features: [
                'Track up to 5 services',
                'Basic service history',
                'Manual data entry',
                'Email support'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 9.99,
            currency: 'USD',
            interval: 'month',
            features: [
                'Unlimited service tracking',
                'AI-powered diagnostics',
                'Smart maintenance reminders',
                'Advanced analytics',
                'Priority support',
                'Data export'
            ],
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 19.99,
            currency: 'USD',
            interval: 'month',
            features: [
                'Everything in Pro',
                'Multi-vehicle support',
                'Custom maintenance schedules',
                'Integration with service centers',
                'Dedicated account manager',
                'White-label options'
            ]
        }
    ],
    EUR: [
        {
            id: 'basic',
            name: 'Basic',
            price: 0,
            currency: 'EUR',
            interval: 'month',
            features: [
                'Track up to 5 services',
                'Basic service history',
                'Manual data entry',
                'Email support'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 8.59,
            currency: 'EUR',
            interval: 'month',
            features: [
                'Unlimited service tracking',
                'AI-powered diagnostics',
                'Smart maintenance reminders',
                'Advanced analytics',
                'Priority support',
                'Data export'
            ],
            popular: true
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 17.19,
            currency: 'EUR',
            interval: 'month',
            features: [
                'Everything in Pro',
                'Multi-vehicle support',
                'Custom maintenance schedules',
                'Integration with service centers',
                'Dedicated account manager',
                'White-label options'
            ]
        }
    ]
};

export const subscriptionService = {
    getPlans: (currency: Currency): SubscriptionPlan[] => {
        return subscriptionPlans[currency] || subscriptionPlans.USD;
    },

    getCurrentPlan: (user: User, currency: Currency): SubscriptionPlan => {
        const plans = subscriptionPlans[currency] || subscriptionPlans.USD;
        return plans.find(plan => plan.id === (user.subscriptionTier || 'basic')) || plans[0];
    },

    upgradeSubscription: (user: User, planId: SubscriptionTier): User => {
        const subscription: Subscription = {
            id: `sub_${Date.now()}`,
            planId,
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            cancelAtPeriodEnd: false
        };

        const updatedUser: User = {
            ...user,
            subscriptionTier: planId,
            subscription
        };

        // Update in localStorage
        const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
        const userIndex = users.findIndex(u => u.username === user.username);
        if (userIndex > -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('app_users', JSON.stringify(users));
        }

        // Update current user session
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return updatedUser;
    },

    cancelSubscription: (user: User): User => {
        const updatedUser: User = {
            ...user,
            subscriptionTier: 'basic',
            subscription: user.subscription ? {
                ...user.subscription,
                status: 'canceled',
                cancelAtPeriodEnd: true
            } : undefined
        };

        // Update in localStorage
        const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
        const userIndex = users.findIndex(u => u.username === user.username);
        if (userIndex > -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem('app_users', JSON.stringify(users));
        }

        // Update current user session
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return updatedUser;
    },

    hasFeatureAccess: (user: User, feature: string): boolean => {
        const tier = user.subscriptionTier || 'basic';
        
        const featureAccess: Record<SubscriptionTier, string[]> = {
            basic: ['basic_tracking', 'manual_entry'],
            pro: ['basic_tracking', 'manual_entry', 'ai_diagnostics', 'smart_reminders', 'analytics', 'export'],
            premium: ['basic_tracking', 'manual_entry', 'ai_diagnostics', 'smart_reminders', 'analytics', 'export', 'multi_vehicle', 'custom_schedules', 'integrations']
        };

        return featureAccess[tier]?.includes(feature) || false;
    },

    getUsageLimits: (user: User): { maxServices: number; maxVehicles: number } => {
        const tier = user.subscriptionTier || 'basic';
        
        const limits: Record<SubscriptionTier, { maxServices: number; maxVehicles: number }> = {
            basic: { maxServices: 5, maxVehicles: 1 },
            pro: { maxServices: -1, maxVehicles: 1 }, // -1 means unlimited
            premium: { maxServices: -1, maxVehicles: -1 }
        };

        return limits[tier];
    }
};