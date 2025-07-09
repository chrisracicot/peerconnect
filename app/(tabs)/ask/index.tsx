// app/(tabs)/ask/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";

export default function AskScreen() {
  const router = useRouter();
  const { requests } = useFormData();

  return (
    <View style={styles.container}>
      <ScrollView>
        {requests.map((item) => (
          <RequestCard
            key={item.id}
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
