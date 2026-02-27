import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { deleteRequest } from "@lib/services/requestsService";
import { getPendingReports, resolveReport, Report } from "@lib/services/reportService";

export default function AdminDashboard() {
    const router = useRouter();
    const { signOut } = useAuth();

    const [requests, setRequests] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"requests" | "users" | "reports">("requests");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all requests
            const { data: reqData, error: reqError } = await supabase
                .from("request")
                .select("*")
                .order("create_date", { ascending: false });

            if (reqError) throw reqError;
            setRequests(reqData || []);

            // Fetch all profiles
            const { data: profData, error: profError } = await supabase
                .from("profiles")
                .select("*");

            if (profError) throw profError;
            setProfiles(profData || []);

            // Fetch reports
            const reps = await getPendingReports();
            setReports(reps);

        } catch (err: any) {
            console.error("Admin fetch error:", err);
            Alert.alert("Error", "Could not load admin data.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace("/");
    };

    const handleDeleteRequest = async (id: number) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this request?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        // Attempt to delete. Note: Requires RLS to allow admin deletion.
                        await deleteRequest(id);
                        setRequests(requests.filter(r => r.request_id !== id));
                        Alert.alert("Success", "Request deleted.");
                    } catch (err: any) {
                        console.error("Delete request error:", err);
                        Alert.alert("Permission Denied", "Your Supabase RLS policies block admin deletions. Please update your Postgres policies to allow admins to delete records.");
                    }
                }
            }
        ]);
    };

    const handleDeleteUser = async (id: string) => {
        Alert.alert("Confirm Ban", "Are you sure you want to ban/delete this user?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Ban User",
                style: "destructive",
                onPress: async () => {
                    Alert.alert("Permission Denied", "Cannot delete users directly from the client without Supabase Admin privileges. Please use the Supabase Auth Dashboard or a secure Edge Function to ban users.");
                }
            }
        ]);
    };

    const handleResolveReport = async (id: string) => {
        Alert.alert("Resolve Report", "Mark this report as reviewed and resolved?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Resolve",
                style: "default",
                onPress: async () => {
                    try {
                        await resolveReport(id);
                        setReports(reports.filter(r => r.id !== id));
                        Alert.alert("Success", "Report resolved.");
                    } catch (e) { Alert.alert("Error", "Could not resolve report."); }
                }
            }
        ]);
    };

    const renderRequestRecord = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>Course: {item.course_id} | Status: {item.status}</Text>
                <Text style={styles.cardDetail} numberOfLines={2}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRequest(item.request_id)}
            >
                <FontAwesome name="trash" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderUserRecord = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.full_name || "Unknown Name"}</Text>
                <Text style={styles.cardSubtitle}>ID: {item.id}</Text>
                <Text style={styles.cardDetail}>{item.verified ? "Verified ✅" : "Unverified"}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item.id)}
            >
                <FontAwesome name="ban" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderReportRecord = ({ item }: { item: Report }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Report: {item.target_type}</Text>
                <Text style={styles.cardSubtitle}>Target ID: {item.target_id}</Text>
                <Text style={styles.cardDetail} numberOfLines={2}>Reason: {item.reason}</Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 5 }}>Target ID: {item.target_id}</Text>
            </View>
            <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: "#28a745" }]}
                onPress={() => handleResolveReport(item.id)}
            >
                <FontAwesome name="check" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "requests" && styles.activeTab]}
                    onPress={() => setActiveTab("requests")}
                >
                    <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>Manage Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "users" && styles.activeTab]}
                    onPress={() => setActiveTab("users")}
                >
                    <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>Manage Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "reports" && styles.activeTab]}
                    onPress={() => setActiveTab("reports")}
                >
                    <Text style={[styles.tabText, activeTab === "reports" && styles.activeTabText]}>Reports</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={activeTab === "requests" ? requests : activeTab === "reports" ? reports : profiles}
                        keyExtractor={(item: any) => activeTab === "requests" ? item.request_id.toString() : item.id}
                        renderItem={({ item }: { item: any }) => activeTab === "requests" ? renderRequestRecord({ item }) : activeTab === "reports" ? renderReportRecord({ item }) : renderUserRecord({ item })}
                        contentContainerStyle={{ padding: 15 }}
                        ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1f1f1f",
        padding: 20,
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    logoutBtn: {
        backgroundColor: "#d9534f",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    logoutText: {
        color: "#fff",
        fontWeight: "bold",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: "#0066CC",
    },
    tabText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#0066CC",
    },
    content: {
        flex: 1,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    cardSubtitle: {
        fontSize: 12,
        color: "#0066CC",
        marginTop: 4,
        fontWeight: "600",
    },
    cardDetail: {
        fontSize: 14,
        color: "#666",
        marginTop: 6,
    },
    deleteButton: {
        backgroundColor: "#d9534f",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 15,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        color: "#999",
        fontStyle: "italic",
    },
});
