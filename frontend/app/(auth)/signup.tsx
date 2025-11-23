import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert('Signup Failed', error.message);
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
                    <Text className="text-4xl font-bold text-white mb-2">Create Account</Text>
                    <Text className="text-gray-400 text-lg">Join the flow state.</Text>
                </View>

                <View className="space-y-6">
                    <View>
                        <Text className="text-gray-300 mb-2 font-medium ml-1">Email</Text>
                        <TextInput
                            className="bg-white/5 text-white p-4 rounded-2xl border border-white/10 focus:border-secondary focus:bg-white/10 transition-all"
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
                            className="bg-white/5 text-white p-4 rounded-2xl border border-white/10 focus:border-secondary focus:bg-white/10 transition-all"
                            placeholder="••••••••"
                            placeholderTextColor="#6B7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="w-full overflow-hidden rounded-2xl shadow-lg shadow-secondary/25 mt-4"
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#ec4899', '#db2777']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="py-4 items-center justify-center"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg tracking-wide">Sign Up</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-400">Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-secondary font-bold">Log In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
