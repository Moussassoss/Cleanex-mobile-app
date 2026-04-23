import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Clock, Grid2x2, Sparkles, Star, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ToastProvider';
import { supabase } from '@/lib/supabase';
import { API_CONFIG } from '@/config/config';
import { SERVICE_CATALOG } from '@/config/services';
import BrandedThemeToggle from '@/components/BrandedThemeToggle';

export default function HomeScreen() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [monthlyOrdersCount, setMonthlyOrdersCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      setUser(session.user);
      await loadOrders(session.user.id, session.access_token);
    };

    init();
  }, []);

  const loadOrders = async (userId: string, accessToken: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok || !Array.isArray(result.orders)) {
        throw new Error('Failed to fetch orders');
      }

      const allOrders = result.orders;
      const sorted = [...allOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentOrders(sorted.slice(0, 3));

      const now = new Date();
      const monthOrders = allOrders.filter((order: any) => {
        const d = new Date(order.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      setMonthlyOrdersCount(monthOrders.length);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const topServices = useMemo(() => SERVICE_CATALOG.slice(0, 6), []);

  const handleServicePress = (route: string) => {
    router.push(route as any);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          label: 'Pending',
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          label: 'Completed',
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          label: status,
        };
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="flex-row items-center flex-1 mr-4"
            >
              <View className={`w-11 h-11 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'}`}>
                <Text className="font-inter-bold text-primary">
                  {(user?.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>

              <View className="ml-3 flex-1">
                <Text className={`font-inter text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>
                  Profile
                </Text>
                <Text className={`font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`} numberOfLines={1}>
                  {user?.user_metadata?.full_name || 'CleanEx User'}
                </Text>
              </View>
            </TouchableOpacity>

            <BrandedThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} showLabel={false} />
          </View>

          <Text className={`font-inter text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>
            {getGreeting()}
          </Text>
          <Text className={`text-3xl font-inter-bold mt-1 ${isDarkMode ? 'text-white' : 'text-text'}`}>
            {user?.user_metadata?.full_name?.split(' ')[0] || 'Welcome'}
          </Text>
          <Text className={`font-inter mt-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
            Book cleaning services in a few steps.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/screens/Services')}
            className="bg-primary rounded-xl py-3 px-4 mt-5"
          >
            <View className="flex-row items-center justify-center">
              <Grid2x2 color="#FFFFFF" size={18} />
              <Text className="text-white font-inter-bold text-base ml-2">Services</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row">
            <View
              className={`flex-1 rounded-2xl p-4 mr-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
            >
              <View className="flex-row items-center mb-2">
                <TrendingUp color="#10B981" size={18} />
                <Text className={`font-inter-bold ml-2 ${isDarkMode ? 'text-white' : 'text-text'}`}>Orders</Text>
              </View>
              <Text className="text-2xl font-inter-bold text-primary">{monthlyOrdersCount}</Text>
              <Text className={`font-inter text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>This month</Text>
            </View>

            <View
              className={`flex-1 rounded-2xl p-4 ml-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
            >
              <View className="flex-row items-center mb-2">
                <Star color="#F59E0B" size={18} />
                <Text className={`font-inter-bold ml-2 ${isDarkMode ? 'text-white' : 'text-text'}`}>Rating</Text>
              </View>
              <Text className="text-2xl font-inter-bold text-accent">4.9</Text>
              <Text className={`font-inter text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>Average</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-xl font-inter-bold ${isDarkMode ? 'text-white' : 'text-text'}`}>Popular Services</Text>
            <TouchableOpacity onPress={() => router.push('/screens/Services')}>
              <Text className="font-inter-bold text-primary">View all</Text>
            </TouchableOpacity>
          </View>

          {topServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => handleServicePress(service.route)}
              className={`rounded-2xl p-4 mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className={`font-inter-bold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-text'}`}>
                    {service.name}
                  </Text>
                  <Text className={`font-inter text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
                    {service.description}
                  </Text>
                  <Text className="font-inter-bold text-primary text-sm">{service.priceLabel}</Text>
                </View>

                <View className="items-end">
                  <View className="bg-primary/10 px-3 py-2 rounded-lg">
                    <Text className="text-primary font-inter-bold text-xs">Book Now</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 pb-8">
          <Text className={`text-xl font-inter-bold mb-4 ${isDarkMode ? 'text-white' : 'text-text'}`}>Recent Orders</Text>

          {recentOrders.length === 0 ? (
            <View className={`rounded-2xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Text className={`font-inter-bold mb-1 ${isDarkMode ? 'text-white' : 'text-text'}`}>No orders yet</Text>
              <Text className={`font-inter mb-3 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>
                Start by selecting a service from the Services page.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/screens/Services')}
                className="bg-primary rounded-lg py-3"
              >
                <Text className="text-white text-center font-inter-bold">Browse Services</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentOrders.map((order) => {
              const status = getStatusStyles(order.status);
              return (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => router.push('/(tabs)/orders')}
                  className={`rounded-2xl p-4 mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`font-inter-bold text-base ${isDarkMode ? 'text-white' : 'text-text'}`}>
                      {order.services?.name || order.service_id}
                    </Text>
                    <View className={`${status.bg} rounded-full px-3 py-1`}>
                      <Text className={`${status.text} font-inter-bold text-xs`}>{status.label}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-inter ${isDarkMode ? 'text-gray-300' : 'text-text-secondary'}`}>
                      {order.total_price} RWF
                    </Text>
                    <View className="flex-row items-center">
                      <Clock color={isDarkMode ? '#9CA3AF' : '#6B7280'} size={14} />
                      <Text className={`font-inter text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
