// app/request/[id].tsx
// RequestDetailScreen allows the user to view full request info and perform actions:
// - Edit request title and description
// - Delete the request
// - Reactivate if expired

import React, { useLayoutEffect, useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  getRequestById,
  updateRequest,
  deleteRequest,
  reactivateRequest,
} from "@lib/services/requestsService";
import { useFormData } from "@context/FormContext";
import {
  isRequestExpired,
  formatDate,
  getStatusColor,
} from "@lib/utils/requestUtils";
import type { RequestItem } from "@models/request";

export default function RequestDetailScreen() {
  const { id, context } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { setRequests } = useFormData();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const isBrowseContext = context === "browse";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: request ? request.title : "Request Details",
      headerTitleStyle: {
        fontSize: 16,
      },
    });
  }, [navigation, request]);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await getRequestById(Number(id));
      //console.log("Loading request with id:", Number(id));
      setRequest(data);
      if (data) {
        setEditedTitle(data.title);
        setEditedDescription(data.description);
      }
    } catch (error) {
      console.error("Error loading request:", error);
      Alert.alert("Error", "Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!request) return;

    // Validate input
    if (!editedTitle.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    if (editedTitle.length > 50) {
      Alert.alert("Error", "Title must be 50 characters or less");
      return;
    }
    if (editedDescription.length > 200) {
      Alert.alert("Error", "Description must be 200 characters or less");
      return;
    }

    try {
      setSaving(true);
      const updatedRequest = await updateRequest(request.request_id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
      });

      setRequest(updatedRequest);
      setIsEditing(false);

      // Update the global state
      setRequests((prev) =>
        prev.map((req) =>
          req.request_id === updatedRequest.request_id ? updatedRequest : req
        )
      );

      Alert.alert("Success", "Request updated successfully");
    } catch (error) {
      console.error("Error updating request:", error);
      Alert.alert("Error", "Failed to update request");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (request) {
      setEditedTitle(request.title);
      setEditedDescription(request.description);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!request) return;

    try {
      await deleteRequest(request.request_id);

      // Update global state
      setRequests((prev) =>
        prev.filter((req) => req.request_id !== request.request_id)
      );

      Alert.alert("Success", "Request deleted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", "Failed to delete request");
    }
  };

  const handleReactivate = () => {
    Alert.alert(
      "Reactivate Request",
      "This will reactivate your request and reset the 15-day timer. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reactivate", style: "default", onPress: confirmReactivate },
      ]
    );
  };

  const confirmReactivate = async () => {
    if (!request) return;

    try {
      const reactivatedRequest = await reactivateRequest(request.request_id);

      setRequest(reactivatedRequest);

      // Update global state
      setRequests((prev) =>
        prev.map((req) =>
          req.request_id === request.request_id ? reactivatedRequest : req
        )
      );

      Alert.alert(
        "Success",
        "Request reactivated successfully! It will now appear in your active requests.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error reactivating request:", error);
      Alert.alert("Error", "Failed to reactivate request");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading request details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ff4444" />
          <Text style={styles.errorText}>Request not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const expired = isRequestExpired(request.create_date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
              {expired && (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                </View>
              )}
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.section}>
            <Text style={styles.label}>TITLE</Text>
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  maxLength={50}
                  autoFocus
                />
                <Text style={styles.charCount}>{editedTitle.length}/50</Text>
              </View>
            ) : (
              <Text style={[styles.title, expired && styles.expiredText]}>
                {request.title}
              </Text>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.label}>DESCRIPTION</Text>
            {isEditing ? (
              <View>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>
                  {editedDescription.length}/200
                </Text>
              </View>
            ) : (
              <Text style={[styles.description, expired && styles.expiredText]}>
                {request.description}
              </Text>
            )}
          </View>

          {/* Meta Information */}
          <View style={styles.section}>
            <Text style={styles.label}>DETAILS</Text>
            <View style={styles.detailRow}>
              <FontAwesome name="book" size={16} color="#666" />
              <Text style={styles.detail}>Course: {request.course_id}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="calendar" size={16} color="#666" />
              <Text style={styles.detail}>
                Created: {formatDate(request.create_date)}
              </Text>
            </View>
            {request.assigned_to && (
              <View style={styles.detailRow}>
                <FontAwesome name="user" size={16} color="#666" />
                <Text style={styles.detail}>
                  Assigned to: {request.assigned_to}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {/* Only show action button in non-browse mode*/}
          {!isBrowseContext && (
            <View style={styles.buttonsContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEdit}
                  >
                    <FontAwesome name="edit" size={16} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Request</Text>
                  </TouchableOpacity>

                  {expired && (
                    <TouchableOpacity
                      style={styles.reactivateButton}
                      onPress={handleReactivate}
                    >
                      <FontAwesome name="refresh" size={16} color="#fff" />
                      <Text style={styles.reactivateButtonText}>
                        Reactivate Request
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <FontAwesome name="trash" size={16} color="#fff" />
                    <Text style={styles.deleteButtonText}>Delete Request</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  statusHeader: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  expiredBadge: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiredBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginLeft: 12,
  },
  expiredText: {
    color: "#999",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  buttonsContainer: {
    marginTop: 32,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  reactivateButton: {
    flexDirection: "row",
    backgroundColor: "#f39c12",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  reactivateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    backgroundColor: "#A6192E",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
