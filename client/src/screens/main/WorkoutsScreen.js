import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { workoutAPI } from '../../services/api';

const WorkoutsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', emoji: '🏋️' },
    { id: 'strength', name: 'Strength', emoji: '💪' },
    { id: 'cardio', name: 'Cardio', emoji: '🏃‍♂️' },
    { id: 'yoga', name: 'Yoga', emoji: '🧘‍♀️' },
    { id: 'hiit', name: 'HIIT', emoji: '⚡' },
    { id: 'flexibility', name: 'Flexibility', emoji: '🤸‍♀️' },
  ];

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, searchQuery, selectedCategory]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutAPI.getWorkouts({ limit: 50 });
      setWorkouts(response.data.workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const filterWorkouts = () => {
    let filtered = workouts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(workout => workout.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(workout =>
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredWorkouts(filtered);
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoriesContainer}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === item.id 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === item.id 
                    ? theme.colors.onPrimary 
                    : theme.colors.text,
                },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoriesContent}
      />
    </View>
  );

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
    >
      <View style={[styles.workoutImage, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.workoutEmoji}>
          {item.category === 'strength' ? '💪' :
           item.category === 'cardio' ? '🏃‍♂️' :
           item.category === 'yoga' ? '🧘‍♀️' :
           item.category === 'hiit' ? '⚡' :
           item.category === 'flexibility' ? '🤸‍♀️' : '🏋️'}
        </Text>
      </View>
      
      <View style={styles.workoutInfo}>
        <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.workoutDescription, { color: theme.colors.textSecondary }]}>
          {item.description || 'Great workout for your fitness journey'}
        </Text>
        
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
              Duration
            </Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {item.duration_minutes} min
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
              Difficulty
            </Text>
            <Text style={[styles.metaValue, { color: theme.colors.text }]}>
              {item.difficulty}
            </Text>
          </View>
          
          {item.calories_burned && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Calories
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {item.calories_burned}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.workoutFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
              {item.rating?.toFixed(1) || '4.5'}
            </Text>
          </View>
          
          {item.is_premium && (
            <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning }]}>
              <Text style={[styles.premiumText, { color: theme.colors.onPrimary }]}>
                PREMIUM
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading workouts...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Workouts
        </Text>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search workouts..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={filteredWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutEmoji: {
    fontSize: 32,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    marginRight: 16,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default WorkoutsScreen;