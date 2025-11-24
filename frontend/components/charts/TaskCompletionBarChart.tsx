import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { DailyTaskData } from '../../services/analyticsService';

interface TaskCompletionBarChartProps {
    data: DailyTaskData[];
}

export default function TaskCompletionBarChart({ data }: TaskCompletionBarChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = data.map(item => ({
        value: item.completed,
        label: new Date(item.date).getDate().toString(),
        frontColor: item.completed === item.total ? '#10b981' : '#6366f1',
        topLabelComponent: () => (
            <Text style={{ color: '#6b7280', fontSize: 9, marginBottom: 2 }}>
                {item.completed}/{item.total}
            </Text>
        )
    }));

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80;
    const maxValue = Math.max(...data.map(d => d.total), 5);

    return (
        <View className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
            <Text className="text-white/90 text-sm font-medium mb-5 tracking-wide">TASKS</Text>
            <BarChart
                data={chartData}
                width={chartWidth}
                height={200}
                maxValue={maxValue}
                noOfSections={5}
                barWidth={Math.min(28, chartWidth / (data.length * 2))}
                barBorderRadius={3}
                yAxisColor="transparent"
                xAxisColor="transparent"
                rulesColor="#1f2937"
                yAxisTextStyle={{ color: '#6b7280', fontSize: 11 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                spacing={chartWidth / Math.max(data.length + 1, 1)}
                hideRules={false}
            />
        </View>
    );
}

