import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getStats();
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Enter your password to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: async (password) => {
                    try {
                      await userAPI.deleteAccount(password);
                      logout();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  }
                }
              ],
              'secure-text'
            );
          }
        }
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
          {user?.firstName?.charAt(0) || 'U'}
        </Text>
      </View>
      
      <Text style={[styles.userName, { color: theme.colors.text }]}>
        {user?.firstName} {user?.lastName}
      </Text>
      
      <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
        {user?.email}
      </Text>
      
      {user?.is_premium && (
        <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning }]}>
          <Text style={[styles.premiumText, { color: theme.colors.onPrimary }]}>
            PREMIUM MEMBER
          </Text>
        </View>
      )}
    </View>
  );

  const renderStats = () => {
    if (!userStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Stats
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {userStats.totalProgressEntries}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Progress Entries
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.statIcon}>🍎</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {userStats.totalNutritionPlans}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Nutrition Plans
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {userStats.totalWorkoutViews}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Workouts Viewed
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {userStats.hasActiveSubscription ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Premium Active
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMenuItems = () => {
    const menuItems = [
      {
        title: 'Edit Profile',
        icon: '✏️',
        onPress: () => navigation.navigate('Settings')
      },
      {
        title: 'Subscription',
        icon: '💳',
        onPress: () => navigation.navigate('Subscription')
      },
      {
        title: 'Notifications',
        icon: '🔔',
        onPress: () => Alert.alert('Notifications', 'Notification settings coming soon!')
      },
      {
        title: 'Privacy',
        icon: '🔒',
        onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!')
      },
      {
        title: 'Help & Support',
        icon: '❓',
        onPress: () => Alert.alert('Help', 'Help & support coming soon!')
      },
      {
        title: 'About',
        icon: 'ℹ️',
        onPress: () => Alert.alert('About', 'BakiFitness v1.0.0\nAI-Powered Fitness App')
      }
    ];

    return (
      <View style={styles.menuContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDangerZone = () => (
    <View style={styles.dangerZone}>
      <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>
        Danger Zone
      </Text>
      
      <TouchableOpacity
        style={[styles.dangerButton, { borderColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.dangerButtonText, { color: theme.colors.error }]}>
          Logout
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.dangerButton, { borderColor: theme.colors.error }]}
        onPress={handleDeleteAccount}
      >
        <Text style={[styles.dangerButtonText, { color: theme.colors.error }]}>
          Delete Account
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading profile...
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
      {renderProfileHeader()}
      {renderStats()}
      {renderMenuItems()}
      {renderDangerZone()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  premiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dangerZone: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  dangerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default ProfileScreen;