import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Landing() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-dark">
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                className="absolute w-full h-full"
            />

            <SafeAreaView className="flex-1 items-center justify-center p-6">
                <View className="items-center mb-12">
                    <View className="bg-primary/20 p-6 rounded-full mb-6 border border-primary/30">
                        <Ionicons name="infinite" size={64} color="#8b5cf6" />
                    </View>
                    <Text className="text-5xl font-bold text-white mb-3 tracking-tight">
                        Flux<Text className="text-primary">Flow</Text>
                    </Text>
                    <Text className="text-gray-300 text-xl text-center font-medium leading-relaxed max-w-xs">
                        Adaptive scheduling for your irregular life.
                    </Text>
                </View>

                <View className="w-full items-center space-y-4">
                    <TouchableOpacity
                        className="w-64 shadow-lg shadow-indigo-500/50"
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <LinearGradient
                            colors={['#4f46e5', '#7c3aed', '#db2777']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 items-center justify-center rounded-2xl border border-white/20"
                        >
                            <Text className="text-white text-center font-bold text-lg tracking-widest uppercase">Get Started</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity className="w-48 py-3">
                            <Text className="text-gray-400 text-center font-medium text-base tracking-wide">Already have an account? <Text className="text-white font-bold">Log In</Text></Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SafeAreaView>
        </View>
    );
}
