import React, { useLayoutEffect, useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getRequestById } from "@lib/services/requestsService";
import type { RequestItem } from "@models/request";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: id ? `Request #${id}` : "My Request",
    });
  }, [navigation, id]);

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await getRequestById(String(id));
        setRequest(data);
        setLoading(false);
      })();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Request not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.description}>{request.description}</Text>
      <Text style={styles.detail}>Course: {request.course_id}</Text>
      <Text style={styles.detail}>Status: {request.status}</Text>
      <View style={styles.tagsContainer}>
        {request.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 10 },
  detail: { fontSize: 14, color: "#555", marginBottom: 5 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tag: {
    backgroundColor: "#E0ECFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginTop: 6,
  },
  tagText: { fontSize: 12, color: "#003366" },
});
