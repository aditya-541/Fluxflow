import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { RecurrencePattern } from '../services/taskService';

interface RecurrenceSelectorProps {
    pattern: RecurrencePattern;
    onChange: (pattern: RecurrencePattern) => void;
}

export default function RecurrenceSelector({ pattern, onChange }: RecurrenceSelectorProps) {
    const frequencies: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];

    const updatePattern = (updates: Partial<RecurrencePattern>) => {
        onChange({ ...pattern, ...updates });
    };

    return (
        <View className="mb-4">
            {/* Frequency Selector */}
            <Text className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Repeat</Text>
            <View className="flex-row gap-2 mb-4">
                {frequencies.map(freq => (
                    <TouchableOpacity
                        key={freq}
                        onPress={() => updatePattern({ frequency: freq })}
                        className={`flex-1 py-2 px-3 rounded-lg border ${pattern.frequency === freq
                                ? 'bg-primary/20 border-primary/30'
                                : 'bg-white/[0.02] border-white/[0.05]'
                            }`}
                    >
                        <Text
                            className={`text-center text-xs font-medium ${pattern.frequency === freq ? 'text-primary' : 'text-gray-500'
                                }`}
                        >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Weekly: Days of Week */}
            {pattern.frequency === 'weekly' && (
                <View className="mb-4">
                    <Text className="text-gray-400 text-xs mb-2">Days</Text>
                    <View className="flex-row gap-1.5">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                            const isSelected = pattern.daysOfWeek?.includes(index) || false;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        const current = pattern.daysOfWeek || [];
                                        const updated = isSelected
                                            ? current.filter(d => d !== index)
                                            : [...current, index].sort();
                                        updatePattern({ daysOfWeek: updated });
                                    }}
                                    className={`w-8 h-8 rounded-full items-center justify-center ${isSelected
                                            ? 'bg-primary'
                                            : 'bg-white/[0.05] border border-white/[0.1]'
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'
                                            }`}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Skip Weekends Toggle */}
            {pattern.frequency === 'daily' && (
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-400 text-sm">Skip weekends</Text>
                    <Switch
                        value={pattern.skipWeekends || false}
                        onValueChange={(value) => updatePattern({ skipWeekends: value })}
                        trackColor={{ false: '#374151', true: '#6366f1' }}
                        thumbColor="#ffffff"
                    />
                </View>
            )}
        </View>
    );
}
