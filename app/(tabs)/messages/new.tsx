import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

interface User {
    id: string;
    full_name: string;
}

export default function NewChatScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]); // Properly typed state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .neq('id', user.id)
                .order('full_name', { ascending: true });

            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setUsers(data as User[]); // Type assertion here
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <Text>Loading users...</Text>
            ) : users.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No users found</Text>
                    <Text style={styles.emptySubtext}>Check your database connection</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.userItem}
                            onPress={() => router.push(`/(tabs)/messages/${item.id}`)}
                        >
                            <Text style={styles.userName}>{item.full_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5',
    },
    userItem: {
        padding: 16,
        marginBottom: 8,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    userName: {
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
});