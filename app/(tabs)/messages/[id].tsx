import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { RealtimeChannel } from "@supabase/supabase-js";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createBooking } from "@lib/services/bookService";
import { submitReport } from "@lib/services/reportService";
import {
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "@lib/services/messagesService";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@lib/services/notificationService";
import type { Message } from "@models/message";
import useUnreadNotifications from "@components/hooks/useUnreadNotifications";

interface Profile {
  id: string;
  full_name: string;
}

const isValidUUID = (id: string | string[]): id is string => {
  if (Array.isArray(id)) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default function ChatScreen() {
  const { id: receiverId, initialMessage } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(
    typeof initialMessage === 'string' ? initialMessage : ""
  );
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const receiverIdStr = isValidUUID(receiverId) ? receiverId : null;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { refetchUnreadCount } = useUnreadNotifications();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/");
          return;
        }
        setCurrentUserId(user.id);

        if (!receiverIdStr) {
          setError("Invalid chat participant");
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", receiverIdStr)
          .single();

        if (profileError || !profile) {
          setError("Failed to load chat participant");
          throw profileError;
        }
        setRecipient(profile);
      } catch (err) {
        console.error("Error fetching user:", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [receiverIdStr]);

  useEffect(() => {
    if (!currentUserId || !receiverIdStr) return;

    // mark as read
    const markAsRead = async () => {
      try {
        // Mark unread messages as read
        await markMessagesAsRead(currentUserId, receiverIdStr);

        // Mark related unread notifications as read
        const allNotifications = await getUserNotifications(currentUserId);
        const messageNotifsFromSender = allNotifications.filter(
          (n) =>
            n.type === "message" &&
            n.data?.senderId === receiverIdStr &&
            !n.is_read
        );

        await Promise.all(
          messageNotifsFromSender.map((n) => markNotificationAsRead(n.id))
        );
        await refetchUnreadCount();
      } catch (err) {
        console.error("Error marking messages/notifications as read:", err);
      }
    };

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setError(null);

        // const { data, error: fetchError } = await supabase
        //   .from("messages")
        //   .select("*")
        //   .or(
        //     `and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverIdStr}),` +
        //       `and(sender_id.eq.${receiverIdStr},receiver_id.eq.${currentUserId})`
        //   )
        //   .order("created_at", { ascending: true });

        // if (fetchError) throw fetchError;
        // if (isMounted) setMessages(data || []);

        const conversation = await getConversationMessages(
          currentUserId,
          receiverIdStr
        );
        if (isMounted) setMessages(conversation);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (isMounted) setError("Failed to load messages");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`chat_${currentUserId}_${receiverIdStr}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            if (isMounted && payload.eventType === "INSERT") {
              const newMsg = payload.new as Message;
              const isRelevant =
                (newMsg.sender_id === currentUserId && newMsg.receiver_id === receiverIdStr) ||
                (newMsg.sender_id === receiverIdStr && newMsg.receiver_id === currentUserId);

              if (isRelevant) {
                setMessages((prev) => {
                  if (prev.find(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error("Subscription error:", err);
          }
          console.log("Channel status:", status);
        });

      channelRef.current = channel;
      return channel;
    };

    fetchMessages();
    markAsRead();
    const channel = setupRealtimeSubscription();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUserId, receiverIdStr]);

  const handleCreateBooking = async () => {
    if (!bookingTitle.trim() || !bookingPrice.trim() || !bookingLocation.trim() || !currentUserId || !receiverIdStr) return;

    try {
      /* Instead of creating the booking immediately, send a Proposal Message */
      const proposalPayload = JSON.stringify({
        title: bookingTitle.trim(),
        price: parseFloat(bookingPrice),
        location: bookingLocation.trim(),
        date: selectedDate.toISOString(),
      });

      const bookingMessage = `[PROPOSAL]${proposalPayload}`;
      setNewMessage(bookingMessage);
      handleSendMessage();

      setShowBookingModal(false);
      setBookingTitle("");
      setBookingPrice("");
      setBookingLocation("");
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Failed to create booking");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !receiverIdStr) return;

    const tempId = Date.now();
    const newMsg = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: receiverIdStr,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // try {
    //   const { error } = await supabase.from("messages").insert({
    //     sender_id: currentUserId,
    //     receiver_id: receiverIdStr,
    //     content: newMessage.trim(),
    //   });

    //   if (error) throw error;
    // } catch (err) {
    //   console.error("Error sending message:", err);
    //   setMessages((prev) => prev.filter((m) => m.id !== tempId));
    //   setError("Failed to send message");
    // }

    try {
      await sendMessage(currentUserId, receiverIdStr, newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError("Failed to send message");
    }
  };

  const handleReportUser = () => {
    if (!currentUserId || !receiverIdStr) return;
    Alert.alert("Report User", "Do you want to flag this user for inappropriate behavior?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report", style: "destructive", onPress: async () => {
          try {
            await submitReport(currentUserId, 'user', receiverIdStr, "Reported via Chat Session");
            Alert.alert("Reported", "User has been flagged for admin review.");
          } catch (e) { Alert.alert("Error", "Could not submit report."); }
        }
      }
    ]);
  };

  const handleReportMessage = (messageId: number) => {
    if (!currentUserId) return;
    Alert.alert("Report Message", "Do you want to flag this message as inappropriate?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report", style: "destructive", onPress: async () => {
          try {
            await submitReport(currentUserId, 'message', messageId.toString(), "Inappropriate Content");
            Alert.alert("Reported", "Message flagged for review.");
          } catch (e) { Alert.alert("Error", "Could not submit report."); }
        }
      }
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId;

    if (item.content.startsWith("[PROPOSAL]")) {
      try {
        const proposal = JSON.parse(item.content.replace("[PROPOSAL]", ""));
        const sessionDate = new Date(proposal.date);

        return (
          <TouchableOpacity
            onLongPress={() => handleReportMessage(item.id)}
            delayLongPress={500}
            style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}
          >
            <Text style={[styles.proposalHeader, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>🤝 Meetup Proposal</Text>
            <View style={styles.proposalBox}>
              <Text style={styles.proposalDetail}>Topic: {proposal.title}</Text>
              <Text style={styles.proposalDetail}>Price: ${proposal.price}</Text>
              <Text style={styles.proposalDetail}>Where: {proposal.location}</Text>
              <Text style={styles.proposalDetail}>When: {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            {!isCurrentUser ? (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => router.push({
                  pathname: "/checkout" as any,
                  params: {
                    providerId: item.sender_id,
                    title: proposal.title,
                    price: proposal.price,
                    location: proposal.location,
                    date: proposal.date
                  }
                })}
              >
                <Text style={styles.payButtonText}>Pay & Accept</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.messageTime, { marginTop: 10 }]}>Waiting for student to accept...</Text>
            )}
          </TouchableOpacity>
        );
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    return (
      <TouchableOpacity
        onLongPress={() => handleReportMessage(item.id)}
        delayLongPress={500}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text
          style={isCurrentUser ? styles.currentUserText : styles.otherUserText}
        >
          {item.content}
        </Text>
        {item.safety_analysis && (
          <Text style={styles.safetyIndicator}>⚠️ Moderated</Text>
        )}
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={handleReportUser} style={{ marginRight: 15 }}>
        <FontAwesome name="flag-o" size={20} color="#A6192E" />
      </TouchableOpacity>
      <Pressable
        style={styles.bookButton}
        onPress={() => setShowBookingModal(true)}
      >
        <Text style={{ color: "#A6192E", fontWeight: "bold" }}>Propose</Text>
      </Pressable>
    </View>
  );

  const renderBookingModal = () => (
    <Modal
      visible={showBookingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBookingModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Propose Meetup Details</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Topic (e.g. Math Tutoring)"
            value={bookingTitle}
            onChangeText={setBookingTitle}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Location (e.g. Library Rm 204)"
            value={bookingLocation}
            onChangeText={setBookingLocation}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Price ($)"
            value={bookingPrice}
            onChangeText={setBookingPrice}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <View style={styles.datetimeContainer}>
            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#A6192E" />
              <Text style={styles.datetimeText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#A6192E" />
              <Text style={styles.datetimeText}>
                {selectedDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowBookingModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCreateBooking}
              disabled={!bookingTitle.trim() || !bookingLocation.trim() || !bookingPrice.trim()}
            >
              <Text style={styles.modalButtonText}>Send Proposal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A6192E" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/messages")}
          >
            <Ionicons name="arrow-back" size={24} color="#A6192E" />
          </Pressable>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              setCurrentUserId("");
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/messages")}
        >
          <Ionicons name="arrow-back" size={24} color="#A6192E" />
        </Pressable>
        <Text style={styles.headerTitle}>{recipient?.full_name || "Chat"}</Text>
        {recipient && renderHeaderRight()}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.disabledButton,
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {renderBookingModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "white",
  },
  backButton: {
    padding: 4,
  },
  bookButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
    color: "#A6192E",
    fontSize: 16,
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
  messagesList: {
    padding: 10,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#A6192E",
    borderBottomRightRadius: 2,
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 2,
  },
  currentUserText: {
    color: "white",
    fontSize: 16,
  },
  otherUserText: {
    color: "black",
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: "#DDD",
    marginTop: 4,
    textAlign: "right",
  },
  safetyIndicator: {
    fontSize: 10,
    color: "#FFD700",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: "#FFF",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A6192E",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 70,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: "#333",
  },
  datetimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  datetimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    padding: 12,
    marginHorizontal: 5,
  },
  datetimeText: {
    marginLeft: 8,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: "#E5E5EA",
  },
  confirmButton: {
    backgroundColor: "#A6192E",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  proposalHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
  },
  proposalBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  proposalDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  payButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  payButtonText: {
    color: "white",
    fontWeight: "bold",
  }
});
