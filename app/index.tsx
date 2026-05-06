import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Briefcase,
  Home,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';

export default function WelcomeScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSplash) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1200),
      ]).start(() => {
        setShowSplash(false);
      });
    }
  }, [showSplash, scaleAnim, opacityAnim]);

  if (showSplash) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-primary/5 via-background to-background items-center justify-center">
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 120, height: 120, resizeMode: 'contain' }}
          />
          <Text className="text-3xl font-inter-bold text-primary mt-6">
            CleanEx
          </Text>
          <Text className="text-sm text-text-secondary mt-2">
            Your Home, Perfectly Clean
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary/5 via-background to-background">
      <View className="flex-1 px-6 py-4 justify-between">
        {/* HEADER WITH LOGIN */}
        <View className="flex-row items-center justify-between mb-4">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 50, height: 50, resizeMode: 'contain' }}
          />
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.7}
            className="px-4 py-2 rounded-lg bg-white border border-primary/30"
          >
            <Text className="text-primary font-inter-bold text-sm">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <View className="items-center pb-4">
          <Text className="text-4xl font-inter-bold text-primary text-center mb-2">
            CleanEx
          </Text>
          <Text className="text-lg font-inter-semibold text-text text-center mb-1">
            Your Home, Perfectly Clean
          </Text>
          <Text className="text-xs text-text-secondary text-center leading-4">
            Professional cleaning teams. Insured. Vetted. Ready to go.
          </Text>
        </View>

        {/* BENEFITS SECTION */}
        <View className="pb-3">
          <View className="space-y-2">
            <View className="bg-white rounded-lg p-3 flex-row items-start shadow-sm border border-primary/10">
              <View className="bg-primary/10 rounded p-2 mr-2">
                <Sparkles color="#4F46E5" size={16} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-text text-xs mb-0.5">
                  Vetted & Insured
                </Text>
                <Text className="text-[11px] text-text-secondary leading-3">
                  Background-checked, trained cleaners
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-lg p-3 flex-row items-start shadow-sm border border-primary/10">
              <View className="bg-primary/10 rounded p-2 mr-2">
                <ShieldCheck color="#4F46E5" size={16} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-text text-xs mb-0.5">
                  100% Satisfaction
                </Text>
                <Text className="text-[11px] text-text-secondary leading-3">
                  Flexible scheduling & transparent pricing
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SERVICES GRID */}
        <View className="pb-3">
          <View className="flex-row flex-wrap justify-between gap-2">
            <View className="w-[48%] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2.5 border border-primary/20">
              <Home color="#4F46E5" size={18} />
              <Text className="font-inter-bold text-text text-xs mt-1 mb-0.5">
                Regular
              </Text>
              <Text className="text-[10px] text-text-secondary leading-2">
                Weekly maintenance
              </Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2.5 border border-primary/20">
              <Sparkles color="#4F46E5" size={18} />
              <Text className="font-inter-bold text-text text-xs mt-1 mb-0.5">
                Deep Clean
              </Text>
              <Text className="text-[10px] text-text-secondary leading-2">
                Thorough refresh
              </Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2.5 border border-primary/20">
              <Users color="#4F46E5" size={18} />
              <Text className="font-inter-bold text-text text-xs mt-1 mb-0.5">
                Move-In/Out
              </Text>
              <Text className="text-[10px] text-text-secondary leading-2">
                Full turnover
              </Text>
            </View>

            <View className="w-[48%] bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2.5 border border-primary/20">
              <Briefcase color="#4F46E5" size={18} />
              <Text className="font-inter-bold text-text text-xs mt-1 mb-0.5">
                Specialist
              </Text>
              <Text className="text-[10px] text-text-secondary leading-2">
                Carpet, laundry
              </Text>
            </View>
          </View>
        </View>

        {/* BOTTOM CTA SECTION */}
        <View className="items-center">
          <Text className="text-xs text-text-secondary text-center mb-2.5">
            First time here?
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.75}
            className="bg-primary rounded-2xl py-3.5 px-6 flex-row items-center justify-center shadow-lg w-full mb-3"
          >
            <Sparkles color="white" size={20} strokeWidth={2.5} />
            <Text className="text-white font-inter-bold text-base ml-3">
              Book Your First Cleaning
            </Text>
          </TouchableOpacity>
          <Text className="text-[10px] text-text-secondary/70 text-center">
            © 2025 CleanEx. Professional Cleaning Made Easy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
