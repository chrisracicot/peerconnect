import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import type { RequestItem } from "@models/request";

interface Props {
  item: RequestItem;
  onTagPress?: (tag: string) => void;
}

export default function RequestCard({ item, onTagPress }: Props) {
  const router = useRouter();

  const handlePress = () => {
    const actualPath = `/request/${item.id}`;
    router.push(`/request/${String(item.id)}` as const);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        <FontAwesome name="comment-o" size={20} color="#A6192E" />
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.tagsContainer}>
        {item.tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.tag}
            onPress={() => onTagPress?.(tag)}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f6f7f9",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  description: {
    color: "#666",
    marginBottom: 10,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: "#005EB8",
  },
});
