import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
    onComplete?: (mode: TimerMode) => void;
}

const TIMER_DURATIONS = {
    work: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
};

const TIMER_LABELS = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
};

const TIMER_COLORS = {
    work: ['#6366f1', '#8b5cf6'],
    shortBreak: ['#10b981', '#059669'],
    longBreak: ['#ec4899', '#db2777'],
};

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
    const [isRunning, setIsRunning] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        if (mode === 'work') {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);

            // After 4 pomodoros, take a long break
            const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
            Alert.alert(
                '🎉 Focus Session Complete!',
                `Great work! Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break.`,
                [{ text: 'Start Break', onPress: () => switchMode(nextMode) }]
            );
        } else {
            Alert.alert(
                '✨ Break Complete!',
                'Ready to focus again?',
                [{ text: 'Start Focus', onPress: () => switchMode('work') }]
            );
        }

        onComplete?.(mode);
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_DURATIONS[newMode]);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(TIMER_DURATIONS[mode]);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 1 - (timeLeft / TIMER_DURATIONS[mode]);

    return (
        <View className="bg-white/5 p-6 rounded-3xl border border-white/10">
            {/* Mode Selector */}
            <View className="flex-row gap-2 mb-6">
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => switchMode(m)}
                        className={`flex-1 py-2 px-3 rounded-xl ${mode === m ? 'bg-white/10' : 'bg-white/5'
                            }`}
                        disabled={isRunning}
                    >
                        <Text className={`text-center text-sm font-semibold ${mode === m ? 'text-white' : 'text-gray-400'
                            }`}>
                            {TIMER_LABELS[m]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Timer Display */}
            <View className="items-center mb-6">
                <View className="relative w-48 h-48 items-center justify-center mb-4">
                    {/* Progress Circle */}
                    <View className="absolute w-full h-full rounded-full border-4 border-white/10" />
                    <View
                        className="absolute w-full h-full rounded-full border-4"
                        style={{
                            borderColor: TIMER_COLORS[mode][0],
                            transform: [{ rotate: `${progress * 360}deg` }],
                        }}
                    />

                    {/* Time Text */}
                    <Text className="text-6xl font-bold text-white">
                        {formatTime(timeLeft)}
                    </Text>
                </View>

                {/* Pomodoro Counter */}
                {mode === 'work' && (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text className="text-gray-300 font-medium">
                            {completedPomodoros} pomodoros completed today
                        </Text>
                    </View>
                )}
            </View>

            {/* Controls */}
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={toggleTimer}
                    className="flex-1 overflow-hidden rounded-2xl"
                >
                    <LinearGradient
                        colors={TIMER_COLORS[mode]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-4 flex-row justify-center items-center"
                    >
                        <Ionicons
                            name={isRunning ? 'pause' : 'play'}
                            size={24}
                            color="white"
                        />
                        <Text className="text-white font-bold text-lg ml-2">
                            {isRunning ? 'Pause' : 'Start'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={resetTimer}
                    className="bg-white/10 py-4 px-6 rounded-2xl"
                    disabled={!isRunning && timeLeft === TIMER_DURATIONS[mode]}
                >
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
