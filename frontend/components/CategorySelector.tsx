import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskCategory } from '../services/taskService';
import { TASK_CATEGORIES } from '../constants/categories';

interface CategorySelectorProps {
    selectedCategory?: TaskCategory;
    onSelect: (category: TaskCategory) => void;
}

export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
    return (
        <View className="mb-6">
            <Text className="text-gray-300 mb-3 font-medium ml-1">Category</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                className="flex-row gap-3"
            >
                {TASK_CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => onSelect(category.id)}
                            className={`px-4 py-3 rounded-xl flex-row items-center border-2 ${isSelected ? 'border-white/30' : 'border-white/10'
                                }`}
                            style={{
                                backgroundColor: isSelected ? category.bgColor : 'rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={20}
                                color={isSelected ? category.color : '#9CA3AF'}
                            />
                            <Text
                                className={`ml-2 font-semibold ${isSelected ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
