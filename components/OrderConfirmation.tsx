import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Copy,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useToast } from '@/components/ToastProvider';

interface ServiceDetail {
  label: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
}

interface OrderConfirmationProps {
  order: {
    serviceName: string;
    services: ServiceDetail[];
    includeIroning?: boolean;
    ironingPrice?: number;
    total: number;
    ussdCode: string;
    whatsappNumber: string;
    date?: string;
  };
  onBack: () => void;
}

export default function OrderConfirmation({
  order,
  onBack,
}: OrderConfirmationProps) {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showToast({
      message: 'Copied to clipboard!',
      type: 'success',
      duration: 2000,
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-8">
          <TouchableOpacity onPress={onBack} className="mb-6">
            <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
          </TouchableOpacity>

          <View
            className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <View className="flex-row items-center mb-3">
              <CheckCircle color="#10B981" size={24} />
              <Text
                className={`text-xl font-inter-bold ml-2 ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Order Confirmed
              </Text>
            </View>
            <Text
              className={`font-inter ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
            >
              Your booking was received successfully.
            </Text>
          </View>

          <View
            className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <Text
              className={`font-inter-bold text-lg mb-3 ${isDarkMode ? 'text-white' : 'text-text'}`}
            >
              {order.serviceName}
            </Text>

            {order.services
              .filter((s) => s.quantity > 0)
              .map((service) => {
                const total = service.quantity * service.pricePerUnit;
                return (
                  <View
                    key={service.label}
                    className="flex-row justify-between items-center mb-2"
                  >
                    <Text
                      className={`font-inter ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                    >
                      {service.label}: {service.quantity} {service.unit}
                    </Text>
                    <Text
                      className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                    >
                      {total} RWF
                    </Text>
                  </View>
                );
              })}

            {order.includeIroning && (
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`font-inter ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}
                >
                  Ironing Service
                </Text>
                <Text
                  className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
                >
                  {order.ironingPrice || 0} RWF
                </Text>
              </View>
            )}

            <View
              className={`border-t pt-3 mt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <View className="flex-row justify-between items-center">
                <Text className="font-inter-bold text-primary text-base">
                  Total
                </Text>
                <Text className="font-inter-bold text-primary text-2xl">
                  {order.total} RWF
                </Text>
              </View>
            </View>
          </View>

          <View
            className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                USSD Payment Code
              </Text>
              <TouchableOpacity onPress={() => copyToClipboard(order.ussdCode)}>
                <Copy color="#4F46E5" size={18} />
              </TouchableOpacity>
            </View>
            <Text className="font-inter-bold text-primary text-xl">
              {order.ussdCode}
            </Text>
          </View>

          <View
            className={`rounded-2xl p-5 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}
              >
                Send Payment Proof
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(order.whatsappNumber)}
              >
                <Copy color="#4F46E5" size={18} />
              </TouchableOpacity>
            </View>
            <Text className="font-inter-bold text-primary">
              {order.whatsappNumber}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/orders')}
            className="bg-primary rounded-xl py-4"
          >
            <Text className="text-center text-white font-inter-bold">
              View My Orders
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
