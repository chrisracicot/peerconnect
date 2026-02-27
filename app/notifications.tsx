import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "context/AuthContext";
import { getUserNotifications, markNotificationAsRead } from "@lib/services/notificationService";

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.id) return;
        getUserNotifications(user.id).then(setNotifications);
    }, [user?.id]);

    const handlePressNotification = async (item: any) => {
        if (!item.is_read) {
            await markNotificationAsRead(item.id);
            setNotifications(notifications.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        }

        if (item.type === "message" || item.type === "booking") {
            router.push("/(tabs)/messages");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0066CC" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
                        onPress={() => handlePressNotification(item)}
                    >
                        <Text style={[styles.message, !item.is_read && styles.unreadMessage]}>
                            {item.message}
                        </Text>
                        <Text style={styles.date}>
                            {new Date(item.created_at).toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>You have no notifications right now.</Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    notificationCard: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        backgroundColor: "#FFF",
    },
    unreadCard: {
        backgroundColor: "#F0F8FF",
    },
    message: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    unreadMessage: {
        fontWeight: "bold",
    },
    date: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        marginTop: 40,
        fontStyle: "italic",
    }
});
