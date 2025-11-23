import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import { addTask, subscribeToTasks, toggleTaskCompletion, deleteTask, Task, TaskCategory } from '../../services/taskService';
import TaskItem from '../../components/TaskItem';
import CategorySelector from '../../components/CategorySelector';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Tasks() {
    const { user } = useAuth();
    const [newTask, setNewTask] = useState('');
    const [duration, setDuration] = useState('30');
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('personal');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToTasks(user.uid, (updatedTasks) => {
            setTasks(updatedTasks);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddTask = async () => {
        if (!newTask.trim()) return;
        if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
        }

        setLoading(true);
        try {
            await addTask(user.uid, newTask, parseInt(duration) || 30, 1, selectedCategory);
            setNewTask('');
            setDuration('30');
            setSelectedCategory('personal');
        } catch (error) {
            Alert.alert('Error', 'Failed to add task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-dark">
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                className="absolute w-full h-full"
            />
            <SafeAreaView className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                >
                    {/* Header */}
                    <View className="pt-4 pb-6">
                        <Text className="text-4xl font-bold text-white mb-8">Quick Capture</Text>

                        {/* Task Creation Form */}
                        <View className="bg-white/5 p-6 rounded-3xl mb-6 border border-white/10">
                            <TextInput
                                placeholder="What needs to be done?"
                                placeholderTextColor="#6B7280"
                                className="text-white text-lg mb-6 pb-3 border-b border-white/10"
                                value={newTask}
                                onChangeText={setNewTask}
                            />

                            <CategorySelector
                                selectedCategory={selectedCategory}
                                onSelect={setSelectedCategory}
                            />

                            <View className="flex-row items-center mb-6">
                                <View className="flex-row items-center bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                                    <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                                    <TextInput
                                        className="text-white ml-3 w-12 font-medium text-base"
                                        value={duration}
                                        onChangeText={setDuration}
                                        keyboardType="numeric"
                                    />
                                    <Text className="text-gray-400 text-sm ml-1">min</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                className="w-full overflow-hidden rounded-2xl"
                                onPress={handleAddTask}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#6366f1', '#8b5cf6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="py-4 flex-row justify-center items-center"
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="add-circle-outline" size={24} color="white" />
                                            <Text className="text-white font-bold text-lg ml-2">Add Task</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-2xl font-bold text-white mb-4">Inbox</Text>
                    </View>

                    {/* Task List */}
                    {tasks.length === 0 ? (
                        <View className="items-center justify-center mt-20 opacity-50 px-5">
                            <Ionicons name="file-tray-outline" size={72} color="white" />
                            <Text className="text-gray-300 text-center mt-6 text-lg">No tasks yet. Start your flow!</Text>
                        </View>
                    ) : (
                        tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={(userId, taskId, currentStatus) => toggleTaskCompletion(userId, taskId, currentStatus)}
                                onDelete={(userId, taskId) => deleteTask(userId, taskId)}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
