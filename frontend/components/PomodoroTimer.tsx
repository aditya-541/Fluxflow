import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    work: '#6366f1',
    shortBreak: '#10b981',
    longBreak: '#ec4899',
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
        <View className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
            {/* Mode Selector */}
            <View className="flex-row gap-2 mb-5">
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => switchMode(m)}
                        className={`flex-1 py-2 px-2 rounded-lg ${mode === m ? 'bg-white/[0.08]' : 'bg-white/[0.02]'
                            }`}
                        disabled={isRunning}
                    >
                        <Text className={`text-center text-xs font-medium ${mode === m ? 'text-white' : 'text-gray-500'
                            }`}>
                            {TIMER_LABELS[m]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Timer Display */}
            <View className="items-center mb-5">
                <View className="relative w-40 h-40 items-center justify-center mb-3">
                    {/* Progress Circle */}
                    <View className="absolute w-full h-full rounded-full border-4 border-white/[0.05]" />
                    <View
                        className="absolute w-full h-full rounded-full border-4"
                        style={{
                            borderColor: TIMER_COLORS[mode],
                            transform: [{ rotate: `${progress * 360}deg` }],
                        }}
                    />

                    {/* Time Text */}
                    <Text className="text-5xl font-semibold text-white">
                        {formatTime(timeLeft)}
                    </Text>
                </View>

                {/* Pomodoro Counter */}
                {mode === 'work' && (
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                        <Text className="text-gray-500 text-xs">
                            {completedPomodoros} completed
                        </Text>
                    </View>
                )}
            </View>

            {/* Controls */}
            <View className="flex-row gap-2 justify-center">
                <TouchableOpacity
                    onPress={toggleTimer}
                    className="rounded-xl py-3 px-6 flex-row justify-center items-center border"
                    style={{
                        backgroundColor: `${TIMER_COLORS[mode]}20`,
                        borderColor: `${TIMER_COLORS[mode]}30`,
                    }}
                >
                    <Ionicons
                        name={isRunning ? 'pause' : 'play'}
                        size={18}
                        color={TIMER_COLORS[mode]}
                    />
                    <Text className="font-medium text-sm ml-2" style={{ color: TIMER_COLORS[mode] }}>
                        {isRunning ? 'Pause' : 'Start'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={resetTimer}
                    className="bg-white/[0.05] py-3 px-5 rounded-xl border border-white/[0.05]"
                    disabled={!isRunning && timeLeft === TIMER_DURATIONS[mode]}
                >
                    <Ionicons name="refresh" size={18} color="#6b7280" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
