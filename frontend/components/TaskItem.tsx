import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../services/taskService';
import { getCategoryConfig } from '../constants/categories';

interface TaskItemProps {
    task: Task;
    onToggle: (userId: string, taskId: string, currentStatus: boolean) => void;
    onDelete: (userId: string, taskId: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const categoryConfig = getCategoryConfig(task.category);

    return (
        <View className="bg-white/5 p-5 rounded-2xl mb-3 border border-white/10 flex-row items-center">
            <TouchableOpacity
                onPress={() => onToggle(task.userId, task.id, task.completed)}
                className="mr-4"
            >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${task.completed ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                    {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
            </TouchableOpacity>

            <View className="flex-1">
                <View className="flex-row items-center mb-2">
                    <View
                        className="px-2 py-1 rounded-lg mr-2"
                        style={{ backgroundColor: categoryConfig.bgColor }}
                    >
                        <Text className="text-xs font-semibold" style={{ color: categoryConfig.color }}>
                            {categoryConfig.label}
                        </Text>
                    </View>
                </View>
                <Text className={`text-white font-medium text-base ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                </Text>
                <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm ml-1">{task.estimatedDuration} min</Text>
                    <View className="ml-3 flex-row items-center">
                        <Ionicons name="flag-outline" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">
                            {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onDelete(task.userId, task.id)}
                className="ml-3 p-2"
            >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}
