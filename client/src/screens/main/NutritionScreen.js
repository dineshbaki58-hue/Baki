import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { nutritionAPI } from '../../services/api';

const NutritionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await nutritionAPI.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error loading nutrition plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const generateNewPlan = async () => {
    try {
      Alert.alert(
        'Generate AI Plan',
        'This will create a personalized nutrition plan based on your profile. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Generate', 
            onPress: async () => {
              const response = await nutritionAPI.generatePlan({
                fitnessGoal: 'general_fitness',
                dietaryRestrictions: [],
                foodPreferences: [],
                allergies: []
              });
              
              if (response.data.success) {
                await loadPlans();
                navigation.navigate('NutritionPlan', { plan: response.data.plan });
              } else {
                Alert.alert('Error', 'Failed to generate nutrition plan');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate nutrition plan');
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.planCard, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('NutritionPlan', { plan: item })}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        {item.is_ai_generated && (
          <View style={[styles.aiBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.aiText, { color: theme.colors.onPrimary }]}>
              AI
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>
        {item.description || 'Personalized nutrition plan'}
      </Text>
      
      <View style={styles.planStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {item.calories_per_day}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Calories
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {item.protein_grams}g
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Protein
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {item.carbs_grams}g
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Carbs
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {item.fat_grams}g
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Fat
          </Text>
        </View>
      </View>
      
      <View style={styles.planFooter}>
        <Text style={[styles.planGoal, { color: theme.colors.textSecondary }]}>
          Goal: {item.goal?.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={[styles.planDate, { color: theme.colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍎</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Nutrition Plans
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
        Generate your first AI-powered nutrition plan to get started
      </Text>
      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
        onPress={generateNewPlan}
      >
        <Text style={[styles.generateButtonText, { color: theme.colors.onPrimary }]}>
          Generate AI Plan
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading nutrition plans...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Nutrition
        </Text>
        
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
          onPress={generateNewPlan}
        >
          <Text style={[styles.generateButtonText, { color: theme.colors.onPrimary }]}>
            + Generate Plan
          </Text>
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  generateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  aiText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planGoal: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  planDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default NutritionScreen;