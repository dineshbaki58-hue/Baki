import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { StatusBar } from 'react-native';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import WorkoutsScreen from './src/screens/main/WorkoutsScreen';
import NutritionScreen from './src/screens/main/NutritionScreen';
import ProgressScreen from './src/screens/main/ProgressScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import WorkoutDetailScreen from './src/screens/workout/WorkoutDetailScreen';
import NutritionPlanScreen from './src/screens/nutrition/NutritionPlanScreen';
import SubscriptionScreen from './src/screens/subscription/SubscriptionScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

// Components
import TabBarIcon from './src/components/common/TabBarIcon';
import LoadingSpinner from './src/components/common/LoadingSpinner';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => (
        <TabBarIcon routeName={route.name} focused={focused} color={color} size={size} />
      ),
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Workouts" 
      component={WorkoutsScreen}
      options={{ tabBarLabel: 'Workouts' }}
    />
    <Tab.Screen 
      name="Nutrition" 
      component={NutritionScreen}
      options={{ tabBarLabel: 'Nutrition' }}
    />
    <Tab.Screen 
      name="Progress" 
      component={ProgressScreen}
      options={{ tabBarLabel: 'Progress' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="WorkoutDetail" 
      component={WorkoutDetailScreen}
      options={{ title: 'Workout Details' }}
    />
    <Stack.Screen 
      name="NutritionPlan" 
      component={NutritionPlanScreen}
      options={{ title: 'Nutrition Plan' }}
    />
    <Stack.Screen 
      name="Subscription" 
      component={SubscriptionScreen}
      options={{ title: 'Subscription' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default App;