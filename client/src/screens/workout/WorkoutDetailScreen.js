import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { workoutAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const WorkoutDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { workout } = route.params;
  const [rating, setRating] = useState(0);
  const [isRated, setIsRated] = useState(false);

  const handleStartWorkout = () => {
    Alert.alert(
      'Start Workout',
      'This will open the workout video player. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // In a real app, you would open the video player here
            Alert.alert('Workout Started', 'Workout video player would open here');
          }
        }
      ]
    );
  };

  const handleRateWorkout = async (selectedRating) => {
    try {
      await workoutAPI.rateWorkout(workout.id, selectedRating);
      setRating(selectedRating);
      setIsRated(true);
      Alert.alert('Thank you!', 'Your rating has been submitted');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>
        Rate this workout:
      </Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRateWorkout(star)}
            disabled={isRated}
          >
            <Text style={[
              styles.star,
              { 
                color: star <= rating ? '#FFD700' : theme.colors.border,
                opacity: isRated ? 0.5 : 1
              }
            ]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getCategoryEmoji = (category) => {
    const emojis = {
      strength: '💪',
      cardio: '🏃‍♂️',
      yoga: '🧘‍♀️',
      pilates: '🤸‍♀️',
      hiit: '⚡',
      flexibility: '🤸‍♀️',
      sports: '⚽',
      dance: '💃'
    };
    return emojis[category] || '🏋️';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: theme.colors.success,
      intermediate: theme.colors.warning,
      advanced: theme.colors.error
    };
    return colors[difficulty] || theme.colors.textSecondary;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.heroSection, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.workoutImage, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.workoutEmoji}>
            {getCategoryEmoji(workout.category)}
          </Text>
        </View>
        
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>
            {workout.title}
          </Text>
          
          <Text style={[styles.workoutDescription, { color: theme.colors.textSecondary }]}>
            {workout.description || 'A great workout to help you achieve your fitness goals.'}
          </Text>
          
          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Duration
              </Text>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {workout.duration_minutes} min
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Difficulty
              </Text>
              <Text style={[
                styles.metaValue, 
                { color: getDifficultyColor(workout.difficulty) }
              ]}>
                {workout.difficulty}
              </Text>
            </View>
            
            {workout.calories_burned && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                  Calories
                </Text>
                <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                  {workout.calories_burned}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Equipment Needed
          </Text>
          <View style={styles.equipmentList}>
            {(workout.equipment_needed || ['None']).map((equipment, index) => (
              <View key={index} style={[styles.equipmentItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.equipmentText, { color: theme.colors.text }]}>
                  {equipment}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Muscle Groups
          </Text>
          <View style={styles.muscleGroups}>
            {(workout.muscle_groups || ['Full Body']).map((muscle, index) => (
              <View key={index} style={[styles.muscleItem, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.muscleText, { color: theme.colors.onPrimary }]}>
                  {muscle}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {workout.tags && workout.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {workout.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {renderRatingStars()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleStartWorkout}
        >
          <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
            Start Workout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutEmoji: {
    fontSize: 64,
  },
  workoutInfo: {
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 24,
    marginHorizontal: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  startButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutDetailScreen;