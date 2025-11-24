import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategoryData } from '../../services/analyticsService';
import { getCategoryConfig } from '../../constants/categories';

interface CategoryPieChartProps {
    data: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = data.map(item => {
        const config = getCategoryConfig(item.category);
        return {
            value: item.count,
            color: config.color,
            text: `${item.percentage.toFixed(0)}%`,
            label: config.label
        };
    });

    const totalTasks = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <View className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
            <Text className="text-white/90 text-sm font-medium mb-5 tracking-wide">CATEGORIES</Text>

            <View className="items-center mb-5">
                <PieChart
                    data={chartData}
                    radius={90}
                    innerRadius={55}
                    donut
                    showText
                    textColor="#fff"
                    textSize={11}
                    fontWeight="600"
                    centerLabelComponent={() => (
                        <View className="items-center">
                            <Text className="text-white text-2xl font-semibold">
                                {totalTasks}
                            </Text>
                            <Text className="text-gray-500 text-[10px] uppercase tracking-wider">Total</Text>
                        </View>
                    )}
                />
            </View>

            {/* Legend */}
            <View className="flex-row flex-wrap gap-3">
                {data.map((item) => {
                    const config = getCategoryConfig(item.category);
                    return (
                        <View key={item.category} className="flex-row items-center">
                            <View
                                className="w-2 h-2 rounded-full mr-1.5"
                                style={{ backgroundColor: config.color }}
                            />
                            <Text className="text-gray-400 text-[11px]">
                                {config.label} {item.count}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
