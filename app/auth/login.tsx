import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '@/components/ToastProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const email = await AsyncStorage.getItem('savedEmail');
        setSavedEmail(email || '');
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        showToast({
          message: 'Login credentials are incorrect',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      // Keep the email for convenience while session persistence is handled by Supabase.
      await AsyncStorage.setItem('savedEmail', values.email);

      showToast({
        message: 'Logged in successfully!',
        type: 'success',
        duration: 3000,
      });

      router.replace('/(tabs)/home');
    } catch (err) {
      showToast({
        message: 'Login failed. Please try again.',
        type: 'error',
        duration: 3000,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} className="mt-1 mb-6">
            <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
          </TouchableOpacity>

          <View className="mb-8">
            <Text
              className={`text-3xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
            >
              Welcome Back
            </Text>
            <Text
              className={`font-inter mt-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
            >
              Sign in to continue booking your services.
            </Text>
          </View>

          <View
            className={`rounded-2xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
          >
            <Formik
              initialValues={{ email: savedEmail, password: '' }}
              enableReinitialize
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  <Text
                    className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                  >
                    Email
                  </Text>
                  <View
                    className={`flex-row items-center rounded-xl px-3 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <Mail
                      color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      size={18}
                    />
                    <TextInput
                      className={`flex-1 px-3 py-3 font-inter ${isDarkMode ? 'text-white' : 'text-text'}`}
                      placeholder="Enter your email"
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                    />
                  </View>
                  {touched.email && errors.email ? (
                    <Text className="text-red-500 text-xs mb-3">
                      {errors.email}
                    </Text>
                  ) : (
                    <View className="mb-3" />
                  )}

                  <Text
                    className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                  >
                    Password
                  </Text>
                  <View
                    className={`flex-row items-center rounded-xl px-3 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <Lock
                      color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      size={18}
                    />
                    <TextInput
                      className={`flex-1 px-3 py-3 font-inter ${isDarkMode ? 'text-white' : 'text-text'}`}
                      placeholder="Enter your password"
                      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                      secureTextEntry={!showPassword}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                          size={18}
                        />
                      ) : (
                        <Eye
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                          size={18}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password ? (
                    <Text className="text-red-500 text-xs mb-3">
                      {errors.password}
                    </Text>
                  ) : (
                    <View className="mb-3" />
                  )}

                  <View className="flex-row items-center justify-end mb-4">
                    <TouchableOpacity
                      onPress={() => router.push('/auth/forgot-password')}
                    >
                      <Text className="font-inter-bold text-primary text-sm">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    className={`rounded-xl py-4 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
                  >
                    <Text className="text-white text-center font-inter-bold text-base">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-center mt-5">
                    <Text
                      className={`font-inter ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                    >
                      Don't have an account?
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/auth/register')}
                    >
                      <Text className="font-inter-bold text-primary ml-1">
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
