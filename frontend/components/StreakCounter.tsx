import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
    currentStreak: number;
    longestStreak?: number;
    compact?: boolean;
}

export default function StreakCounter({ currentStreak, longestStreak, compact = false }: StreakCounterProps) {
    if (currentStreak === 0 && !longestStreak) return null;

    if (compact) {
        return (
            <View className="flex-row items-center">
                <Ionicons name="flame" size={14} color={currentStreak > 0 ? "#f59e0b" : "#6b7280"} />
                <Text className="text-xs ml-1" style={{ color: currentStreak > 0 ? "#f59e0b" : "#6b7280" }}>
                    {currentStreak}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-row items-center gap-3">
            {currentStreak > 0 && (
                <View className="flex-row items-center bg-orange-500/20 px-2 py-1 rounded-md">
                    <Ionicons name="flame" size={16} color="#f59e0b" />
                    <Text className="text-orange-500 text-xs font-medium ml-1.5">
                        {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}
            {longestStreak && longestStreak > 0 && (
                <View className="flex-row items-center">
                    <Ionicons name="trophy" size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-xs ml-1">
                        Best: {longestStreak}
                    </Text>
                </View>
            )}
        </View>
    );
}
