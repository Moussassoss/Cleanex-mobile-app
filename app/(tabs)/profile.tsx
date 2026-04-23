import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Mail, Phone, MapPin, LogOut, CreditCard as Edit3, Save, ChevronDown, ChevronUp, Info, CircleHelp as HelpCircle } from 'lucide-react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import { API_CONFIG } from '@/config/config';
import BrandedThemeToggle from '@/components/BrandedThemeToggle';

export default function ProfileScreen() {
  const { showToast } = useToast();
  const { user, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [showUserInfo, setShowUserInfo] = useState(false);

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowUserInfo(!showUserInfo);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user]);

  useEffect(() => {
    if (user) {
      setEditedUser({
        ...user.user_metadata,
        email: user.email,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const updates = {
        full_name: editedUser.full_name,
        phone_number: editedUser.phone_number,
        address: editedUser.address,
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text(); // get error message from backend
        console.error('Failed to update profile:', response.status, errorText);
        throw new Error(
          `Failed to update profile: ${response.status} - ${errorText}`,
        );
      }

      const updatedUser = await response.json();
      setEditedUser({ ...editedUser, ...updatedUser });
      setIsEditing(false);
      showToast({
        message: 'Profile Updated Successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      showToast({
        message: 'Failed to update profile',
        type: 'error',
      });
    }
    // After your profile update request succeeds, also update Supabase user metadata:
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: editedUser.full_name,
        phone_number: editedUser.phone_number,
        address: editedUser.address,
      },
    });

    if (error) {
      console.error('Failed to update supabase user metadata:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Show success toast after logout
            showToast({
              message: 'Logged out successfully',
              type: 'success',
              duration: 3000, // 3 seconds
            });
          } catch (error) {
            // Show error toast if logout fails
            showToast({
              message: 'Logout failed. Please try again.',
              type: 'error',
              duration: 3000,
            });
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? You will need to verify your password to proceed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            router.push('/screens/DeleteAccountConfirmation');
          },
        },
      ],
    );
  };
  if (loading || !editedUser) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-text-secondary font-inter">Loading user...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
    >
      <View className="flex-1">
        {/* Modern Header */}
        <View
          className={`px-6 pt-4 pb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className={`text-3xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Profile
              </Text>
              <Text
                className={`text-sm font-inter mt-1 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
              >
                Manage your account settings
              </Text>
            </View>
            {isEditing ? (
              <TouchableOpacity
                onPress={handleSave}
                className="bg-primary rounded-2xl px-4 py-3 active:scale-95"
                style={{
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center">
                  <Save color="#FFFFFF" size={18} />
                  <Text className="text-white font-inter-bold ml-2">Save</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-primary rounded-2xl px-4 py-3 active:scale-95"
                style={{
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center">
                  <Edit3 color="#FFFFFF" size={18} />
                  <Text className="text-white font-inter-bold ml-2">Edit</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* 🌙 Dark Mode Toggle */}
          <View
            className={`flex-row items-center justify-between mb-8 px-3 py-5 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center space-x-4">
              <View className="bg-primary/10 rounded-full p-3">
                <User color="#4F46E5" size={24} />
              </View>
              <View>
                <Text
                  className={`font-inter-bold text-lg ml-2 ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  Dark Mode
                </Text>
                <Text
                  className={`font-inter text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
                >
                  Switch between light and dark theme
                </Text>
              </View>
            </View>
            <BrandedThemeToggle
              isDarkMode={isDarkMode}
              onToggle={toggleDarkMode}
            />
          </View>

          {/* Profile Picture */}
          <View className="items-center mb-8">
            <View className="mb-6">
              <View
                className={`w-32 h-32 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'}`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 16,
                }}
              >
                <User color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={48} />
              </View>
            </View>
            <Text
              className={`text-2xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
            >
              {editedUser.full_name || editedUser.name || 'Student'}
            </Text>
            <Text
              className={`font-inter text-lg ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
            >
              CleanEx User
            </Text>
            <View className="bg-green-100 px-4 py-2 rounded-full mt-2">
              <Text className="text-green-800 font-inter-bold text-sm">
                Active Member
              </Text>
            </View>
          </View>

          {/* Collapsible Menu: Your Info */}
          <TouchableOpacity
            onPress={toggleSection}
            className={`flex-row justify-between items-center px-6 py-5 mb-4 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-full p-3 mr-4">
                <User color="#4F46E5" size={20} />
              </View>
              <Text
                className={`font-inter-bold text-lg ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Your Information
              </Text>
            </View>
            {showUserInfo ? (
              <ChevronUp color={isDarkMode ? '#FFFFFF' : '#4F46E5'} />
            ) : (
              <ChevronDown color={isDarkMode ? '#FFFFFF' : '#4F46E5'} />
            )}
          </TouchableOpacity>

          {showUserInfo && (
            <View
              className={`space-y-6 px-6 pb-6 mb-6 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {[
                { label: 'Full Name', icon: User, field: 'full_name' },
                { label: 'Email', icon: Mail, field: 'email', readonly: true },
                { label: 'Phone', icon: Phone, field: 'phone_number' },
                { label: 'Address', icon: MapPin, field: 'address' },
              ].map(({ label, icon: Icon, field, readonly }) => (
                <View key={field} className="flex-row items-center py-2">
                  <View
                    className={`rounded-2xl p-3 mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'}`}
                  >
                    <Icon
                      color={isDarkMode ? '#FFFFFF' : '#4F46E5'}
                      size={20}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-inter-bold text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                    >
                      {label}
                    </Text>
                    {isEditing && !readonly ? (
                      <TextInput
                        value={editedUser[field] || ''}
                        onChangeText={(text) =>
                          setEditedUser({ ...editedUser, [field]: text })
                        }
                        placeholderTextColor="#9CA3AF"
                        className={`font-inter text-lg border-b-2 pb-2 ${isDarkMode ? 'text-white border-gray-600' : 'text-text border-primary/30'}`}
                      />
                    ) : (
                      <Text
                        className={`font-inter text-lg ${isDarkMode ? 'text-white' : 'text-text'}`}
                      >
                        {editedUser[field] || (readonly ? 'Not set' : '')}
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              {/* Delete Account Button */}
              <TouchableOpacity
                onPress={handleDeleteAccount}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mt-4 active:scale-95"
              >
                <View className="flex-row items-center justify-center">
                  <Trash2 color="#EF4444" size={20} />
                  <Text className="text-red-500 font-inter-bold ml-2">
                    Delete Account
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* About Us Section */}
          <TouchableOpacity
            onPress={() => router.push('/screens/AboutUs')}
            className={`flex-row items-center justify-between px-6 py-5 mb-4 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-100 rounded-full p-3 mr-4">
                <Info color="#3B82F6" size={20} />
              </View>
              <Text
                className={`font-inter-bold text-lg ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                About Us
              </Text>
            </View>
            <ChevronDown color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>

          {/* Support / Feedback Section */}
          <TouchableOpacity
            onPress={() => router.push('/screens/SupportFeedback')}
            className={`flex-row items-center justify-between px-6 py-5 mb-8 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-green-100 rounded-full p-3 mr-4">
                <HelpCircle color="#10B981" size={20} />
              </View>
              <Text
                className={`font-inter-bold text-lg ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Support & Feedback
              </Text>
            </View>
            <ChevronDown color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-3xl py-5 flex-row items-center justify-center active:scale-95"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <LogOut color="#FFFFFF" size={22} />
            <Text className="text-white font-inter-bold text-lg ml-3">
              Logout
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
