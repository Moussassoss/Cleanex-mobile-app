import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Briefcase, Home, Users, ShieldCheck } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8 justify-between">
        <View>
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 112, height: 112, resizeMode: 'contain' }}
            />
            <Text className="text-3xl font-inter-bold text-text mt-3">
              CleanEx
            </Text>
            <Text className="text-base font-inter text-text-secondary text-center mt-2 leading-6">
              Professional cleaning services for individuals, families, and
              offices.
            </Text>
          </View>

          <View className="bg-surface rounded-2xl border border-gray-200 p-5 mb-4">
            <Text className="text-xl font-inter-bold text-text mb-4">
              Who We Serve
            </Text>

            <View className="flex-row items-center mb-3">
              <Home color="#4F46E5" size={20} />
              <Text className="font-inter text-text ml-3">
                Homes and apartments
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Users color="#4F46E5" size={20} />
              <Text className="font-inter text-text ml-3">
                Families and shared housing
              </Text>
            </View>

            <View className="flex-row items-center">
              <Briefcase color="#4F46E5" size={20} />
              <Text className="font-inter text-text ml-3">
                Offices and business spaces
              </Text>
            </View>
          </View>

          <View className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
            <View className="flex-row items-center mb-2">
              <ShieldCheck color="#4F46E5" size={18} />
              <Text className="font-inter-bold text-primary ml-2">
                Why CleanEx
              </Text>
            </View>
            <Text className="font-inter text-text-secondary text-sm leading-5">
              Transparent pricing, quick booking, and reliable service teams.
            </Text>
          </View>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            className="bg-primary rounded-xl py-4 mb-3"
          >
            <Text className="text-white text-center font-inter-bold text-base">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            className="border border-primary rounded-xl py-4 mb-3"
          >
            <Text className="text-primary text-center font-inter-bold text-base">
              Create Account
            </Text>
          </TouchableOpacity>

          <Text className="font-inter text-xs text-text-secondary text-center">
            Fast booking. Clear pricing. Reliable cleaning.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
