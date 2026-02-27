import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface ChatPartner {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

export default function MessageListScreen() {
  const router = useRouter();

  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchRecentChats = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace("/(auth)" as any);
        return;
      }

      // Get all messages involving current user
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Get unique partner IDs
      const partnerIds = Array.from(
        new Set(
          messages?.map((msg) =>
            msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
          )
        )
      );

      if (partnerIds.length === 0) {
        setChatPartners([]);
        return;
      }

      // Get all partner profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", partnerIds);

      if (profilesError) throw profilesError;

      // Create conversation list with most recent message
      const conversations = partnerIds.map((partnerId) => {
        const partnerMessages = messages?.filter(
          (msg) => msg.sender_id === partnerId || msg.receiver_id === partnerId
        );
        const lastMessage = partnerMessages?.[0];
        const profile = profiles?.find((p) => p.id === partnerId);

        return {
          id: partnerId,
          name: profile?.full_name || "Unknown",
          lastMessage: lastMessage?.content || "",
          timestamp: lastMessage?.created_at || new Date().toISOString(),
        };
      });

      // Sort by most recent message
      conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setChatPartners(conversations);
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();

    // Set up real-time subscription
    const channel = supabase
      .channel("messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refresh the conversation list when any message changes
          fetchRecentChats();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleNavigateToChat = (partnerId: string) => {
    router.push(`../(tabs)/messages/${partnerId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A6192E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRecentChats}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {chatPartners.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={chatPartners}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() => handleNavigateToChat(item.id)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <Text
                    style={styles.lastMessage}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.lastMessage}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#A6192E",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#A6192E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A6192E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  newChatFloatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#A6192E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  newChatButton: {
    backgroundColor: "#A6192E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
});
