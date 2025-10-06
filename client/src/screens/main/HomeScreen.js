import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { workoutAPI, nutritionAPI, progressAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [featuredWorkouts, setFeaturedWorkouts] = useState([]);
  const [recentNutrition, setRecentNutrition] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    streak: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsResponse, nutritionResponse, progressResponse] = await Promise.all([
        workoutAPI.getFeaturedWorkouts(),
        nutritionAPI.getPlans(),
        progressAPI.getProgress({ limit: 1 })
      ]);

      setFeaturedWorkouts(workoutsResponse.data.workouts.slice(0, 3));
      setRecentNutrition(nutritionResponse.data.plans[0] || null);
      setTodayProgress(progressResponse.data.entries[0] || null);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderQuickStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
          {stats.workoutsCompleted}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Workouts
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.success }]}>
          {stats.caloriesBurned}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Calories
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
          {stats.streak}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          Day Streak
        </Text>
      </View>
    </View>
  );

  const renderFeaturedWorkouts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Featured Workouts
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredWorkouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={[styles.workoutCard, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('WorkoutDetail', { workout })}
          >
            <View style={[styles.workoutImage, { backgroundColor: theme.colors.surface }]}>
              <Text style={styles.workoutEmoji}>💪</Text>
            </View>
            <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>
              {workout.title}
            </Text>
            <Text style={[styles.workoutDuration, { color: theme.colors.textSecondary }]}>
              {workout.duration_minutes} min
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNutritionPlan = () => {
    if (!recentNutrition) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Today's Nutrition
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Nutrition')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              View Plan
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.nutritionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('NutritionPlan', { plan: recentNutrition })}
        >
          <View style={styles.nutritionHeader}>
            <Text style={[styles.nutritionTitle, { color: theme.colors.text }]}>
              {recentNutrition.title}
            </Text>
            <Text style={[styles.nutritionCalories, { color: theme.colors.primary }]}>
              {recentNutrition.calories_per_day} cal
            </Text>
          </View>
          <Text style={[styles.nutritionDescription, { color: theme.colors.textSecondary }]}>
            {recentNutrition.description || 'AI-generated personalized meal plan'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Quick Actions
      </Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Workouts')}
        >
          <Text style={styles.actionEmoji}>🏃‍♂️</Text>
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
            Start Workout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.actionEmoji}>📊</Text>
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
            Log Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
          onPress={() => navigation.navigate('Nutrition')}
        >
          <Text style={styles.actionEmoji}>🍎</Text>
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
            Nutrition Plan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionEmoji}>⚙️</Text>
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.firstName || 'User'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      {renderQuickStats()}
      {renderFeaturedWorkouts()}
      {renderNutritionPlan()}
      {renderQuickActions()}
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
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutCard: {
    width: 160,
    marginLeft: 20,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  workoutImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutEmoji: {
    fontSize: 32,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 14,
  },
  nutritionCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  nutritionCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutritionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;