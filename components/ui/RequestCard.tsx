// components/ui/RequestCard.tsx
// RequestCard is a presentational component for displaying request summaries.
// Clicking the card navigates to the detail page. Logic is handled there.

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import type { RequestItem } from "@models/request";
import { getDaysSinceCreation, isRequestExpired } from "@lib/utils/requestUtils";

interface Props {
  item: RequestItem;
  isExpired?: boolean;
  showDetailsButton?: boolean; // Control whether to show "tap to view details"
  showCommentIcon?: boolean;
  pageContext?: "ask" | "browse"; // Context of the screen (ask or browse) for styling purposes
  onPress?: () => void;
}

export default function RequestCard({
  item,
  isExpired = false,
  showDetailsButton = true,
  showCommentIcon = true,
  pageContext = 'ask',
  onPress,
}: Props) {
  const router = useRouter();

  // Use utility function
  const expired = isExpired ?? isRequestExpired(item.create_date);

  // Default navigation to detail page
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/request/[id]" as const,
        params: { id: String(item.request_id), context: pageContext }, // Pass params to detail page
      });
    }
  };

  // Use utility function
  const daysSinceCreation = getDaysSinceCreation(item.create_date);

  // Get status badge component
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <View style={styles.expiredBadge}>
          <Text style={styles.expiredBadgeText}>EXPIRED</Text>
        </View>
      );
    }

    switch (item.status) {
      case "booked":
        return (
          <View style={styles.bookedBadge}>
            <Text style={styles.bookedBadgeText}>BOOKED</Text>
          </View>
        );
      case "completed":
        return (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>COMPLETED</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isExpired && styles.expiredCard]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, isExpired && styles.expiredText]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {showCommentIcon && (
          <FontAwesome
            name="comment-o"
            size={20}
            color={isExpired ? "#999" : "#A6192E"}
          />
        )}
      </View>

      <Text
        style={[styles.description, isExpired && styles.expiredText]}
        numberOfLines={3}
      >
        {item.description}
      </Text>

      <View style={styles.metaInfo}>
        <View style={styles.metaLeft}>
          <Text style={styles.courseText}>Course: {item.course_id}</Text>
        </View>
        <Text style={[styles.dayText, isExpired && styles.expiredText]}>
          {daysSinceCreation} {daysSinceCreation === 1 ? "day" : "days"} ago
        </Text>
      </View>

      {/* Status badge */}
      {getStatusBadge()}

      {showDetailsButton && (
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap to view details</Text>
          <FontAwesome name="chevron-right" size={12} color="#999" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f6f7f9",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  expiredCard: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  expiredText: {
    color: "#999",
  },
  description: {
    color: "#666",
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  metaLeft: {
    flex: 1,
  },
  courseText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    marginBottom: 2,
  },
  dayText: {
    fontSize: 12,
    color: "#888",
  },
  expiredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff4444",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  expiredBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  bookedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#28a745",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  bookedBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  completedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#6c757d",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  completedBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  tapIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  tapText: {
    fontSize: 11,
    color: "#999",
    marginRight: 4,
  },
});
