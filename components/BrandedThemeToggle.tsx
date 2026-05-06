import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';

interface BrandedThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  showLabel?: boolean;
}

export default function BrandedThemeToggle({
  isDarkMode,
  onToggle,
  showLabel = true,
}: BrandedThemeToggleProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      className="rounded-xl border border-gray-200 bg-white px-3 py-2"
    >
      {showLabel && (
        <Text className="text-xs font-inter text-text-secondary mb-2 text-center">
          Theme
        </Text>
      )}

      <View className="flex-row items-center">
        <View className="items-center">
          <Sun size={16} color={isDarkMode ? '#9CA3AF' : '#F59E0B'} />
          <Text
            className={`text-[10px] font-inter mt-1 ${isDarkMode ? 'text-gray-400' : 'text-amber-700'}`}
          >
            Light
          </Text>
        </View>

        <View className="mx-4" />

        <View className="items-center">
          <Moon size={16} color={isDarkMode ? '#3B82F6' : '#9CA3AF'} />
          <Text
            className={`text-[10px] font-inter mt-1 ${isDarkMode ? 'text-blue-700' : 'text-gray-400'}`}
          >
            Dark
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
