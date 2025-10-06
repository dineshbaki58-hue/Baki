import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { progressAPI } from '../../services/api';

const ProgressScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await progressAPI.getAnalytics('month');
      setProgressData(response.data.analytics);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const logProgress = () => {
    Alert.alert(
      'Log Progress',
      'What would you like to log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Weight', onPress: () => logWeight() },
        { text: 'Workout', onPress: () => logWorkout() },
        { text: 'Nutrition', onPress: () => logNutrition() },
      ]
    );
  };

  const logWeight = () => {
    Alert.prompt(
      'Log Weight',
      'Enter your current weight (kg):',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (weight) => {
            if (weight && !isNaN(weight)) {
              try {
                await progressAPI.logProgress({
                  date: new Date().toISOString().split('T')[0],
                  weight: parseFloat(weight)
                });
                await loadProgressData();
                Alert.alert('Success', 'Weight logged successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to log weight');
              }
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const logWorkout = () => {
    Alert.alert('Log Workout', 'Workout logging feature coming soon!');
  };

  const logNutrition = () => {
    Alert.alert('Log Nutrition', 'Nutrition logging feature coming soon!');
  };

  const renderProgressCard = (title, value, unit, trend, icon) => (
    <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.cardValue, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.cardUnit, { color: theme.colors.textSecondary }]}>
          {unit}
        </Text>
      </View>
      
      {trend && (
        <View style={styles.cardTrend}>
          <Text style={[
            styles.trendText,
            { 
              color: trend === 'increasing' ? theme.colors.success : 
                    trend === 'decreasing' ? theme.colors.error : 
                    theme.colors.textSecondary 
            }
          ]}>
            {trend === 'increasing' ? '↗️' : 
             trend === 'decreasing' ? '↘️' : '→'} {trend}
          </Text>
        </View>
      )}
    </View>
  );

  const renderQuickStats = () => {
    if (!progressData) return null;

    return (
      <View style={styles.statsGrid}>
        {renderProgressCard(
          'Current Weight',
          progressData.progress?.averageWeight?.toFixed(1) || '--',
          'kg',
          progressData.progress?.weightTrend,
          '⚖️'
        )}
        
        {renderProgressCard(
          'Body Fat',
          progressData.progress?.averageBodyFat?.toFixed(1) || '--',
          '%',
          progressData.progress?.bodyFat?.trend,
          '📊'
        )}
        
        {renderProgressCard(
          'Daily Steps',
          progressData.progress?.averageSteps?.toFixed(0) || '--',
          'steps',
          null,
          '👟'
        )}
        
        {renderProgressCard(
          'Sleep Hours',
          progressData.progress?.averageSleep?.toFixed(1) || '--',
          'hrs',
          null,
          '😴'
        )}
      </View>
    );
  };

  const renderEngagementStats = () => {
    if (!progressData) return null;

    return (
      <View style={styles.engagementContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          This Month
        </Text>
        
        <View style={styles.engagementGrid}>
          <View style={[styles.engagementCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.engagementIcon}>📅</Text>
            <Text style={[styles.engagementValue, { color: theme.colors.text }]}>
              {progressData.engagement?.daysActive || 0}
            </Text>
            <Text style={[styles.engagementLabel, { color: theme.colors.textSecondary }]}>
              Days Active
            </Text>
          </View>
          
          <View style={[styles.engagementCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.engagementIcon}>🔥</Text>
            <Text style={[styles.engagementValue, { color: theme.colors.text }]}>
              {progressData.engagement?.streak || 0}
            </Text>
            <Text style={[styles.engagementLabel, { color: theme.colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading progress data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Progress
        </Text>
        
        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
          onPress={logProgress}
        >
          <Text style={[styles.logButtonText, { color: theme.colors.onPrimary }]}>
            + Log
          </Text>
        </TouchableOpacity>
      </View>

      {renderQuickStats()}
      {renderEngagementStats()}

      <View style={styles.tipsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tips for Success
        </Text>
        
        <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            Log your progress daily to maintain consistency and track your improvements over time.
          </Text>
        </View>
        
        <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.tipIcon}>📈</Text>
          <Text style={[styles.tipText, { color: theme.colors.text }]}>
            Focus on trends rather than daily fluctuations for a better understanding of your progress.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 14,
    marginLeft: 4,
  },
  cardTrend: {
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  engagementContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  engagementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  engagementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  engagementLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default ProgressScreen;