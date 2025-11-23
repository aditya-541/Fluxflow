import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import EnergyLogger from '../../components/EnergyLogger';
import PomodoroTimer from '../../components/PomodoroTimer';
import { getLatestEnergyLog, EnergyLog } from '../../services/energyService';
import { subscribeToTasks, Task } from '../../services/taskService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
    const { user } = useAuth();
    const [currentEnergy, setCurrentEnergy] = useState<EnergyLog | null>(null);
    const [nextTask, setNextTask] = useState<Task | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEnergy = async () => {
        if (user) {
            const log = await getLatestEnergyLog(user.uid);
            setCurrentEnergy(log);
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
        });

        return () => unsubscribe();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEnergy();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-dark">
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                className="absolute w-full h-full"
            />
            <SafeAreaView className="flex-1">
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-10 mt-4">
                        <View>
                            <Text className="text-gray-400 text-base mb-1">Welcome back,</Text>
                            <Text className="text-4xl font-bold text-white">Aditya</Text>
                        </View>
                        <View className="bg-white/10 p-3 rounded-full border border-white/20">
                            <Ionicons name="person" size={28} color="white" />
                        </View>
                    </View>

                    {/* Pomodoro Timer */}
                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-white mb-4">Focus Timer</Text>
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
                    <View className="flex-row gap-4 mb-8">
                        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-1">
                            <View className="bg-secondary/20 w-12 h-12 rounded-full items-center justify-center mb-4">
                                <Ionicons name="flash" size={24} color="#ec4899" />
                            </View>
                            <Text className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Current Energy</Text>
                            <Text className="text-2xl font-bold text-white">
                                {currentEnergy ? (
                                    currentEnergy.level >= 8 ? 'High' :
                                        currentEnergy.level >= 4 ? 'Medium' : 'Low'
                                ) : '--'}
                            </Text>
                        </View>
                        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-1">
                            <View className="bg-primary/20 w-12 h-12 rounded-full items-center justify-center mb-4">
                                <Ionicons name="diamond" size={24} color="#6366f1" />
                            </View>
                            <Text className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Flow Points</Text>
                            <Text className="text-2xl font-bold text-white">1,250</Text>
                        </View>
                    </View>

                    {/* Up Next Section */}
                    {nextTask && (
                        <View className="mb-4">
                            <Text className="text-2xl font-bold text-white mb-4">Up Next</Text>
                            <LinearGradient
                                colors={['#1e293b', '#0f172a']}
                                className="p-6 rounded-3xl border border-white/10"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-1 h-12 bg-primary rounded-full mr-4" />
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-xl mb-1">{nextTask.title}</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                                            <Text className="text-gray-400 font-medium ml-2">{nextTask.estimatedDuration} min</Text>
                                            <View className="ml-3 flex-row items-center">
                                                <Ionicons name="flag-outline" size={16} color="#9CA3AF" />
                                                <Text className="text-gray-400 font-medium ml-2">
                                                    Priority {nextTask.priority}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
