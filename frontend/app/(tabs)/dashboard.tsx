import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import EnergyLogger from '../../components/EnergyLogger';
import PomodoroTimer from '../../components/PomodoroTimer';
import { getLatestEnergyLog, EnergyLog } from '../../services/energyService';
import { subscribeToTasks, Task } from '../../services/taskService';
import { getOptimizedTaskOrder } from '../../services/scheduleService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentEnergy, setCurrentEnergy] = useState<EnergyLog | null>(null);
    const [nextTask, setNextTask] = useState<Task | null>(null);
    const [optimizedTasks, setOptimizedTasks] = useState<Task[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEnergy = async () => {
        if (user) {
            const log = await getLatestEnergyLog(user.uid);
            setCurrentEnergy(log);
        }
    };

    const fetchOptimizedTasks = async (tasks: Task[]) => {
        if (!user || tasks.length === 0) return;

        const incompleteTasks = tasks.filter(t => !t.completed);
        if (incompleteTasks.length === 0) return;

        try {
            const currentEnergy = await getLatestEnergyLog(user.uid);
            const { tasks: optimized } = await getOptimizedTaskOrder(incompleteTasks, currentEnergy);
            setOptimizedTasks(optimized.slice(0, 3)); // Top 3
        } catch (error) {
            console.error('Failed to optimize tasks:', error);
        }
    };

    useEffect(() => {
        fetchEnergy();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // Subscribe to tasks and get the first incomplete one
        const unsubscribe = subscribeToTasks(user.uid, (tasks) => {
            const incompleteTasks = tasks.filter(t => !t.completed);
            setNextTask(incompleteTasks.length > 0 ? incompleteTasks[0] : null);
            fetchOptimizedTasks(tasks);
        });

        return () => unsubscribe();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEnergy();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-[#0a0a0f]">
            <SafeAreaView className="flex-1">
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                >
                    {/* Header */}
                    <View className="mb-8 mt-2">
                        <Text className="text-3xl font-light text-white tracking-tight">Flow</Text>
                    </View>

                    {/* Pomodoro Timer */}
                    <View className="mb-6">
                        <PomodoroTimer />
                    </View>

                    {/* Energy Logger */}
                    {user && (
                        <EnergyLogger
                            userId={user.uid}
                            onLogComplete={fetchEnergy}
                        />
                    )}

                    {/* Stats Cards */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05] flex-1">
                            <View className="flex-row items-center mb-2">
                                <View className="bg-secondary/10 w-8 h-8 rounded-lg items-center justify-center mr-2">
                                    <Ionicons name="flash" size={16} color="#ec4899" />
                                </View>
                                <Text className="text-gray-500 text-[10px] uppercase tracking-wider">Energy</Text>
                            </View>
                            <Text className="text-xl font-semibold text-white">
                                {currentEnergy ? (
                                    currentEnergy.level >= 8 ? 'High' :
                                        currentEnergy.level >= 4 ? 'Medium' : 'Low'
                                ) : '--'}
                            </Text>
                        </View>
                        <View className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05] flex-1">
                            <View className="flex-row items-center mb-2">
                                <View className="bg-primary/10 w-8 h-8 rounded-lg items-center justify-center mr-2">
                                    <Ionicons name="diamond" size={16} color="#6366f1" />
                                </View>
                                <Text className="text-gray-500 text-[10px] uppercase tracking-wider">Points</Text>
                            </View>
                            <Text className="text-xl font-semibold text-white">1,250</Text>
                        </View>
                    </View>

                    {/* AI Recommended Tasks */}
                    {optimizedTasks.length > 0 && (
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="sparkles" size={16} color="#6366f1" />
                                    <Text className="text-white/90 text-sm font-medium ml-2 tracking-wide uppercase">
                                        Recommended
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
                                    <Text className="text-primary text-xs">View All</Text>
                                </TouchableOpacity>
                            </View>
                            {optimizedTasks.map((task, index) => (
                                <View
                                    key={task.id}
                                    className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] mb-2"
                                >
                                    <View className="flex-row items-center">
                                        <View className="bg-primary/20 rounded-md px-2 py-0.5 mr-3">
                                            <Text className="text-primary text-[10px] font-medium">#{index + 1}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-medium text-sm mb-0.5">{task.title}</Text>
                                            <Text className="text-gray-500 text-xs">{task.estimatedDuration} min</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Up Next Section */}
                    {nextTask && !optimizedTasks.length && (
                        <View className="mb-4">
                            <Text className="text-white/90 text-sm font-medium mb-3 tracking-wide uppercase">Up Next</Text>
                            <View className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                                <View className="flex-row items-center">
                                    <View className="w-0.5 h-10 bg-primary rounded-full mr-3" />
                                    <View className="flex-1">
                                        <Text className="text-white font-medium text-base mb-1">{nextTask.title}</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={12} color="#6b7280" />
                                            <Text className="text-gray-500 text-xs ml-1">{nextTask.estimatedDuration} min</Text>
                                            <View className="ml-3 flex-row items-center">
                                                <Ionicons name="flag-outline" size={12} color="#6b7280" />
                                                <Text className="text-gray-500 text-xs ml-1">
                                                    P{nextTask.priority}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
