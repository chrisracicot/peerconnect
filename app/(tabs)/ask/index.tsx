// app/(tabs)/ask/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";
import { getCurrentUserId } from "@lib/services/userService";
import { fetchRequests } from "@lib/services/requestsService";

export default function AskScreen() {
  const router = useRouter();
  const { requests } = useFormData();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { setRequests } = useFormData();

  useEffect(() => {
    const loadUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    loadUserId();
  }, []);

  // list is auto-refresh on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchRequests().then(setRequests).catch(console.error);
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {requests
          .filter((item) => item && item.user_id === currentUserId)
          .map((item) => (
            <RequestCard
              key={item.request_id}
              item={item}
              onTagPress={(tag) => console.log("Filter on:", tag)}
            />
          ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/ask/form")}
      >
        <Text style={styles.createText}>Create New Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  createButton: {
    margin: 16,
    backgroundColor: "#0066CC",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  createText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
