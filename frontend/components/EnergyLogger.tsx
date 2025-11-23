import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logEnergy } from '../services/energyService';
import { LinearGradient } from 'expo-linear-gradient';

interface EnergyLoggerProps {
    userId: string;
    onLogComplete: () => void;
}

export default function EnergyLogger({ userId, onLogComplete }: EnergyLoggerProps) {
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

    const levels = [
        { value: 1, label: 'Low', icon: 'battery-dead', color: ['#ef4444', '#b91c1c'] },
        { value: 5, label: 'Medium', icon: 'battery-half', color: ['#f59e0b', '#b45309'] },
        { value: 10, label: 'High', icon: 'battery-full', color: ['#10b981', '#059669'] },
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
        <View className="bg-white/5 p-6 rounded-3xl mb-8 border border-white/10">
            <Text className="text-white font-bold text-2xl mb-6">How's your energy?</Text>

            <View className="flex-row gap-3">
                {levels.map((level) => (
                    <TouchableOpacity
                        key={level.value}
                        className="flex-1"
                        onPress={() => handleLog(level.value)}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={selectedLevel === level.value ? level.color as any : ['#1f2937', '#111827']}
                            className={`items-center py-6 px-4 rounded-2xl border-2 ${selectedLevel === level.value ? 'border-white/30' : 'border-white/10'}`}
                        >
                            {loading && selectedLevel === level.value ? (
                                <ActivityIndicator color="white" size="large" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={level.icon as any}
                                        size={36}
                                        color={selectedLevel === level.value ? 'white' : level.color[0]}
                                    />
                                    <Text className={`mt-3 font-bold text-base ${selectedLevel === level.value ? 'text-white' : 'text-gray-400'}`}>
                                        {level.label}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
