import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Mail, KeyRound, Lock, Shield, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react-native';
import { useToast } from '@/components/ToastProvider';
import { API_CONFIG } from '@/config/config';

type Step = 'email' | 'otp' | 'password' | 'success';

const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function ForgotPasswordScreen() {
  const { showToast } = useToast();

  const handleOtpPaste = (pastedText: string, index: number) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];

    // Fill the OTP array with pasted digits
    for (let i = 0; i < digits.length && i < 6; i++) {
      newOtp[i] = digits[i];
    }

    setOtp(newOtp);

    // Focus the last filled input or the next empty one
    const lastIndex = Math.min(digits.length - 1, 5);
    setTimeout(() => {
      if (digits.length === 6) {
        // If all 6 digits are filled, blur the current input
        otpInputs.current[index]?.blur();
      } else {
        otpInputs.current[lastIndex]?.focus();
      }
    }, 100);
  };
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const startTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    // Handle pasted content (multiple characters)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = ['', '', '', '', '', ''];

      // Fill the OTP array with pasted digits
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }

      setOtp(newOtp);

      // Focus the last filled input
      const lastIndex = Math.min(digits.length - 1, 5);
      setTimeout(() => {
        otpInputs.current[lastIndex]?.focus();
      }, 100);
      return;
    }

    // Handle single character input
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only allow digits
    setOtp(newOtp);

    // Auto-focus next input if value exists and not last input
    if (value && index < 5) {
      setTimeout(() => {
        otpInputs.current[index + 1]?.focus();
      }, 10);
    }

    // Auto-focus previous input on backspace/delete if empty
    if (!value && index > 0) {
      setTimeout(() => {
        otpInputs.current[index - 1]?.focus();
      }, 10);
    }
  };

  const handleSendOtp = async (values: { email: string }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setUserEmail(values.email);
        setCurrentStep('otp');
        startTimer();
        showToast({
          message: 'Verification code sent to your email',
          type: 'success',
          duration: 3000,
        });
      } else {
        showToast({
          message: data.error || data.message || 'Failed to send OTP',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsResendingOtp(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/resend-forgot-password-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast({
          message: 'OTP resent successfully',
          type: 'success',
          duration: 3000,
        });
        startTimer();
      } else {
        showToast({
          message: data.message || 'Failed to resend OTP',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error',
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast({
        message: 'Please enter the complete verification code',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/verify-forgot-password-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            otp: otpCode,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast({
          message: 'OTP verified successfully',
          type: 'success',
          duration: 3000,
        });
        setCurrentStep('password');
      } else {
        showToast({
          message: data.message || 'Invalid OTP. Please try again.',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            password: values.password,
            confirmPassword: values.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast({
          message: 'Password reset successfully!',
          type: 'success',
          duration: 3000,
        });

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      } else {
        showToast({
          message: data.message || 'Failed to reset password',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['email', 'otp', 'password', 'success'].map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              currentStep === step && styles.activeStep,
              ['otp', 'password', 'success'].includes(currentStep) &&
                index === 0 &&
                styles.completedStep,
              ['password', 'success'].includes(currentStep) &&
                index === 1 &&
                styles.completedStep,
              currentStep === 'success' && index === 2 && styles.completedStep,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                (currentStep === step ||
                  (['otp', 'password', 'success'].includes(currentStep) &&
                    index === 0) ||
                  (['password', 'success'].includes(currentStep) &&
                    index === 1) ||
                  (currentStep === 'success' && index === 2)) &&
                  styles.activeStepText,
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < 3 && (
            <View
              style={[
                styles.stepLine,
                (['otp', 'password', 'success'].includes(currentStep) &&
                  index === 0) ||
                (['password', 'success'].includes(currentStep) &&
                  index === 1) ||
                (currentStep === 'success' && index === 2)
                  ? styles.completedLine
                  : {},
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderEmailStep = () => (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={emailSchema}
      onSubmit={handleSendOtp}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.stepContent}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <KeyRound size={32} color="#6366f1" />
            </View>
            <Text style={styles.stepTitle}>Reset Your Password</Text>
            <Text style={styles.stepSubtitle}>
              Enter your email to receive a verification code
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              <View style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Mail size={32} color="#6366f1" />
        </View>
        <Text style={styles.stepTitle}>Verify Your Email</Text>
        <Text style={styles.stepSubtitle}>
          Enter the 6-digit code sent to {userEmail}
        </Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              otpInputs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            onSubmitEditing={() => {
              if (index === 5) {
                handleVerifyOtp();
              }
            }}
            blurOnSubmit={index === 5}
            returnKeyType={index === 5 ? 'done' : 'next'}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={handleVerifyOtp}
        disabled={loading || otp.join('').length !== 6}
      >
        <View style={styles.buttonGradient}>
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleResendOtp}
        disabled={resendTimer > 0 || isResendingOtp}
      >
        <Text style={styles.secondaryButtonText}>
          {isResendingOtp
            ? 'Sending...'
            : resendTimer > 0
              ? `Resend in ${resendTimer}s`
              : 'Resend Code'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <Formik
      initialValues={{
        password: '',
        confirmPassword: '',
      }}
      validationSchema={passwordSchema}
      onSubmit={handleResetPassword}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.stepContent}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Lock size={32} color="#6366f1" />
            </View>
            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepSubtitle}>
              Enter a new secure password for your account
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
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
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Shield size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              <View style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );

  const renderSuccessStep = () => (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.heroSection}>
        <View style={[styles.iconContainer, styles.successIcon]}>
          <Check size={32} color="#10b981" />
        </View>
        <Text style={styles.stepTitle}>Password Reset!</Text>
        <Text style={styles.stepSubtitle}>
          Your password has been updated successfully
        </Text>
      </View>

      <View style={styles.celebrationContainer}>
        <Text style={styles.welcomeText}>
          You'll be redirected to login shortly...
        </Text>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'otp':
        return renderOtpStep();
      case 'password':
        return renderPasswordStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (currentStep === 'otp') setCurrentStep('email');
                  else if (currentStep === 'password') setCurrentStep('otp');
                  else router.back();
                }}
              >
                <ArrowLeft color="#4F46E5" size={24} />
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.title}>Reset Password</Text>
                {renderStepIndicator()}
              </View>

              <View style={styles.content}>{renderCurrentStep()}</View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}

// Reuse the same styles from your register screen
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#4F46E5',
  },
  completedStep: {
    backgroundColor: '#4F46E5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeStepText: {
    color: '#ffffff',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#4F46E5',
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: '#f0fdf4',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  celebrationContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  welcomeText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 28,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});