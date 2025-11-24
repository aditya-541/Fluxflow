import { View, Text } from 'react-native';
import { HourlyProductivity } from '../../services/analyticsService';

interface ProductivityHeatmapProps {
    data: HourlyProductivity[];
}

export default function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
    if (!data || data.length === 0) {
        return null;
    }

    // Get color based on energy level
    const getColor = (energy: number, count: number) => {
        if (count === 0) return 'rgba(31, 41, 55, 0.3)';
        if (energy >= 8) return 'rgba(16, 185, 129, 0.6)';
        if (energy >= 6) return 'rgba(99, 102, 241, 0.6)';
        if (energy >= 4) return 'rgba(251, 191, 36, 0.6)';
        return 'rgba(239, 68, 68, 0.6)';
    };

    // Format hour for display
    const formatHour = (hour: number) => {
        if (hour === 0) return '12a';
        if (hour === 12) return '12p';
        if (hour < 12) return `${hour}a`;
        return `${hour - 12}p`;
    };

    // Group hours into rows of 6
    const rows = [];
    for (let i = 0; i < 24; i += 6) {
        rows.push(data.slice(i, i + 6));
    }

    return (
        <View className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
            <Text className="text-white/90 text-sm font-medium mb-5 tracking-wide">PEAK HOURS</Text>

            {/* Heatmap Grid */}
            <View>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row mb-2">
                        {row.map((hourData) => (
                            <View key={hourData.hour} className="flex-1 mr-2 last:mr-0">
                                <View
                                    className="rounded-lg p-2.5 items-center justify-center"
                                    style={{
                                        backgroundColor: getColor(hourData.averageEnergy, hourData.count),
                                        minHeight: 52
                                    }}
                                >
                                    <Text className="text-white/80 text-[10px] font-medium mb-0.5">
                                        {formatHour(hourData.hour)}
                                    </Text>
                                    {hourData.count > 0 && (
                                        <Text className="text-white/60 text-[9px]">
                                            {hourData.averageEnergy.toFixed(1)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}
