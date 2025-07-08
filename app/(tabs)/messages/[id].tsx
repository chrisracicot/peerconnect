import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface Message {
    id: number;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface Profile {
    id: string;
    full_name: string;
}

// UUID validation function
const isValidUUID = (id: string | string[]): id is string => {
    if (Array.isArray(id)) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

export default function ChatScreen() {
    const { id: receiverId } = useLocalSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [recipient, setRecipient] = useState<Profile | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Validate and extract receiverId
    const receiverIdStr = isValidUUID(receiverId) ? receiverId : null;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    router.push('/');
                    return;
                }
                setCurrentUserId(user.id);

                if (!receiverIdStr) {
                    setError('Invalid chat participant');
                    setLoading(false);
                    return;
                }

                // Fetch recipient profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('id', receiverIdStr)
                    .single();

                if (profileError || !profile) {
                    setError('Failed to load chat participant');
                    throw profileError;
                }
                setRecipient(profile);
            } catch (err) {
                console.error('Error fetching user:', err);
                setLoading(false);
            }
        };
        fetchUser();
    }, [receiverIdStr]);

    useEffect(() => {
        if (!currentUserId || !receiverIdStr) return;

        const fetchMessages = async () => {
            try {
                setError(null);
                const { data, error: fetchError } = await supabase
                    .from('messages')
                    .select('*')
                    .or(
                        `and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverIdStr}),` +
                        `and(sender_id.eq.${receiverIdStr},receiver_id.eq.${currentUserId})`
                    )
                    .order('created_at', { ascending: true });

                if (fetchError) throw fetchError;
                setMessages(data || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const subscription = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverIdStr}),and(sender_id.eq.${receiverIdStr},receiver_id.eq.${currentUserId}))`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setMessages(prev => [...prev, payload.new as Message]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentUserId, receiverIdStr]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUserId || !receiverIdStr) return;

        const tempId = Date.now();
        const newMsg = {
            id: tempId,
            sender_id: currentUserId,
            receiver_id: receiverIdStr,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            is_read: false
        };

        // Optimistic update
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');

        try {
            const { error } = await supabase.from('messages').insert({
                sender_id: currentUserId,
                receiver_id: receiverIdStr,
                content: newMessage.trim()
            });

            if (error) throw error;
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setError('Failed to send message');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isCurrentUser = item.sender_id === currentUserId;
        return (
            <View
                style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                ]}
            >
                <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
                    {item.content}
                </Text>
                <Text style={styles.messageTime}>
                    {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A6192E" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.push('/(tabs)/messages')}
                    >
                        <Ionicons name="arrow-back" size={24} color="#A6192E" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Error</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            setLoading(true);
                            setCurrentUserId('');
                        }}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button and recipient name */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.push('/(tabs)/messages')}
                >
                    <Ionicons name="arrow-back" size={24} color="#A6192E" />
                </Pressable>
                <Text style={styles.headerTitle}>
                    {recipient?.full_name || 'Chat'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.messagesList}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        !newMessage.trim() && styles.disabledButton
                    ]}
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: 'white'
    },
    backButton: {
        padding: 4
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        color: '#A6192E',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    },
    retryButton: {
        backgroundColor: '#A6192E',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    messagesList: {
        padding: 10,
        paddingBottom: 80
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#A6192E',
        borderBottomRightRadius: 2
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 2
    },
    currentUserText: {
        color: 'white',
        fontSize: 16
    },
    otherUserText: {
        color: 'black',
        fontSize: 16
    },
    messageTime: {
        fontSize: 10,
        color: '#DDD',
        marginTop: 4,
        textAlign: 'right'
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#DDD',
        backgroundColor: '#FFF',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        backgroundColor: '#FFF'
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A6192E',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        minWidth: 70
    },
    disabledButton: {
        opacity: 0.5
    },
    sendButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    }
});