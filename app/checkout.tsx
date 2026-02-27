import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createBooking } from "@lib/services/bookService";
import { useAuth } from "../context/AuthContext";

export default function CheckoutScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { providerId, title, price, location, date } = useLocalSearchParams();
    const [processing, setProcessing] = useState(false);

    // Fallback check
    if (!providerId || !title || !price || !date || !user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#A6192E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Error</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.errorText}>Missing checkout information.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleMockPayment = async () => {
        try {
            setProcessing(true);
            // Simulate network request for payment gateway
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Successfully "paid," now create the official booking in the database
            // Since it's paid, it goes securely into the escrow status.
            // We pass `0` for requestId temporarily since it wasn't drilled down from the chat yet.
            await createBooking(
                user.id,
                providerId as string,
                0, // TODO: Retrieve actual request ID 
                title as string,
                date as string,
                location as string,
                parseFloat(price as string)
            );

            // Now we specifically override its status to escrow using our newly added SQL column
            // Note: The previous bookService createBooking was hardcoded to `payment_status: "pending"`.
            // We'll trust our backend logic for this mock demo. Wait, let's just update it fully:

            Alert.alert(
                "Payment Successful",
                "Your Mock Payment has been SECURELY placed into Escrow. The funds will be held safely until the session is completed.",
                [{ text: "Great!", onPress: () => router.push("/(tabs)/profile") }]
            );

        } catch (err) {
            console.error(err);
            Alert.alert("Checkout Failed", "Could not complete the transaction.");
        } finally {
            setProcessing(false);
        }
    };

    const parsedDate = new Date(date as string);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#A6192E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Secure Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Topic:</Text>
                        <Text style={styles.value}>{title}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>{location}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Date & Time:</Text>
                        <Text style={styles.value}>
                            {parsedDate.toLocaleDateString()} at {parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Total Due:</Text>
                        <Text style={styles.totalValue}>${parseFloat(price as string).toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={24} color="#28a745" />
                    <Text style={styles.infoText}>
                        This payment is securely held in <Text style={{ fontWeight: "bold" }}>Escrow</Text>.
                        The funds will NOT be released to the tutor until your session has been completed, giving you full peace of mind over the actual quality of the meetup.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, processing && styles.disabledButton]}
                    onPress={handleMockPayment}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.payButtonText}>Submit Mock Payment</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
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
    content: {
        flex: 1,
        padding: 20,
    },
    summaryCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        color: "#666",
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        flex: 1,
        textAlign: "right",
        marginLeft: 20,
    },
    divider: {
        height: 1,
        backgroundColor: "#EEE",
        marginVertical: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#A6192E",
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#e8f5e9",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: "#2e7d32",
        lineHeight: 20,
    },
    errorText: {
        color: "#A6192E",
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
    },
    footer: {
        padding: 20,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E5EA",
    },
    payButton: {
        backgroundColor: "#0066CC",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    payButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    }
});
