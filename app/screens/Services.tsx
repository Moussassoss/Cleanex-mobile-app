import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SERVICE_CATALOG } from '@/config/services';

export default function ServicesScreen() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <ArrowLeft color={isDarkMode ? '#FFFFFF' : '#4F46E5'} size={24} />
          </TouchableOpacity>

          <Text className={`text-3xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}>
            Services
          </Text>
          <Text className={`font-inter mt-1 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
            Choose a service and book in one step.
          </Text>
        </View>

        <View className="px-6 pb-8">
          {SERVICE_CATALOG.map((service) => (
            <View
              key={service.id}
              className={`rounded-2xl p-5 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
            >
              <Text className={`text-lg font-inter-bold mb-1 ${isDarkMode ? 'text-white' : 'text-text'}`}>
                {service.name}
              </Text>
              <Text className={`font-inter mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
                {service.description}
              </Text>
              <Text className="font-inter-bold text-primary mb-4">{service.priceLabel}</Text>

              <TouchableOpacity
                onPress={() => router.push(service.route as any)}
                className="bg-primary rounded-xl py-3"
              >
                <Text className="text-white text-center font-inter-bold">
                  {service.requiresCustomRequest ? 'Request Booking' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
