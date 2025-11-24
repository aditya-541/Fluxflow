import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { DailyEnergyData } from '../../services/analyticsService';

interface EnergyLineChartProps {
    data: DailyEnergyData[];
}

export default function EnergyLineChart({ data }: EnergyLineChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    const chartData = data.map(item => ({
        value: item.averageEnergy,
        label: new Date(item.date).getDate().toString(),
        dataPointText: item.averageEnergy.toFixed(1)
    }));

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80;

    return (
        <View className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
            <Text className="text-white/90 text-sm font-medium mb-5 tracking-wide">ENERGY</Text>
            <LineChart
                data={chartData}
                width={chartWidth}
                height={200}
                maxValue={10}
                noOfSections={5}
                areaChart
                curved
                startFillColor="rgba(99, 102, 241, 0.15)"
                endFillColor="rgba(99, 102, 241, 0.01)"
                startOpacity={0.9}
                endOpacity={0.1}
                color="#6366f1"
                thickness={2}
                hideDataPoints={false}
                dataPointsColor="#6366f1"
                dataPointsRadius={3}
                textColor="#6b7280"
                textFontSize={11}
                yAxisColor="transparent"
                xAxisColor="transparent"
                rulesColor="#1f2937"
                yAxisTextStyle={{ color: '#6b7280', fontSize: 11 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                hideRules={false}
                spacing={chartWidth / Math.max(data.length, 1)}
            />
        </View>
    );
}

