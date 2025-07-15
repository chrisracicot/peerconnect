// app/(tabs)/ask/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";
import { getCurrentUserId } from "@lib/supabase/userService";
import { fetchRequests } from "@lib/supabase/requestsService";
import Header from "@components/ui/Header";

export default function AskScreen() {
  const router = useRouter();
  const { requests, setRequests } = useFormData();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    } catch (error) {
      console.error("Error loading user ID:", error);
    }
  };

  const loadRequests = async () => {
    try {
      const fetchedRequests = await fetchRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  // Auto-refresh list on focus
  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  // Helper function to check if request is expired (15 days)
  const isRequestExpired = (createDate: string): boolean => {
    const created = new Date(createDate);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff > 15;
  };

  // Filter and separate user's requests into active and expired
  const userRequests = requests.filter(
    (item) => item && item.user_id === currentUserId
  );
  const activeRequests = userRequests.filter(
    (item) => !isRequestExpired(item.create_date)
  );
  const expiredRequests = userRequests.filter((item) =>
    isRequestExpired(item.create_date)
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Requests</Text>
          {activeRequests.length > 0 ? (
            activeRequests.map((item) => (
              <RequestCard
                key={item.request_id}
                item={item}
                isExpired={false}
                showActions={false} // Only show card, navigation handled in RequestCard
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active requests</Text>
              <Text style={styles.emptySubtext}>
                Create your first request to get started!
              </Text>
            </View>
          )}
        </View>

        {/* Expired Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired Requests</Text>
          {expiredRequests.length > 0 ? (
            expiredRequests.map((item) => (
              <RequestCard
                key={item.request_id}
                item={item}
                isExpired={true}
                showActions={false} // All actions handled in detail page
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expired requests</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/ask/form")}
      >
        <Text style={styles.createText}>Create New Request</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginHorizontal: 20,
    marginTop: 15,
  },
  emptyContainer: {
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  createButton: {
    margin: 16,
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
