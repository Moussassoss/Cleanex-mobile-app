import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Check, Star, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '@/components/ToastProvider';
import { API_CONFIG } from '@/config/config';
import { supabase } from '@/lib/supabase';

type Step = 'details' | 'verification' | 'password' | 'success';

const registerSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string(),
  address: yup.string(),
  agreeToTerms: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const passwordSchema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const { showToast } = useToast();

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

  const handleDetailsSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: values.fullName,
          email: values.email,
          phone_number: values.phoneNumber,
          address: values.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId || data.id);
        setFormData({
          ...formData,
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          address: values.address,
        });
        showToast({ message: 'Verification code sent to your email', type: 'success' });
        setCurrentStep('verification');
        startTimer();
      } else {
        showToast({ 
          message: data.error || data.message || 'Registration failed. Please try again.', 
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showToast({
        message: 'Please check your internet connection and try again.',
        type: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

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
        otpInputRefs.current[index]?.blur();
      } else {
        otpInputRefs.current[lastIndex]?.focus();
      }
    }, 100);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsResendingOtp(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          message: 'OTP resent successfully!',
          type: 'success',
        });
        startTimer();
      } else {
        showToast({
          message: data.message || 'Failed to resend OTP. Please try again.',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast({ message: 'Please enter the complete verification code', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          userId: userId,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast({ message: 'Email verified successfully', type: 'success' });
        setCurrentStep('password');
      } else {
        showToast({
          message: data.message || 'Invalid OTP. Please try again.',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: any) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user } = data;
        const userData = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          address: user.address
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setCurrentStep('success');

        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]).start();

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: values.password,
        });

        setTimeout(() => {
          router.replace(signInError ? '/auth/login' : '/(tabs)/home');
        }, 2000);
      } else {
        showToast({
          message: data.message || 'Registration failed. Please try again.',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      showToast({
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    // Handle single character input
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only allow digits
    setOtp(newOtp);

    // Auto-focus next input if a digit was entered
    if (value && index < 5) {
      setTimeout(() => {
        otpInputRefs.current[index + 1]?.focus();
      }, 10);
    }

    // Auto-focus previous input if backspace was pressed and current is empty
    if (!value && index > 0) {
      setTimeout(() => {
        otpInputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['details', 'verification', 'password', 'success'].map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep === step && styles.activeStep,
            ['verification', 'password', 'success'].includes(currentStep) && index === 0 && styles.completedStep,
            ['password', 'success'].includes(currentStep) && index === 1 && styles.completedStep,
            currentStep === 'success' && index === 2 && styles.completedStep,
          ]}>
            <Text style={[
              styles.stepNumber,
              (currentStep === step || 
               (['verification', 'password', 'success'].includes(currentStep) && index === 0) ||
               (['password', 'success'].includes(currentStep) && index === 1) ||
               (currentStep === 'success' && index === 2)) && styles.activeStepText
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < 3 && <View style={[
            styles.stepLine,
            (['verification', 'password', 'success'].includes(currentStep) && index === 0) ||
            (['password', 'success'].includes(currentStep) && index === 1) ||
            (currentStep === 'success' && index === 2) ? styles.completedLine : {}
          ]} />}
        </View>
      ))}
    </View>
  );

  const renderDetailsStep = () => (
    <Formik
      initialValues={{
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        agreeToTerms: false,
      }}
      validationSchema={registerSchema}
      onSubmit={handleDetailsSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue  }) => (
        <View style={styles.stepContent}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <User size={32} color="#6366f1" />
            </View>
            <Text style={styles.stepTitle}>Create Your Account</Text>
            <Text style={styles.stepSubtitle}>Tell us about yourself to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#9ca3af"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  autoCapitalize="words"
                />
              </View>
              {touched.fullName && errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
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

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#9ca3af"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  keyboardType="phone-pad"
                />
              </View>
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Address (optional)"
                  placeholderTextColor="#9ca3af"
                  value={values.address}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  multiline
                  numberOfLines={2}
                />
              </View>
              {touched.address && errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>
           <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, values.agreeToTerms && styles.checked]}
              onPress={() => setFieldValue('agreeToTerms', !values.agreeToTerms)}
            >
              {values.agreeToTerms && <Check size={16} color="#ffffff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text 
                style={styles.linkText}
                onPress={() => Linking.openURL('https://moussassoss.github.io/CleanEx-Privacy/terms.html')}
              >
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => Linking.openURL('https://moussassoss.github.io/CleanEx-Privacy/')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
          {touched.agreeToTerms && errors.agreeToTerms && (
            <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
          )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              <View style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Continue'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContent}>
    <View style={styles.heroSection}>
      <View style={styles.iconContainer}>
        <Mail size={32} color="#6366f1" />
      </View>
      <Text style={styles.stepTitle}>Verify Your Email</Text>
      <Text style={styles.stepSubtitle}>
        Enter the 6-digit code sent to {formData.email}
      </Text>
    </View>

    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => {otpInputRefs.current[index] = ref}}
          style={styles.otpInput}
          value={digit}
          onChangeText={(value) => handleOtpChange(value, index)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          autoFocus={index === 0}
          onSubmitEditing={() => {
            if (index < 5) {
              otpInputRefs.current[index + 1]?.focus();
            } else {
              Keyboard.dismiss();
            }
          }}
          blurOnSubmit={false}
        />
      ))}
    </View>

    <TouchableOpacity 
      style={[styles.primaryButton, loading && styles.disabledButton]} 
      onPress={handleOtpSubmit}
      disabled={loading}
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
            : 'Resend Code'
        }
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
      onSubmit={handlePasswordSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.stepContent}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Lock size={32} color="#6366f1" />
            </View>
            <Text style={styles.stepTitle}>Create Password</Text>
            <Text style={styles.stepSubtitle}>Choose a strong password for your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
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
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
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
                  {loading ? 'Creating Account...' : 'Create Account'}
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
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ]
        }
      ]}
    >
      <View style={styles.heroSection}>
        <View style={[styles.iconContainer, styles.successIcon]}>
          <Check size={32} color="#10b981" />
        </View>
        <Text style={styles.stepTitle}>Welcome Aboard!</Text>
        <Text style={styles.stepSubtitle}>
          Your account has been created successfully
        </Text>
      </View>

      <View style={styles.celebrationContainer}>
        <View style={styles.starsContainer}>
          <Star size={16} color="#fbbf24" style={[styles.star, { top: 20, left: 30 }]} />
          <Star size={12} color="#f59e0b" style={[styles.star, { top: 60, right: 40 }]} />
          <Star size={14} color="#fbbf24" style={[styles.star, { bottom: 80, left: 50 }]} />
          <Star size={10} color="#f59e0b" style={[styles.star, { bottom: 40, right: 30 }]} />
        </View>
        
        <Text style={styles.welcomeText}>
          Welcome to our laundry service, {formData.fullName}!
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/auth/login')}>
        <View style={[styles.buttonGradient, styles.successButton]}>
          <Text style={styles.buttonText}>Get Started</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return renderDetailsStep();
      case 'verification':
        return renderVerificationStep();
      case 'password':
        return renderPasswordStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderDetailsStep();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                {currentStep !== 'details' && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      if (currentStep === 'verification') setCurrentStep('details');
                      else if (currentStep === 'password') setCurrentStep('verification');
                      else router.back();
                    }}
                  >
                    <ArrowLeft color="#4F46E5" size={24} />
                  </TouchableOpacity>
                )}

                <View style={styles.header}>
                  <Text style={styles.title}>Join Us</Text>
                  {renderStepIndicator()}
                </View>

                <View style={styles.formArea}>
                  {renderCurrentStep()}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkboxText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  activeStep: {
    backgroundColor: '#4F46E5',
  },
  completedStep: {
    backgroundColor: '#4F46E5',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  activeStepText: {
    color: '#ffffff',
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 2,
  },
  completedLine: {
    backgroundColor: '#4F46E5',
  },
  formArea: {
    flex: 1,
  },
  stepContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successIcon: {
    backgroundColor: '#f0fdf4',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 8,
  },
  inputContainer: {
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 10,
    lineHeight: 18,
  },
  eyeIcon: {
    padding: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  celebrationContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
  },
  welcomeText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 2,
    marginLeft: 4,
  },
});