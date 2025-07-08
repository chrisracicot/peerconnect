// ask.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFormData, RequestData } from "../../context/FormContext"; // Import RequestData type

const ListScreen = () => {
  const router = useRouter();
  const {
    activeRequests,
    expiredRequests,
    deleteRequest,
    fetchRequests,
    loading,
  } = useFormData();

  // Handle delete with confirmation
  const handleDelete = (requestId: number, title: string) => {
    Alert.alert(
      "Delete Request",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRequest(requestId),
        },
      ]
    );
  };

  // Format description preview
  const formatDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  // Render request card
  const renderRequestCard = (item: RequestData) => {
    if (!item.request_id) return null;

    return (
      <TouchableOpacity
        key={item.request_id}
        style={styles.card}
        onLongPress={() => handleDelete(item.request_id!, item.title)} // Long press to delete
        activeOpacity={0.7}
      >
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.course}>{item.course_id}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {formatDescription(item.description)}
        </Text>
        <Text style={styles.date}>
          Created: {new Date(item.create_date).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchRequests}
            colors={[styles.createButton.backgroundColor]}
          />
        }
      >
        {/* Active Requests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Requests</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={styles.createButton.backgroundColor}
              />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : activeRequests.length > 0 ? (
            activeRequests.map(renderRequestCard)
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={styles.createButton.backgroundColor}
              />
            </View>
          ) : expiredRequests.length > 0 ? (
            expiredRequests.map(renderRequestCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expired requests</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={() => router.push("./askForm")}
        disabled={loading}
      >
        <Text style={[styles.createText, loading && styles.disabledText]}>
          Create New Request
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#0066CC",
    paddingBottom: 8,
  },
  card: {
    backgroundColor: "#F2F2F2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0066CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  course: {
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  createButton: {
    margin: 16,
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  createText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledText: {
    color: "#999",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ListScreen;
