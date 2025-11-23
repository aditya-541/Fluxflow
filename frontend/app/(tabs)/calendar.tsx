import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import { subscribeToTasks, Task } from '../../services/taskService';
import { getLatestEnergyLog } from '../../services/energyService';
import { generateSchedule, ScheduledTask } from '../../services/scheduleService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Calendar() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [schedule, setSchedule] = useState<ScheduledTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
            // Filter for incomplete tasks
            setTasks(updatedTasks.filter(t => !t.completed));
        });
        return () => unsubscribe();
    }, [user]);

    const handleGenerateSchedule = async () => {
        if (!user || tasks.length === 0) {
            Alert.alert('No tasks', 'Add some tasks to generate a schedule!');
            return;
        }

        setLoading(true);
        setError(null);
        setUsingFallback(false);

        try {
            const energy = await getLatestEnergyLog(user.uid);
            const generatedSchedule = await generateSchedule(tasks, energy);
            setSchedule(generatedSchedule);

            // Check if we got fallback scheduling (lower confidence scores)
            const avgConfidence = generatedSchedule.reduce((sum, t) => sum + t.confidence_score, 0) / generatedSchedule.length;
            if (avgConfidence < 0.8) {
                setUsingFallback(true);
            }
        } catch (error: any) {
            setError('Failed to generate schedule. Please try again.');
            console.error('Schedule generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderScheduledTask = ({ item }: { item: ScheduledTask }) => {
        const task = tasks.find(t => t.id === item.task_id);
        if (!task) return null;

        const startTime = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View className="bg-white/5 p-5 rounded-3xl mb-4 border border-white/10">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="text-white font-bold text-xl mb-2">{task.title}</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                            <Text className="text-gray-400 ml-2 font-medium">{startTime} - {endTime}</Text>
                        </View>
                    </View>
                    <View className="bg-primary/20 px-3 py-2 rounded-full border border-primary/30">
                        <Text className="text-xs text-primary font-bold">{(item.confidence_score * 100).toFixed(0)}%</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-dark">
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                className="absolute w-full h-full"
            />
            <SafeAreaView className="flex-1">
                <View className="px-5 pt-4 pb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-4xl font-bold text-white">Schedule</Text>
                        {usingFallback && (
                            <Text className="text-xs text-yellow-400 mt-2">⚡ Using local scheduling</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        className="shadow-lg shadow-secondary/50"
                        onPress={handleGenerateSchedule}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={loading ? ['#4B5563', '#374151'] : ['#ec4899', '#db2777']}
                            className="p-4 rounded-2xl border border-white/20"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="sparkles" size={28} color="white" />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {error && (
                    <View className="mx-5 mb-4 bg-red-500/10 border border-red-500/30 p-5 rounded-3xl">
                        <View className="flex-row items-center">
                            <Ionicons name="alert-circle" size={24} color="#ef4444" />
                            <Text className="text-red-400 ml-3 flex-1 text-base">{error}</Text>
                        </View>
                    </View>
                )}

                {loading && (
                    <View className="mx-5 mb-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                        <View className="flex-row items-center">
                            <ActivityIndicator color="#8b5cf6" size="small" />
                            <Text className="text-gray-300 ml-4 text-base">Generating AI-optimized schedule...</Text>
                        </View>
                    </View>
                )}

                {schedule.length > 0 ? (
                    <FlatList
                        data={schedule}
                        keyExtractor={item => item.task_id}
                        renderItem={renderScheduledTask}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center opacity-50 px-8">
                        <Ionicons name="calendar-outline" size={80} color="white" />
                        <Text className="text-gray-300 mt-6 text-center text-xl leading-relaxed">
                            Tap the sparkle button to generate{'\n'}an AI-optimized schedule.
                        </Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
