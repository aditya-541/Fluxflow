import { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addSubtask, TaskCategory } from '../services/taskService';

interface AddSubtaskProps {
    userId: string;
    parentTaskId: string;
    category?: TaskCategory;
    onAdded: () => void;
    onCancel: () => void;
}

export default function AddSubtask({ userId, parentTaskId, category, onAdded, onCancel }: AddSubtaskProps) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('15');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            await addSubtask(userId, parentTaskId, title, parseInt(duration) || 15, category);
            onAdded();
        } catch (error) {
            console.error('Failed to add subtask:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="ml-6 bg-white/[0.03] p-3 rounded-xl mb-2 border border-primary/30">
            <View className="flex-row items-center mb-2">
                <TextInput
                    placeholder="Subtask title..."
                    placeholderTextColor="#6B7280"
                    className="flex-1 text-white text-sm"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
            </View>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center bg-white/[0.02] rounded-lg px-2 py-1.5 border border-white/[0.05]">
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <TextInput
                        className="text-white ml-1.5 w-8 text-xs"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                    />
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={onCancel}
                        className="p-2"
                    >
                        <Ionicons name="close" size={18} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleAdd}
                        disabled={loading || !title.trim()}
                        className="p-2"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#6366f1" />
                        ) : (
                            <Ionicons name="checkmark" size={18} color="#6366f1" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
