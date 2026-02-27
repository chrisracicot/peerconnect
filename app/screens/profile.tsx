import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "context/AuthContext";
import { fetchRequests } from "@lib/services/requestsService";
import { getProfileById, updateProfileById } from "@lib/services/profileService";
import { getBookingsForUser, updateBookingEscrow, Booking } from "@lib/services/bookService";
import { getUserAvailability, addAvailabilitySlot, deleteAvailabilitySlot, AvailabilitySlot } from "@lib/services/availabilityService";
import { getUserAverageRating } from "@lib/services/reviewService";
import { uploadBase64Image } from "@lib/services/storageService";
import type { UserProfile } from "@models/profile";
import Header from "@components/ui/Header";
import ReviewModal from "@components/ReviewModal";

function Icon(props: any) {
    return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
}

const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const [editMode, setEditMode] = useState(false);
    const [bio, setBio] = useState("Placeholder Bio");

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [postedRequests, setPostedRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [selectedRevieweeId, setSelectedRevieweeId] = useState<string>("");

    const [rating, setRating] = useState<{ average: number, count: number } | null>(null);

    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

    // Form fields for new slots
    const [newDay, setNewDay] = useState("");
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");

    useEffect(() => {
        fetchRequests()
            .then(setPostedRequests)
            .catch((err) => console.error(err))
            .finally(() => setLoadingRequests(false));
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        getProfileById(user.id)
            .then(setProfile)
            .catch((err) => console.error(err))
            .finally(() => setLoadingProfile(false));

        getUserAverageRating(user.id)
            .then(setRating)
            .catch((err) => console.error(err));

        getUserAvailability(user.id)
            .then(setAvailability)
            .catch((err) => console.error(err));

        // Fetch Bookings
        getBookingsForUser(user.id)
            .then(setBookings)
            .catch((err) => console.error(err))
            .finally(() => setLoadingBookings(false));

    }, [user?.id]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Account",
            "This feature is not available yet. Contact admin or implement a server function.",
            [{ text: "OK" }]
        );
    };

    const handleEdit = async () => {
        if (editMode && user?.id && profile) {
            const { error } = await updateProfileById(user.id, {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
            });

            if (error) {
                console.warn("Failed to update profile:", error);
                Alert.alert("Error", "Profile update failed.");
            } else {
                Alert.alert("Success", "Profile updated.");
            }
        }

        setEditMode((prev) => !prev);
    };

    const handleAddSlot = async () => {
        if (!user || !newDay || !newStart || !newEnd) {
            Alert.alert("Missing Fields", "Please fill out day, start, and end times.");
            return;
        }
        try {
            const slot = await addAvailabilitySlot(user.id, newDay as any, newStart, newEnd);
            setAvailability([...availability, slot]);
            setNewDay("");
            setNewStart("");
            setNewEnd("");
        } catch (e) { Alert.alert("Error", "Could not add slot. Ensure day is capitalized like 'Monday'."); }
    };

    const handleDeleteSlot = async (id: string) => {
        try {
            await deleteAvailabilitySlot(id);
            setAvailability(availability.filter(a => a.id !== id));
        } catch (e) { Alert.alert("Error", "Could not delete slot."); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.heading}>Profile</Text>
                    <TouchableOpacity onPress={handleEdit}>
                        <Icon name={editMode ? "check" : "pencil"} color="#0066CC" />
                    </TouchableOpacity>
                </View>

                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <Image
                            source={require("../../assets/images/avatar.png")}
                            style={styles.avatar}
                        />
                    )}
                    <Text style={styles.name}>
                        {loadingProfile ? "Loading..." : profile?.full_name ?? user?.email}
                    </Text>
                    {rating && rating.count > 0 && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                            <FontAwesome name="star" color="#FFD700" size={16} />
                            <Text style={{ marginLeft: 5, fontSize: 16, fontWeight: "bold" }}>
                                {rating.average.toFixed(1)}
                            </Text>
                            <Text style={{ marginLeft: 5, color: "#666" }}>
                                ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                            </Text>
                        </View>
                    )}
                    {profile?.verified && (
                        <Text style={{ color: "green" }}>✔ Verified</Text>
                    )}
                    <Text style={styles.studentId}>{user?.id.slice(0, 8)}</Text>
                </View>

                {/* Bio section */}
                {editMode && (
                    <View style={styles.editFields}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={profile?.full_name ?? ""}
                            onChangeText={(text) =>
                                setProfile((prev) => prev && { ...prev, full_name: text })
                            }
                        />

                        {/* Avatar Upload Placeholder */}
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ['images'],
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                        quality: 0.5,
                                        base64: true,
                                    });

                                    if (!result.canceled && result.assets[0].base64 && user) {
                                        setUploadingImage(true);
                                        // Upload to Supabase Storage
                                        const filePath = `${user.id}/${new Date().getTime()}.jpg`;
                                        const publicUrl = await uploadBase64Image(
                                            "avatars",
                                            filePath,
                                            result.assets[0].base64,
                                            "image/jpeg"
                                        );
                                        // Optimistically update the local state so the user sees it immediately
                                        setProfile((prev) => prev && { ...prev, avatar_url: publicUrl });
                                        setUploadingImage(false);
                                    }
                                } catch (error) {
                                    console.error("Image pick error:", error);
                                    Alert.alert("Error", "Could not upload image.");
                                    setUploadingImage(false);
                                }
                            }}
                            style={styles.avatarEditButton}
                            disabled={uploadingImage}
                        >
                            <Text style={{ color: "#0066CC", fontWeight: "bold" }}>
                                {uploadingImage ? "Uploading..." : "Change Avatar"}
                            </Text>
                        </TouchableOpacity>

                        {/* Manage Availability */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.sectionTitle}>Manage Availability</Text>
                            {availability.map(slot => (
                                <View key={slot.id} style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#f9f9f9", marginBottom: 5, borderRadius: 5 }}>
                                    <Text>{slot.day_of_week}:   {slot.start_time} - {slot.end_time}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteSlot(slot.id)}>
                                        <FontAwesome name="trash" color="#FF6B6B" size={18} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={{ flexDirection: "row", marginTop: 10, gap: 5 }}>
                                <TextInput
                                    style={[styles.input, { flex: 2, marginBottom: 0 }]}
                                    placeholder="Day (e.g. Monday)"
                                    value={newDay}
                                    onChangeText={setNewDay}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1.5, marginBottom: 0 }]}
                                    placeholder="Start (9 AM)"
                                    value={newStart}
                                    onChangeText={setNewStart}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1.5, marginBottom: 0 }]}
                                    placeholder="End (5 PM)"
                                    value={newEnd}
                                    onChangeText={setNewEnd}
                                />
                            </View>
                            <TouchableOpacity style={styles.avatarEditButton} onPress={handleAddSlot}>
                                <Text style={{ color: "#0066CC", fontWeight: "bold" }}>+ Add Slot</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Availability */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Tutor Availability</Text>
                    {availability.length > 0 ? (
                        availability.map((item) => (
                            <View key={item.id} style={styles.scheduleItem}>
                                <Text style={styles.scheduleCourse}>{item.day_of_week}</Text>
                                <Text style={styles.scheduleDetails}>
                                    {item.start_time} to {item.end_time}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyItalic}>No availability slots posted.</Text>
                    )}
                </View>

                {/* Booked Sessions / Escrow */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Booked Sessions</Text>
                    {!loadingBookings && bookings.length === 0 ? (
                        <Text style={styles.emptyItalic}>No sessions booked yet.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {bookings.map((item) => {
                                const isStudentA = item.requester_id === user?.id; // The one paying
                                const sessionDate = new Date(item.date);
                                const isPast = sessionDate < new Date();

                                return (
                                    <View key={item.id.toString()} style={[styles.bookingCard, item.payment_status === "escrow" && styles.escrowCard]}>
                                        <View style={styles.bookingHeader}>
                                            <View style={[styles.statusBadge, { backgroundColor: item.payment_status === "escrow" ? "#FFC107" : "#28a745" }]}>
                                                <Text style={styles.statusText}>{item.payment_status.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.scheduleDetails}>
                                            {sessionDate.toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.scheduleDetails}>
                                            ${item.price} • {item.location}
                                        </Text>

                                        {isStudentA && item.payment_status === "escrow" && isPast && (
                                            <TouchableOpacity
                                                style={styles.releaseFundsBtn}
                                                onPress={async () => {
                                                    try {
                                                        await updateBookingEscrow(item.id, "released");
                                                        setBookings(bookings.map(b => b.id === item.id ? { ...b, payment_status: "released" } : b));
                                                        Alert.alert("Funds Released", "The escrow finds have been successfully released to the tutor.");
                                                    } catch (e) {
                                                        Alert.alert("Error", "Could not release funds.");
                                                    }
                                                }}
                                            >
                                                <Text style={styles.releaseFundsText}>Release Funds</Text>
                                            </TouchableOpacity>
                                        )}

                                        {isStudentA && (item.payment_status === "released" || item.status === "completed") && (
                                            <TouchableOpacity
                                                style={[styles.releaseFundsBtn, { backgroundColor: "#FFD700" }]}
                                                onPress={() => {
                                                    setSelectedBookingId(item.id);
                                                    setSelectedRevieweeId(item.provider_id);
                                                    setReviewModalVisible(true);
                                                }}
                                            >
                                                <Text style={[styles.releaseFundsText, { color: "#333" }]}>Leave Review</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Posted Requests */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Posted Requests</Text>
                    {!loadingRequests && postedRequests.filter((req) => req.user_id === user?.id).length === 0 ? (
                        <Text
                            style={{
                                color: "#999",
                                fontStyle: "italic",
                                textAlign: "center",
                                marginTop: 10,
                            }}
                        >
                            No requests posted yet.
                        </Text>
                    ) : (
                        postedRequests.filter((req) => req.user_id === user?.id).map((item) => (
                            <TouchableOpacity
                                key={item.request_id.toString()}
                                style={styles.requestCard}
                                onPress={() => router.push({
                                    pathname: `/(request)/[id]` as any,
                                    params: { id: item.request_id }
                                })}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <TouchableOpacity
                                        onPress={() => router.push({
                                            pathname: `/(tabs)/messages/[id]` as any,
                                            params: {
                                                id: item.user_id,
                                                initialMessage: `Re: ${item.title}`
                                            }
                                        })}
                                    >
                                        <Icon name="comment-o" color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.description}>{item.description}</Text>
                                <View style={styles.tagsContainer}>
                                    {item.tags?.map((tag: string) => (
                                        <Text key={tag} style={styles.tag}>
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Temporary Logout */}
                <TouchableOpacity
                    style={{
                        backgroundColor: "#FF6B6B",
                        padding: 15,
                        margin: 20,
                        borderRadius: 8,
                        alignItems: "center",
                    }}
                    onPress={async () => {
                        await signOut();
                        router.replace("/(auth)" as any);
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Log Out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                        padding: 15,
                        backgroundColor: "#ccc",
                        marginTop: 10,
                        margin: 20,
                        borderRadius: 8,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#333" }}>Delete Account (Provisional)</Text>
                </TouchableOpacity>

                {user && (
                    <ReviewModal
                        visible={reviewModalVisible}
                        bookingId={selectedBookingId}
                        reviewerId={user.id}
                        revieweeId={selectedRevieweeId}
                        onClose={() => setReviewModalVisible(false)}
                        onSuccess={() => {
                            setReviewModalVisible(false);
                            Alert.alert("Success", "Review submitted!");
                        }}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#DDD",
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
        flex: 1,
        textAlign: "center",
    },
    avatarContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: "#0066CC",
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 10,
    },
    studentId: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },
    editFields: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
    },
    bioSection: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    bioLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    bioText: {
        fontSize: 14,
        color: "#666",
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scheduleItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    scheduleCourse: {
        fontSize: 16,
        fontWeight: "bold",
    },
    scheduleDetails: {
        fontSize: 14,
        color: "#666",
    },
    requestCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    description: {
        color: "#666",
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    tag: {
        backgroundColor: "#EAEAEA",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 5,
        marginBottom: 5,
        fontSize: 12,
        color: "#666",
    },
    avatarEditButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#0066CC",
        alignItems: "center",
        alignSelf: "center",
    },
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginRight: 10,
        width: 220,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    escrowCard: {
        borderWidth: 1,
        borderColor: "#FFC107",
        backgroundColor: "#FFFAF0",
    },
    bookingHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    releaseFundsBtn: {
        backgroundColor: "#0066CC",
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    releaseFundsText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
    emptyItalic: {
        color: "#999",
        fontStyle: "italic",
        marginTop: 5,
    }
});

export default ProfileScreen;
