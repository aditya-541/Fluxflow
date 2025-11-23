import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-dark">
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#312e81']}
                className="absolute w-full h-full"
            />

            <SafeAreaView className="flex-1 p-6 justify-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-6 z-10 bg-white/10 p-2 rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View className="mb-10">
                    <Text className="text-4xl font-bold text-white mb-2">Welcome Back</Text>
                    <Text className="text-gray-400 text-lg">Sign in to continue your flow.</Text>
                </View>

                <View className="space-y-6">
                    <View>
                        <Text className="text-gray-300 mb-2 font-medium ml-1">Email</Text>
                        <TextInput
                            className="bg-white/5 text-white p-4 rounded-2xl border border-white/10 focus:border-primary focus:bg-white/10 transition-all"
                            placeholder="email@example.com"
                            placeholderTextColor="#6B7280"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-300 mb-2 font-medium ml-1">Password</Text>
                        <TextInput
                            className="bg-white/5 text-white p-4 rounded-2xl border border-white/10 focus:border-primary focus:bg-white/10 transition-all"
                            placeholder="••••••••"
                            placeholderTextColor="#6B7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="w-48 self-center mt-6 shadow-lg shadow-indigo-500/50"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#4f46e5', '#7c3aed', '#db2777']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-3 items-center justify-center rounded-2xl border border-white/20"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-base tracking-widest uppercase">Log In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-400">Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
