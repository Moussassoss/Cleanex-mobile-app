import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo scale and opacity
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
      // Show for a bit then navigate
      Animated.delay(1200),
    ]).start(() => {
      router.replace('/');
    });
  }, [scaleAnim, opacityAnim]);

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary/5 via-background to-background items-center justify-center">
      <View className="items-center">
        <Animated.Image
          source={require('@/assets/images/logo.png')}
          style={[
            { width: 120, height: 120, resizeMode: 'contain' },
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <Animated.Text
          style={[
            { opacity: opacityAnim },
          ]}
          className="text-3xl font-inter-bold text-primary mt-6"
        >
          CleanEx
        </Animated.Text>
        <Animated.Text
          style={[
            { opacity: opacityAnim },
          ]}
          className="text-sm text-text-secondary mt-2"
        >
          Your Home, Perfectly Clean
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}
