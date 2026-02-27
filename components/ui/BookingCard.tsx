// components/ui/BookingCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Booking } from "@lib/services/bookService";
import { format } from "date-fns";

interface BookingCardProps {
    booking: Booking;
    onPress?: () => void;
}


const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.content}>
                <Text style={styles.title}>{booking.title}</Text>
                <Text style={styles.date}>
                    {format(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a")}
                </Text>
                <View style={styles.statusContainer}>
                    <Text
                        style={[
                            styles.status,
                            booking.status === "confirmed" && styles.statusConfirmed,
                            booking.status === "canceled" && styles.statusCanceled,
                        ]}
                    >
                        {booking.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    statusContainer: {
        alignSelf: "flex-start",
    },
    status: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFA500", // pending - orange
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: "#FFF3E0",
    },
    statusConfirmed: {
        color: "#4CAF50", // confirmed - green
        backgroundColor: "#E8F5E9",
    },
    statusCanceled: {
        color: "#F44336", // canceled - red
        backgroundColor: "#FFEBEE",
    },
});

export default BookingCard;