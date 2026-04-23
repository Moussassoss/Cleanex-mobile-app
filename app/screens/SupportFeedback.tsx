import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  Send,
  Star,
  Sparkles,
  Heart,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ToastProvider';
import { Formik } from 'formik';
import * as yup from 'yup';
import { supabase } from '@/lib/supabase';
import { API_CONFIG } from '@/config/config';

const feedbackSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup
    .string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

export default function SupportFeedbackScreen() {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async (values: any, { resetForm }: any) => {
    setLoading(true);

    try {
      // Get the current user session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        showToast({
          message: 'You must be logged in to send feedback.',
          type: 'error',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      // Send feedback to backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/support/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message, // Ensure this is included
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast({
          message: 'Thank you! Your message has been sent successfully.',
          type: 'success',
          duration: 4000,
        });
        resetForm();
      } else {
        showToast({
          message:
            result.error ||
            result.message ||
            'Failed to send message. Please try again.',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error sending feedback:', error);

      showToast({
        message: 'Network error. Please check your connection and try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open link:', error);
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
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        >
          {/* Header */}
          <View
            className={`px-6 pt-6 pb-8 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 active:scale-95"
            >
              <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
            </TouchableOpacity>

            <View className="items-center">
              <View
                className={`rounded-full p-4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'}`}
              >
                <MessageCircle
                  color={isDarkMode ? '#FFFFFF' : '#4F46E5'}
                  size={32}
                />
              </View>
              <Text
                className={`text-3xl font-inter-bold tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Support & Feedback
              </Text>
              <Text
                className={`text-base font-inter text-center leading-6 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
              >
                We're here to help and would love to hear from you
              </Text>
            </View>
          </View>

          <View className="px-6">
            {/* Description Section */}
            <View
              className={`rounded-3xl p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-primary/10 rounded-full p-3 mr-4">
                  <Heart color="#4F46E5" size={24} />
                </View>
                <Text
                  className={`text-xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  We Value Your Voice
                </Text>
              </View>
              <Text
                className={`font-inter leading-7 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
              >
                Your feedback helps us improve our services and provide you with
                the best cleaning experience possible. Whether you have a
                question, suggestion, or need assistance, we're here to listen
                and help.
              </Text>

              <View className="flex-row items-center">
                <Clock color={isDarkMode ? '#9CA3AF' : '#6B7280'} size={16} />
                <Text
                  className={`font-inter ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
                >
                  We typically respond within 24 hours
                </Text>
              </View>
            </View>

            {/* Contact Methods */}
            <View
              className={`rounded-3xl p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text
                className={`text-xl font-inter-bold mb-6 ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Get in Touch
              </Text>

              <TouchableOpacity
                onPress={() => openLink('mailto:cleanex.chadnova@gmail.com')}
                className={`flex-row items-center p-4 rounded-2xl mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <View className="bg-blue-100 rounded-full p-3 mr-4">
                  <Mail color="#3B82F6" size={20} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                  >
                    Email Support
                  </Text>
                  <Text
                    className={`font-inter text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
                  >
                    cleanex.chadnova@gmail.com
                  </Text>
                </View>
                <ExternalLink
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  size={16}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openLink('tel:+250796582447')}
                className={`flex-row items-center p-4 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <View className="bg-green-100 rounded-full p-3 mr-4">
                  <Phone color="#10B981" size={20} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                  >
                    Phone Support
                  </Text>
                  <Text
                    className={`font-inter text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
                  >
                    +250 796 582 447
                  </Text>
                </View>
                <ExternalLink
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  size={16}
                />
              </TouchableOpacity>
            </View>

            {/* Feedback Form */}
            <View
              className={`rounded-3xl p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center mb-6">
                <View className="bg-purple-100 rounded-full p-3 mr-4">
                  <Send color="#8B5CF6" size={24} />
                </View>
                <Text
                  className={`text-xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  Send us a Message
                </Text>
              </View>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  subject: '',
                  message: '',
                }}
                validationSchema={feedbackSchema}
                onSubmit={handleSubmitFeedback}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View className="space-y-4">
                    <View>
                      <Text
                        className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                      >
                        Your Name
                      </Text>
                      <TextInput
                        className={`rounded-xl px-4 py-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white border border-gray-600' : 'bg-gray-50 text-text border border-gray-200'}`}
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        placeholder="Enter your full name"
                        placeholderTextColor={
                          isDarkMode ? '#9CA3AF' : '#6B7280'
                        }
                      />
                      {touched.name && errors.name && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {errors.name}
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text
                        className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                      >
                        Email Address
                      </Text>
                      <TextInput
                        className={`rounded-xl px-4 py-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white border border-gray-600' : 'bg-gray-50 text-text border border-gray-200'}`}
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={
                          isDarkMode ? '#9CA3AF' : '#6B7280'
                        }
                      />
                      {touched.email && errors.email && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {errors.email}
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text
                        className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                      >
                        Subject
                      </Text>
                      <TextInput
                        className={`rounded-xl px-4 py-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white border border-gray-600' : 'bg-gray-50 text-text border border-gray-200'}`}
                        value={values.subject}
                        onChangeText={handleChange('subject')}
                        onBlur={handleBlur('subject')}
                        placeholder="What's this about?"
                        placeholderTextColor={
                          isDarkMode ? '#9CA3AF' : '#6B7280'
                        }
                      />
                      {touched.subject && errors.subject && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {errors.subject}
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text
                        className={`font-inter-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                      >
                        Message
                      </Text>
                      <TextInput
                        className={`rounded-xl px-4 py-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white border border-gray-600' : 'bg-gray-50 text-text border border-gray-200'}`}
                        value={values.message}
                        onChangeText={handleChange('message')}
                        onBlur={handleBlur('message')}
                        placeholder="Tell us how we can help you..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholderTextColor={
                          isDarkMode ? '#9CA3AF' : '#6B7280'
                        }
                        style={{ minHeight: 120 }}
                      />
                      {touched.message && errors.message && (
                        <Text className="text-red-500 text-sm mt-1 ml-2">
                          {errors.message}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={loading}
                      className="bg-primary rounded-xl py-4 shadow-lg active:scale-95 mt-6"
                      style={{
                        shadowColor: '#4F46E5',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                    >
                      <View className="flex-row items-center justify-center">
                        <Send color="#FFFFFF" size={20} />
                        <Text className="text-white font-inter-bold text-lg ml-2">
                          {loading ? 'Sending...' : 'Send Message'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}