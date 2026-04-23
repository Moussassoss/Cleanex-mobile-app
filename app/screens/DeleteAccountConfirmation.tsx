import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Heart,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import { useToast } from '@/components/ToastProvider';
import { supabase } from '@/lib/supabase';
import { API_CONFIG } from '@/config/config';

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required to delete your account'),
});

export default function DeleteAccountConfirmation() {
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async (values: { password: string }) => {
    setLoading(true);

    try {
      // First verify the password by attempting to sign in
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;

      if (!currentUser) {
        showToast({
          message: 'You must be logged in to delete your account.',
          type: 'error',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email!,
        password: values.password,
      });

      if (signInError) {
        showToast({
          message: 'Incorrect password. Please try again.',
          type: 'error',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      // If password is correct, proceed with account deletion
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/users/${currentUser.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      showToast({
        message: "Account deleted successfully. We're sorry to see you go!",
        type: 'success',
        duration: 4000,
      });

      router.replace('/auth/login');
    } catch (error) {
      console.error('Delete account error:', error);
      showToast({
        message: 'Failed to delete account. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft color="#4F46E5" size={24} />
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.title}>We're Sorry to See You Go</Text>
              </View>

              <View style={styles.stepContent}>
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <Heart size={32} color="#ef4444" />
                  </View>
                  <Text style={styles.stepTitle}>Before You Leave...</Text>
                  <Text style={styles.stepSubtitle}>
                    We'd love to keep you! Is there anything we can do to
                    improve your experience?
                  </Text>
                </View>

                {/* Encouragement Section */}
                <View style={styles.encouragementSection}>
                  <View style={styles.encouragementItem}>
                    <Text style={styles.encouragementEmoji}>🌟</Text>
                    <Text style={styles.encouragementText}>
                      We're constantly improving our services based on your
                      feedback
                    </Text>
                  </View>
                  <View style={styles.encouragementItem}>
                    <Text style={styles.encouragementEmoji}>💬</Text>
                    <Text style={styles.encouragementText}>
                      Our support team is here to help with any issues you might
                      have
                    </Text>
                  </View>
                  <View style={styles.encouragementItem}>
                    <Text style={styles.encouragementEmoji}>🎯</Text>
                    <Text style={styles.encouragementText}>
                      You'll lose access to all your order history and
                      preferences
                    </Text>
                  </View>
                </View>

                {/* Warning Section */}
                <View style={styles.warningSection}>
                  <View style={styles.warningHeader}>
                    <AlertTriangle size={20} color="#ef4444" />
                    <Text style={styles.warningTitle}>
                      This action cannot be undone
                    </Text>
                  </View>
                  <Text style={styles.warningText}>
                    All your data, order history, and account information will
                    be permanently deleted.
                  </Text>
                </View>

                <Formik
                  initialValues={{ password: '' }}
                  validationSchema={passwordSchema}
                  onSubmit={handleDeleteAccount}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <View style={styles.formContainer}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                          Confirm Your Password
                        </Text>
                        <View style={styles.inputWrapper}>
                          <Lock
                            size={20}
                            color="#6b7280"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Enter your password to confirm"
                            placeholderTextColor="#9ca3af"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            secureTextEntry={!showPassword}
                          />
                          <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={20} color="#6b7280" />
                            ) : (
                              <Eye size={20} color="#6b7280" />
                            )}
                          </TouchableOpacity>
                        </View>
                        {touched.password && errors.password && (
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        )}
                      </View>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => router.back()}
                        >
                          <Text style={styles.cancelButtonText}>
                            Keep My Account
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            loading && styles.disabledButton,
                          ]}
                          onPress={() => handleSubmit()}
                          disabled={loading}
                        >
                          <View style={styles.buttonGradient}>
                            <Text style={styles.deleteButtonText}>
                              {loading ? 'Deleting...' : 'Delete My Account'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Formik>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  encouragementSection: {
    marginBottom: 24,
  },
  encouragementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  encouragementEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  encouragementText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
    lineHeight: 20,
  },
  eyeIcon: {
    padding: 4,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});