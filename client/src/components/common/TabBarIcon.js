import React from 'react';
import { Text } from 'react-native';

const TabBarIcon = ({ routeName, focused, color, size }) => {
  const getIcon = () => {
    switch (routeName) {
      case 'Home':
        return focused ? '🏠' : '🏡';
      case 'Workouts':
        return focused ? '💪' : '🏃‍♂️';
      case 'Nutrition':
        return focused ? '🍎' : '🥗';
      case 'Progress':
        return focused ? '📊' : '📈';
      case 'Profile':
        return focused ? '👤' : '👥';
      default:
        return '❓';
    }
  };

  return (
    <Text style={{ fontSize: size || 24, color }}>
      {getIcon()}
    </Text>
  );
};

export default TabBarIcon;