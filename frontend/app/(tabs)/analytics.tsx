import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import DateRangeSelector from '../../components/DateRangeSelector';
import EnergyLineChart from '../../components/charts/EnergyLineChart';
import TaskCompletionBarChart from '../../components/charts/TaskCompletionBarChart';
import ProductivityHeatmap from '../../components/charts/ProductivityHeatmap';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import {
    getDateRange,
    getEnergyLogsInRange,
    getTasksInRange,
    aggregateEnergyByDay,
    aggregateTasksByDay,
    aggregateTasksByCategory,
    getProductivityHeatmap,
    DailyEnergyData,
    DailyTaskData,
    CategoryData,
    HourlyProductivity
} from '../../services/analyticsService';

export default function Analytics() {
    const { user } = useAuth();
    const [selectedRange, setSelectedRange] = useState(7);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Analytics data state
    const [energyData, setEnergyData] = useState<DailyEnergyData[]>([]);
    const [taskData, setTaskData] = useState<DailyTaskData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [heatmapData, setHeatmapData] = useState<HourlyProductivity[]>([]);

    const fetchAnalytics = async () => {
        if (!user) return;

        try {
            const { startDate, endDate } = getDateRange(selectedRange);

            // Fetch data from Firestore
            const [energyLogs, tasks] = await Promise.all([
                getEnergyLogsInRange(user.uid, startDate, endDate),
                getTasksInRange(user.uid, startDate, endDate)
            ]);

            // Aggregate data
            setEnergyData(aggregateEnergyByDay(energyLogs));
            setTaskData(aggregateTasksByDay(tasks));
            setCategoryData(aggregateTasksByCategory(tasks));
            setHeatmapData(getProductivityHeatmap(energyLogs));
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAnalytics();
    }, [user, selectedRange]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const handleRangeChange = (days: number) => {
        setSelectedRange(days);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#0a0a0f]">
                <SafeAreaView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0a0a0f]">
            <SafeAreaView className="flex-1">
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                >
                    {/* Header */}
                    <View className="mb-8 mt-2">
                        <Text className="text-3xl font-light text-white tracking-tight">Analytics</Text>
                    </View>

                    {/* Date Range Selector */}
                    <View className="mb-8">
                        <DateRangeSelector
                            selectedRange={selectedRange}
                            onRangeChange={handleRangeChange}
                        />
                    </View>

                    {/* Charts */}
                    {energyData.length === 0 && taskData.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-500 text-sm">No data available</Text>
                        </View>
                    ) : (
                        <View className="gap-5">
                            <EnergyLineChart data={energyData} />
                            <TaskCompletionBarChart data={taskData} />
                            <ProductivityHeatmap data={heatmapData} />
                            <CategoryPieChart data={categoryData} />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
