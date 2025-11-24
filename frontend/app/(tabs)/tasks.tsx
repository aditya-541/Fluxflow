import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import { addTask, subscribeToTasks, toggleTaskCompletion, deleteTask, Task, TaskCategory, getSubtasks, canCompleteTask } from '../../services/taskService';
import { getLatestEnergyLog, EnergyLog } from '../../services/energyService';
import { getOptimizedTaskOrder, ScheduledTask } from '../../services/scheduleService';
import TaskItem from '../../components/TaskItem';
import CategorySelector from '../../components/CategorySelector';
import ScheduleOptimizer from '../../components/ScheduleOptimizer';
import AddSubtask from '../../components/AddSubtask';
import { Ionicons } from '@expo/vector-icons';

export default function Tasks() {
    const { user } = useAuth();
    const [newTask, setNewTask] = useState('');
    const [duration, setDuration] = useState('30');
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('personal');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
    const [subtasksMap, setSubtasksMap] = useState<Map<string, Task[]>>(new Map());
    const [loading, setLoading] = useState(false);
    const [isOptimized, setIsOptimized] = useState(false);
    const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
    const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToTasks(user.uid, async (updatedTasks) => {
            setTasks(updatedTasks);
            if (!isOptimized) {
                setDisplayTasks(updatedTasks);
            }

            // Load subtasks for parent tasks
            const newSubtasksMap = new Map<string, Task[]>();
            for (const task of updatedTasks) {
                if (task.totalSubtasks && task.totalSubtasks > 0) {
                    const subtasks = await getSubtasks(user.uid, task.id);
                    newSubtasksMap.set(task.id, subtasks);
                }
            }
            setSubtasksMap(newSubtasksMap);
        });
        return () => unsubscribe();
    }, [user, isOptimized]);

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

    const handleOptimize = async () => {
        if (!user) return;

        const incompleteTasks = tasks.filter(t => !t.completed && !t.parentTaskId);
        if (incompleteTasks.length === 0) return;

        const currentEnergy = await getLatestEnergyLog(user.uid);
        const { tasks: optimizedTasks, scheduledTasks: scheduled } = await getOptimizedTaskOrder(
            incompleteTasks,
            currentEnergy
        );

        setDisplayTasks([...optimizedTasks, ...tasks.filter(t => t.completed && !t.parentTaskId)]);
        setScheduledTasks(scheduled);
        setIsOptimized(true);
    };

    const handleResetOrder = () => {
        setDisplayTasks(tasks);
        setIsOptimized(false);
        setScheduledTasks([]);
    };

    const getScheduledTime = (taskId: string): string | null => {
        const scheduled = scheduledTasks.find(st => st.task_id === taskId);
        if (!scheduled) return null;

        const start = new Date(scheduled.start_time);
        return start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const handleAddSubtask = (parentTaskId: string) => {
        setAddingSubtaskFor(parentTaskId);
        setExpandedTasks(prev => new Set(prev).add(parentTaskId));
    };

    const handleSubtaskAdded = () => {
        setAddingSubtaskFor(null);
    };

    const toggleExpanded = (taskId: string) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const isTaskBlocked = async (task: Task): Promise<boolean> => {
        if (!user || !task.dependsOn || task.dependsOn.length === 0) return false;
        return !(await canCompleteTask(user.uid, task.id));
    };

    const handleToggleTask = async (userId: string, taskId: string, currentStatus: boolean) => {
        await toggleTaskCompletion(userId, taskId, currentStatus);
    };

    // Filter out subtasks from main list
    const mainTasks = displayTasks.filter(t => !t.parentTaskId);

    return (
        <View className="flex-1 bg-[#0a0a0f]">
            <SafeAreaView className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                >
                    {/* Header */}
                    <View className="mb-8 mt-2">
                        <Text className="text-3xl font-light text-white tracking-tight">Tasks</Text>
                    </View>

                    {/* Task Creation Form */}
                    <View className="bg-white/[0.02] p-5 rounded-2xl mb-6 border border-white/[0.05]">
                        <TextInput
                            placeholder="What needs to be done?"
                            placeholderTextColor="#6B7280"
                            className="text-white text-base mb-5 pb-2.5 border-b border-white/[0.05]"
                            value={newTask}
                            onChangeText={setNewTask}
                        />

                        <CategorySelector
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />

                        <View className="flex-row items-center mb-5">
                            <View className="flex-row items-center bg-white/[0.02] rounded-lg px-3 py-2.5 border border-white/[0.05]">
                                <Ionicons name="time-outline" size={16} color="#6b7280" />
                                <TextInput
                                    className="text-white ml-2 w-10 font-medium text-sm"
                                    value={duration}
                                    onChangeText={setDuration}
                                    keyboardType="numeric"
                                />
                                <Text className="text-gray-500 text-xs ml-1">min</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-primary/20 rounded-xl py-3 px-6 flex-row justify-center items-center border border-primary/30 self-start"
                            onPress={handleAddTask}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#6366f1" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="add-circle-outline" size={18} color="#6366f1" />
                                    <Text className="text-primary font-medium text-sm ml-2">Add Task</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Schedule Optimizer */}
                    {tasks.filter(t => !t.completed && !t.parentTaskId).length > 0 && (
                        <ScheduleOptimizer
                            onOptimize={handleOptimize}
                            taskCount={tasks.filter(t => !t.completed && !t.parentTaskId).length}
                        />
                    )}

                    {/* Header with toggle */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-white/90 text-sm font-medium tracking-wide uppercase">
                            {isOptimized ? 'AI Optimized' : 'Inbox'}
                        </Text>
                        {isOptimized && (
                            <TouchableOpacity onPress={handleResetOrder}>
                                <Text className="text-primary text-xs">Reset Order</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Task List */}
                    {mainTasks.length === 0 ? (
                        <View className="items-center justify-center mt-16 opacity-40">
                            <Ionicons name="file-tray-outline" size={48} color="white" />
                            <Text className="text-gray-500 text-center mt-4 text-sm">No tasks yet</Text>
                        </View>
                    ) : (
                        mainTasks.map((task, index) => (
                            <View key={task.id}>
                                {isOptimized && !task.completed && (
                                    <View className="flex-row items-center mb-2 ml-1">
                                        <View className="bg-primary/20 rounded-md px-2 py-0.5 mr-2">
                                            <Text className="text-primary text-[10px] font-medium">#{index + 1}</Text>
                                        </View>
                                        {getScheduledTime(task.id) && (
                                            <Text className="text-gray-500 text-xs">
                                                Suggested: {getScheduledTime(task.id)}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {/* Expand/Collapse Button for tasks with subtasks */}
                                {task.totalSubtasks && task.totalSubtasks > 0 && (
                                    <TouchableOpacity
                                        onPress={() => toggleExpanded(task.id)}
                                        className="flex-row items-center mb-1 ml-1"
                                    >
                                        <Ionicons
                                            name={expandedTasks.has(task.id) ? "chevron-down" : "chevron-forward"}
                                            size={16}
                                            color="#6b7280"
                                        />
                                        <Text className="text-gray-500 text-xs ml-1">
                                            {expandedTasks.has(task.id) ? 'Collapse' : 'Expand'} subtasks
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TaskItem
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={(userId, taskId) => deleteTask(userId, taskId)}
                                    onAddSubtask={handleAddSubtask}
                                />

                                {/* Subtasks */}
                                {expandedTasks.has(task.id) && subtasksMap.get(task.id)?.map(subtask => (
                                    <TaskItem
                                        key={subtask.id}
                                        task={subtask}
                                        onToggle={handleToggleTask}
                                        onDelete={(userId, taskId) => deleteTask(userId, taskId)}
                                        isSubtask={true}
                                    />
                                ))}

                                {/* Add Subtask Form */}
                                {addingSubtaskFor === task.id && user && (
                                    <AddSubtask
                                        userId={user.uid}
                                        parentTaskId={task.id}
                                        category={task.category}
                                        onAdded={handleSubtaskAdded}
                                        onCancel={() => setAddingSubtaskFor(null)}
                                    />
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
