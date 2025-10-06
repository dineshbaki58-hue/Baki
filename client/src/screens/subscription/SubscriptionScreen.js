import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { subscriptionAPI } from '../../services/api';

const SubscriptionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      period: 'month',
      features: [
        'Access to basic workouts',
        'Basic nutrition tracking',
        'Community support',
        'Limited AI features'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      period: 'month',
      features: [
        'All basic features',
        'AI nutrition plans',
        'Advanced workout library',
        'Progress analytics',
        'Priority support',
        'Custom meal plans'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      period: 'month',
      features: [
        'All premium features',
        'Personal trainer AI',
        'Advanced analytics',
        'Custom workout plans',
        '1-on-1 support',
        'Early access to features'
      ],
      popular: false
    }
  ];

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getStatus();
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'basic') {
      Alert.alert('Basic Plan', 'You are already on the basic plan!');
      return;
    }

    try {
      setProcessing(true);
      
      // In a real app, you would integrate with Stripe here
      Alert.alert(
        'Subscription',
        `This would redirect to Stripe payment for ${plans.find(p => p.id === planId)?.name} plan. Payment integration coming soon!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              // Simulate successful subscription
              setSubscription({
                hasSubscription: true,
                isActive: true,
                plan: planId,
                status: 'active'
              });
              Alert.alert('Success', 'Subscription activated!');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionAPI.cancelSubscription();
              await loadSubscriptionStatus();
              Alert.alert('Cancelled', 'Your subscription has been cancelled');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  const renderCurrentPlan = () => {
    if (!subscription?.hasSubscription) return null;

    const currentPlan = plans.find(p => p.id === subscription.plan);
    
    return (
      <View style={[styles.currentPlanCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.currentPlanTitle, { color: theme.colors.text }]}>
          Current Plan
        </Text>
        
        <View style={styles.currentPlanInfo}>
          <Text style={[styles.planName, { color: theme.colors.text }]}>
            {currentPlan?.name || subscription.plan}
          </Text>
          <Text style={[styles.planStatus, { 
            color: subscription.isActive ? theme.colors.success : theme.colors.error 
          }]}>
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        
        {subscription.currentPeriodEnd && (
          <Text style={[styles.planExpiry, { color: theme.colors.textSecondary }]}>
            Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </Text>
        )}
        
        {subscription.isActive && (
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.error }]}
            onPress={handleCancelSubscription}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>
              Cancel Subscription
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPlanCard = (plan) => (
    <View
      key={plan.id}
      style={[
        styles.planCard,
        { 
          backgroundColor: theme.colors.card,
          borderColor: plan.popular ? theme.colors.primary : theme.colors.border,
          borderWidth: plan.popular ? 2 : 1
        }
      ]}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.popularText, { color: theme.colors.onPrimary }]}>
            MOST POPULAR
          </Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: theme.colors.text }]}>
          {plan.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.colors.text }]}>
            ${plan.price}
          </Text>
          <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
            /{plan.period}
          </Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.subscribeButton,
          { 
            backgroundColor: plan.popular ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border
          }
        ]}
        onPress={() => handleSubscribe(plan.id)}
        disabled={processing || subscription?.plan === plan.id}
      >
        {processing ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Text style={[
            styles.subscribeButtonText,
            { 
              color: plan.popular ? theme.colors.onPrimary : theme.colors.text
            }
          ]}>
            {subscription?.plan === plan.id ? 'Current Plan' : 'Subscribe'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading subscription info...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Subscription
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose the plan that's right for you
        </Text>
      </View>

      {renderCurrentPlan()}

      <View style={styles.plansContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Available Plans
        </Text>
        
        {plans.map(renderPlanCard)}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          All plans include a 7-day free trial. Cancel anytime.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  currentPlanCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  currentPlanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  planExpiry: {
    fontSize: 14,
    marginBottom: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
});

export default SubscriptionScreen;