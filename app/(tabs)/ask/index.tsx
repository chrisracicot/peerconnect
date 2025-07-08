// app/screens/ask.tsx
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

// Reusable interface (could be moved to constants later)
interface RequestItem {
  id: number;
  title: string;
  course: string;
  tags: string[];
  description?: string;
  week?: string;
}

export default function AskScreen() {
  const router = useRouter();
  const { requests } = useFormData();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        {requests.map((item: RequestItem) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.course}>{item.course}</Text>
            <View style={styles.tags}>
              <Text style={styles.tag}>Semester 1</Text>
              <Text style={styles.tag}>Wed Dev</Text>
              {item.tags.map((tag: string) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
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
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: "#F2F2F2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  course: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E0ECFF",
    color: "#003366",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginTop: 6,
    fontSize: 12,
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
