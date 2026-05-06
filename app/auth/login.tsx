import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react-native';
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
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const email = await AsyncStorage.getItem('savedEmail');
        setSavedEmail(email || '');
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    // Animate on mount
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    loadSavedCredentials();
  }, [scaleAnim, opacityAnim]);

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
        <View className="flex-1 px-6 py-3 justify-between">
          {/* HEADER */}
          <TouchableOpacity onPress={() => router.back()} className="mb-3">
            <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
          </TouchableOpacity>

          {/* FORM SECTION */}
          <View className="flex-1 justify-center">
          {/* CENTERED WELCOME SECTION */}
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
            className="items-center mb-5"
          >
            <View className="bg-primary/10 rounded-2xl p-3 mb-3">
              <LogIn color="#4F46E5" size={28} />
            </View>
            <Text className={`text-3xl font-inter-bold text-center ${isDarkMode ? 'text-white' : 'text-primary'}`}>
              Welcome Back
            </Text>
            <Text
              className={`font-inter text-xs mt-2 text-center px-2 leading-4 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
            >
              Sign in to continue your cleaning journey
            </Text>
          </Animated.View>

            <View
              className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-primary/10'} shadow-md`}
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
                      className={`font-inter-bold mb-1.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                    >
                      Email Address
                    </Text>
                    <View
                      className={`flex-row items-center rounded-lg px-3 mb-1 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-primary/20'}`}
                    >
                      <Mail
                        color={isDarkMode ? '#9CA3AF' : '#4F46E5'}
                        size={16}
                      />
                      <TextInput
                        className={`flex-1 px-2 py-3 font-inter text-sm ${isDarkMode ? 'text-white' : 'text-text'}`}
                        placeholder="your@email.com"
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                      />
                    </View>
                    {touched.email && errors.email ? (
                      <Text className="text-red-500 text-[10px] mb-2 ml-1">
                        {errors.email}
                      </Text>
                    ) : (
                      <View className="mb-2" />
                    )}

                    <Text
                      className={`font-inter-bold mb-1.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                    >
                      Password
                    </Text>
                    <View
                      className={`flex-row items-center rounded-lg px-3 mb-1 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-primary/20'}`}
                    >
                      <Lock
                        color={isDarkMode ? '#9CA3AF' : '#4F46E5'}
                        size={16}
                      />
                      <TextInput
                        className={`flex-1 px-2 py-3 font-inter text-sm ${isDarkMode ? 'text-white' : 'text-text'}`}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
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
                            size={16}
                          />
                        ) : (
                          <Eye
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            size={16}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password ? (
                      <Text className="text-red-500 text-[10px] mb-2 ml-1">
                        {errors.password}
                      </Text>
                    ) : (
                      <View className="mb-2" />
                    )}

                    <View className="flex-row items-center justify-end mb-3">
                      <TouchableOpacity
                        onPress={() => router.push('/auth/forgot-password')}
                      >
                        <Text className="font-inter-bold text-primary text-xs">
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={loading}
                      activeOpacity={0.8}
                      className={`rounded-lg py-3.5 flex-row items-center justify-center ${loading ? 'bg-primary/70' : 'bg-primary'} shadow-md`}
                    >
                      <Text className="text-white text-center font-inter-bold text-sm mr-2">
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Text>
                      {!loading && <LogIn color="white" size={16} />}
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-center mt-4">
                      <Text
                        className={`font-inter text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
                      >
                        New to CleanEx?
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push('/auth/register')}
                        activeOpacity={0.7}
                      >
                        <Text className="font-inter-bold text-primary text-xs ml-1">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
