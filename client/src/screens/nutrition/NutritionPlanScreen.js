import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const NutritionPlanScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { plan } = route.params;
  const [selectedDay, setSelectedDay] = useState(0);

  const handleGenerateNew = () => {
    Alert.alert(
      'Generate New Plan',
      'This will create a new AI-generated nutrition plan. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            // Navigate back to nutrition screen to generate new plan
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderDaySelector = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.daySelector}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              {
                backgroundColor: selectedDay === index 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: selectedDay === index 
                    ? theme.colors.onPrimary 
                    : theme.colors.text,
                },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMeal = (meal, mealName) => {
    if (!meal) return null;

    return (
      <View style={[styles.mealCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.mealHeader}>
          <Text style={[styles.mealName, { color: theme.colors.text }]}>
            {mealName}
          </Text>
          <Text style={[styles.mealCalories, { color: theme.colors.primary }]}>
            {meal.nutrition?.calories || '--'} cal
          </Text>
        </View>
        
        <Text style={[styles.mealTitle, { color: theme.colors.text }]}>
          {meal.name}
        </Text>
        
        {meal.ingredients && meal.ingredients.length > 0 && (
          <View style={styles.ingredientsContainer}>
            <Text style={[styles.ingredientsTitle, { color: theme.colors.textSecondary }]}>
              Ingredients:
            </Text>
            {meal.ingredients.map((ingredient, index) => (
              <Text key={index} style={[styles.ingredient, { color: theme.colors.text }]}>
                • {ingredient}
              </Text>
            ))}
          </View>
        )}
        
        {meal.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={[styles.instructionsTitle, { color: theme.colors.textSecondary }]}>
              Instructions:
            </Text>
            <Text style={[styles.instructions, { color: theme.colors.text }]}>
              {meal.instructions}
            </Text>
          </View>
        )}
        
        {meal.nutrition && (
          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.textSecondary }]}>
                Protein
              </Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
                {meal.nutrition.protein || '--'}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.textSecondary }]}>
                Carbs
              </Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
                {meal.nutrition.carbs || '--'}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.textSecondary }]}>
                Fat
              </Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>
                {meal.nutrition.fat || '--'}g
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDailyPlan = () => {
    const weeklyPlan = plan.meals || [];
    const dailyPlan = weeklyPlan[selectedDay] || weeklyPlan[0] || { meals: {} };
    const meals = dailyPlan.meals || {};

    return (
      <View style={styles.dailyPlan}>
        {renderMeal(meals.breakfast, 'Breakfast')}
        {renderMeal(meals.lunch, 'Lunch')}
        {renderMeal(meals.dinner, 'Dinner')}
        
        {meals.snacks && meals.snacks.map((snack, index) => (
          <View key={index}>
            {renderMeal(snack, `Snack ${index + 1}`)}
          </View>
        ))}
      </View>
    );
  };

  const renderPlanSummary = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
        Daily Summary
      </Text>
      
      <View style={styles.summaryStats}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
            {plan.calories_per_day}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Calories
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            {plan.protein_grams}g
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Protein
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
            {plan.carbs_grams}g
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Carbs
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
            {plan.fat_grams}g
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Fat
          </Text>
        </View>
      </View>
      
      <View style={styles.goalInfo}>
        <Text style={[styles.goalLabel, { color: theme.colors.textSecondary }]}>
          Goal: {plan.goal?.replace('_', ' ').toUpperCase()}
        </Text>
        {plan.is_ai_generated && (
          <View style={[styles.aiBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.aiText, { color: theme.colors.onPrimary }]}>
              AI Generated
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {plan.title}
        </Text>
        
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleGenerateNew}
        >
          <Text style={[styles.generateButtonText, { color: theme.colors.onPrimary }]}>
            Generate New
          </Text>
        </TouchableOpacity>
      </View>

      {renderPlanSummary()}
      {renderDaySelector()}
      {renderDailyPlan()}
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
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
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
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    textTransform: 'capitalize',
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
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dailyPlan: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mealCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 14,
    marginBottom: 2,
  },
  instructionsContainer: {
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NutritionPlanScreen;