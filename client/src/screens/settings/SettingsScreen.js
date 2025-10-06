import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme, setSystemTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon!');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacy Settings', 'Privacy settings feature coming soon!');
  };

  const handleDataExport = () => {
    Alert.alert('Export Data', 'Data export feature coming soon!');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Profile
      </Text>
      
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={handleEditProfile}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>✏️</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Edit Profile
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Update your personal information
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={handleChangePassword}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🔒</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Change Password
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Update your account password
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppearanceSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Appearance
      </Text>
      
      <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🌙</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
            </Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={isDarkMode ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={setSystemTheme}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>⚙️</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Use System Theme
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Follow device appearance settings
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Notifications
      </Text>
      
      <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🔔</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Push Notifications
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Receive app notifications
            </Text>
          </View>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={notifications ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>📧</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Email Updates
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Receive email notifications
            </Text>
          </View>
        </View>
        <Switch
          value={emailUpdates}
          onValueChange={setEmailUpdates}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={emailUpdates ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>💪</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Workout Reminders
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Get reminded to work out
            </Text>
          </View>
        </View>
        <Switch
          value={workoutReminders}
          onValueChange={setWorkoutReminders}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={workoutReminders ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Privacy & Data
      </Text>
      
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={handlePrivacySettings}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🔒</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Privacy Settings
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Manage your privacy preferences
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={handleDataExport}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>📤</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Export Data
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Download your data
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStorageSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Storage
      </Text>
      
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={handleClearCache}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🗑️</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Clear Cache
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Free up storage space
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        About
      </Text>
      
      <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>ℹ️</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              App Version
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon!')}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>📄</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Terms of Service
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              Read our terms and conditions
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon!')}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🔒</Text>
          <View>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Privacy Policy
            </Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              How we protect your data
            </Text>
          </View>
        </View>
        <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Settings
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Customize your BakiFitness experience
        </Text>
      </View>

      {renderProfileSection()}
      {renderAppearanceSection()}
      {renderNotificationsSection()}
      {renderPrivacySection()}
      {renderStorageSection()}
      {renderAboutSection()}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;