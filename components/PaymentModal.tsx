import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { processPseudoPayment } from "@lib/services/paymentService";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface PaymentModalProps {
    visible: boolean;
    amount: number;
    senderId: string;
    receiverId: string;
    referenceId: string; // Booking or Request ID
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({
    visible,
    amount,
    senderId,
    receiverId,
    referenceId,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            await processPseudoPayment(senderId, receiverId, amount, referenceId);
            Alert.alert("Success", "Payment completed successfully!");
            onSuccess();
        } catch (error: any) {
            Alert.alert("Payment Failed", error.message || "Something went wrong.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={!processing ? onClose : () => { }}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Secure Checkout</Text>
                    <Text style={styles.amount}>${amount.toFixed(2)}</Text>

                    <View style={styles.infoBox}>
                        <FontAwesome name="lock" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            This is a pseudo-payment. No real money will be charged.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.payButton, processing && styles.disabledButton]}
                        onPress={handlePayment}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.payButtonText}>Pay Now</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={processing}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    amount: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#0066CC",
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        padding: 12,
        borderRadius: 8,
        marginBottom: 30,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: "#666",
    },
    payButton: {
        backgroundColor: "#0066CC",
        width: "100%",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: "#999",
    },
    payButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#A6192E",
        fontSize: 16,
        fontWeight: "bold",
    },
});
