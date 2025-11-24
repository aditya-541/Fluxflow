import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleOptimizerProps {
    onOptimize: () => Promise<void>;
    taskCount: number;
}

export default function ScheduleOptimizer({ onOptimize, taskCount }: ScheduleOptimizerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleOptimize = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await onOptimize();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to optimize schedule');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (taskCount === 0) {
        return null;
    }

    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={handleOptimize}
                disabled={loading}
                className="bg-primary/20 rounded-xl py-3 px-5 flex-row items-center justify-center border border-primary/30"
            >
                {loading ? (
                    <>
                        <ActivityIndicator size="small" color="#6366f1" />
                        <Text className="text-primary font-medium text-sm ml-2">Optimizing...</Text>
                    </>
                ) : success ? (
                    <>
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                        <Text className="text-green-500 font-medium text-sm ml-2">
                            Optimized {taskCount} tasks
                        </Text>
                    </>
                ) : error ? (
                    <>
                        <Ionicons name="alert-circle" size={18} color="#ef4444" />
                        <Text className="text-red-500 font-medium text-sm ml-2">{error}</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="sparkles" size={18} color="#6366f1" />
                        <Text className="text-primary font-medium text-sm ml-2">Optimize Schedule</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}
