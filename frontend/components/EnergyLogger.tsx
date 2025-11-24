import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logEnergy } from '../services/energyService';

interface EnergyLoggerProps {
    userId: string;
    onLogComplete: () => void;
}

export default function EnergyLogger({ userId, onLogComplete }: EnergyLoggerProps) {
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

    const levels = [
        { value: 1, label: 'Low', icon: 'battery-dead', color: '#ef4444' },
        { value: 5, label: 'Medium', icon: 'battery-half', color: '#f59e0b' },
        { value: 10, label: 'High', icon: 'battery-full', color: '#10b981' },
    ];

    const handleLog = async (level: number) => {
        setSelectedLevel(level);
        setLoading(true);
        try {
            await logEnergy(userId, level);
            onLogComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setSelectedLevel(null);
        }
    };

    return (
        <View className="bg-white/[0.02] p-5 rounded-2xl mb-6 border border-white/[0.05]">
            <Text className="text-white/90 text-sm font-medium mb-4 tracking-wide uppercase">Energy Check</Text>

            <View className="flex-row gap-2.5">
                {levels.map((level) => (
                    <TouchableOpacity
                        key={level.value}
                        className="flex-1"
                        onPress={() => handleLog(level.value)}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <View
                            className={`items-center py-4 px-3 rounded-xl border ${selectedLevel === level.value
                                    ? 'bg-white/[0.08] border-white/20'
                                    : 'bg-white/[0.02] border-white/[0.05]'
                                }`}
                        >
                            {loading && selectedLevel === level.value ? (
                                <ActivityIndicator color={level.color} size="small" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={level.icon as any}
                                        size={28}
                                        color={level.color}
                                    />
                                    <Text className="mt-2 font-medium text-xs text-gray-400">
                                        {level.label}
                                    </Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
