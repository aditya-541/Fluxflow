import { View, Text, TouchableOpacity } from 'react-native';

interface DateRangeSelectorProps {
    selectedRange: number;
    onRangeChange: (days: number) => void;
}

export default function DateRangeSelector({ selectedRange, onRangeChange }: DateRangeSelectorProps) {
    const ranges = [
        { label: '7D', days: 7 },
        { label: '14D', days: 14 },
        { label: '30D', days: 30 }
    ];

    return (
        <View className="flex-row bg-white/[0.02] rounded-xl p-1 border border-white/[0.05]">
            {ranges.map((range) => (
                <TouchableOpacity
                    key={range.days}
                    onPress={() => onRangeChange(range.days)}
                    className={`flex-1 py-2.5 px-4 rounded-lg ${selectedRange === range.days ? 'bg-primary/20' : ''
                        }`}
                >
                    <Text
                        className={`text-center text-xs font-medium tracking-wide ${selectedRange === range.days ? 'text-primary' : 'text-gray-500'
                            }`}
                    >
                        {range.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}
