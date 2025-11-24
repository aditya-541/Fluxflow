import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../services/taskService';
import { getCategoryConfig } from '../constants/categories';

interface TaskItemProps {
    task: Task;
    onToggle: (userId: string, taskId: string, currentStatus: boolean) => Promise<void>;
    onDelete: (userId: string, taskId: string) => void;
    onAddSubtask?: (parentTaskId: string) => void;
    isSubtask?: boolean;
    isBlocked?: boolean;
}

export default function TaskItem({
    task,
    onToggle,
    onDelete,
    onAddSubtask,
    isSubtask = false,
    isBlocked = false
}: TaskItemProps) {
    const categoryConfig = getCategoryConfig(task.category);
    const [isToggling, setIsToggling] = useState(false);

    const hasSubtasks = task.totalSubtasks !== undefined && task.totalSubtasks > 0;
    const progress = hasSubtasks && task.totalSubtasks
        ? ((task.completedSubtasks || 0) / task.totalSubtasks) * 100
        : 0;

    const handleToggle = async () => {
        if (isToggling) return;

        setIsToggling(true);
        try {
            await onToggle(task.userId, task.id, task.completed);
        } catch (error: any) {
            Alert.alert('Cannot Complete', error.message || 'Dependencies not met');
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <View className={`bg-white/[0.02] p-4 rounded-xl mb-2 border border-white/[0.05] ${isSubtask ? 'ml-6' : ''}`}>
            <View className="flex-row items-start">
                <TouchableOpacity
                    onPress={handleToggle}
                    className="mr-3 mt-0.5"
                    disabled={isToggling || isBlocked}
                >
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${task.completed ? 'bg-primary border-primary' :
                        isBlocked ? 'border-gray-600' : 'border-gray-500'
                        }`}>
                        {task.completed && <Ionicons name="checkmark" size={14} color="white" />}
                        {isBlocked && <Ionicons name="lock-closed" size={12} color="#6b7280" />}
                    </View>
                </TouchableOpacity>

                <View className="flex-1">
                    {/* Category and Blocked Badge */}
                    <View className="flex-row items-center mb-1.5">
                        <View
                            className="px-2 py-0.5 rounded-md mr-2"
                            style={{ backgroundColor: categoryConfig.bgColor }}
                        >
                            <Text className="text-[10px] font-semibold" style={{ color: categoryConfig.color }}>
                                {categoryConfig.label}
                            </Text>
                        </View>
                        {isBlocked && (
                            <View className="bg-yellow-500/20 px-2 py-0.5 rounded-md">
                                <Text className="text-yellow-500 text-[10px] font-medium">BLOCKED</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text className={`text-white font-medium text-sm mb-1.5 ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                    </Text>

                    {/* Progress Bar for Parent Tasks */}
                    {hasSubtasks && (
                        <View className="mb-2">
                            <View className="bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                                <View
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </View>
                            <Text className="text-gray-500 text-[10px] mt-1">
                                {task.completedSubtasks}/{task.totalSubtasks} subtasks
                            </Text>
                        </View>
                    )}

                    {/* Meta Info */}
                    <View className="flex-row items-center flex-wrap">
                        <View className="flex-row items-center mr-3">
                            <Ionicons name="time-outline" size={12} color="#6b7280" />
                            <Text className="text-gray-500 text-xs ml-1">{task.estimatedDuration}m</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="flag-outline" size={12} color="#6b7280" />
                            <Text className="text-gray-500 text-xs ml-1">
                                P{task.priority}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center ml-2">
                    {!isSubtask && onAddSubtask && (
                        <TouchableOpacity
                            onPress={() => onAddSubtask(task.id)}
                            className="p-2"
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#6366f1" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => onDelete(task.userId, task.id)}
                        className="p-2"
                    >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
