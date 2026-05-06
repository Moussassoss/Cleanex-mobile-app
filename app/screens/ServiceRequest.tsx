import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ToastProvider';
import { SERVICE_CATALOG } from '@/config/services';
import { supabase } from '@/lib/supabase';
import { API_CONFIG } from '@/config/config';

const SUPPORT_EMAIL = 'cleanex.chadnova@gmail.com';

const REQUEST_SERVICES = [
  'carpet_deep_cleaning',
  'bed_covers_cleaning',
  'sofa_deep_cleaning',
];

const SIZE_OPTIONS = {
  carpet_deep_cleaning: [
    'Small (< 2m²)',
    'Medium (2-4m²)',
    'Large (4-6m²)',
    'Extra Large (> 6m²)',
  ],
  bed_covers_cleaning: ['Single', 'Double', 'Queen', 'King'],
  sofa_deep_cleaning: [
    '1-Seater',
    '2-Seater',
    '3-Seater',
    'L-Shape',
    'Corner Unit',
  ],
};

export default function ServiceRequestScreen() {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ service?: string }>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [size, setSize] = useState('');

  const service = useMemo(() => {
    const id = params.service || '';
    return SERVICE_CATALOG.find((item) => item.id === id);
  }, [params.service]);

  const sendByEmail = async () => {
    const subject = encodeURIComponent(
      `Service Request: ${service?.name || 'CleanEx Service'}`,
    );
    const body = encodeURIComponent(
      `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nService: ${service?.name || 'N/A'}\nNotes: ${notes}`,
    );
    await Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`,
    );
  };

  const submitRequest = async () => {
    if (!fullName || !email || !phone || !address) {
      showToast({
        message: 'Please complete all required fields.',
        type: 'info',
      });
      return;
    }

    const isRequestService = REQUEST_SERVICES.includes(params.service || '');
    if (isRequestService && !quantity) {
      showToast({ message: 'Please specify quantity.', type: 'info' });
      return;
    }
    if (isRequestService && !size) {
      showToast({ message: 'Please select size.', type: 'info' });
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        await sendByEmail();
        showToast({
          message: 'Opened your email app to submit this request.',
          type: 'success',
        });
        return;
      }

      const payloadMessage = [
        `Service: ${service?.name || 'N/A'}`,
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Address: ${address}`,
        `Quantity: ${quantity || 'N/A'}`,
        `Size: ${size || 'N/A'}`,
        `Notes: ${notes || 'None'}`,
      ].join('\n');

      const response = await fetch(`${API_CONFIG.BASE_URL}/support/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: fullName,
          email,
          subject: `Service Request: ${service?.name || 'New Service'}`,
          message: payloadMessage,
        }),
      });

      if (!response.ok) {
        await sendByEmail();
        showToast({
          message:
            'Sent via email fallback. Our team will contact you shortly.',
          type: 'warning',
        });
        return;
      }

      showToast({
        message:
          'Request submitted successfully. We will contact you by email.',
        type: 'success',
      });
      router.back();
    } catch (error) {
      console.error(error);
      await sendByEmail();
      showToast({
        message: 'Network issue. Request prepared in email app.',
        type: 'warning',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return (
      <SafeAreaView
        className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
      >
        <Text
          className={`${isDarkMode ? 'text-white' : 'text-text'} font-inter-bold mb-3`}
        >
          Service not found.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-inter-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
          </TouchableOpacity>

          <Text
            className={`text-2xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
          >
            {service.name}
          </Text>
          <Text
            className={`font-inter mt-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
          >
            {service.description}
          </Text>
          <Text className="font-inter-bold text-primary mt-2">
            {service.priceLabel}
          </Text>

          <View
            className={`rounded-2xl p-5 mt-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <Text
              className={`font-inter-bold mb-4 ${isDarkMode ? 'text-white' : 'text-text'}`}
            >
              Booking Request
            </Text>

            <TextInput
              className={`rounded-xl px-4 py-3 mb-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
              placeholder="Full name"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              className={`rounded-xl px-4 py-3 mb-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className={`rounded-xl px-4 py-3 mb-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
              placeholder="Phone number"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              className={`rounded-xl px-4 py-3 mb-3 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
              placeholder="Address"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={address}
              onChangeText={setAddress}
            />

            {REQUEST_SERVICES.includes(params.service || '') && (
              <>
                <Text
                  className={`font-inter-bold mb-2 ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  Quantity
                </Text>
                <TextInput
                  className={`rounded-xl px-4 py-3 mb-4 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
                  placeholder="Enter quantity (e.g., 3, 10, 20, etc.)"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={quantity}
                  onChangeText={(text) =>
                    setQuantity(text.replace(/[^0-9]/g, ''))
                  }
                  keyboardType="number-pad"
                />

                <Text
                  className={`font-inter-bold mb-2 ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  Size
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 -mx-6 px-6"
                >
                  <View className="flex-row gap-2">
                    {SIZE_OPTIONS[
                      params.service as keyof typeof SIZE_OPTIONS
                    ]?.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setSize(option)}
                        className={`rounded-lg px-4 py-3 min-w-fit ${
                          size === option
                            ? 'bg-primary'
                            : isDarkMode
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`font-inter text-sm ${
                            size === option
                              ? 'text-white font-inter-bold'
                              : isDarkMode
                                ? 'text-white'
                                : 'text-text'
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
            <TextInput
              className={`rounded-xl px-4 py-3 mb-4 font-inter ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-text'}`}
              placeholder="Additional notes (optional)"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 96 }}
            />

            <TouchableOpacity
              onPress={submitRequest}
              disabled={submitting}
              className="bg-primary rounded-xl py-3 mb-3"
            >
              <Text className="text-center text-white font-inter-bold">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={sendByEmail}
              className="border border-primary rounded-xl py-3"
            >
              <Text className="text-center text-primary font-inter-bold">
                Send By Email
              </Text>
            </TouchableOpacity>

            <Text
              className={`font-inter text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}
            >
              Email reception: {SUPPORT_EMAIL}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
