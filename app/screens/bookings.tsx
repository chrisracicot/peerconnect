import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Pressable
} from "react-native";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";
import { supabase } from "@lib/supabase";
import { Booking } from "@lib/services/bookService";
import { RealtimeChannel } from "@supabase/supabase-js";
import BookingCard from "@components/ui/BookingCard";

export default function BookingsScreen() {
  const { requests } = useFormData();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const bookedRequests = requests.filter(
      (request) => request.status === "booked"
  );

  const fetchBookings = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Not authenticated");
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
          .from("bookings")
          .select("*")
          .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
          .order("date", { ascending: true });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const updateBookingStatus = async (status: "pending" | "confirmed" | "canceled") => {
    if (!selectedBooking) return;

    try {
      const { data, error } = await supabase
          .from("bookings")
          .update({ status })
          .eq("id", selectedBooking.id)
          .select()
          .single();

      if (error) throw error;

      setBookings(prev =>
          prev.map(b => b.id === selectedBooking.id ? { ...b, status } : b)
      );
      setShowStatusModal(false);
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking status");
    }
  };

  const setupRealtimeSubscription = async () => {
    if (!userId) return;

    // Remove existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with broader subscription
    const channel = supabase
        .channel('bookings_changes')
        .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings'
            },
            (payload) => {
              console.log('Real-time booking update:', payload);
              // Only process updates that are relevant to this user
              const booking = payload.new as Booking;
              if (booking.requester_id === userId || booking.provider_id === userId) {
                switch (payload.eventType) {
                  case 'INSERT':
                    setBookings(prev => [...prev, booking]);
                    break;
                  case 'UPDATE':
                    setBookings(prev => prev.map(b =>
                        b.id === booking.id ? booking : b
                    ));
                    break;
                  case 'DELETE':
                    setBookings(prev => prev.filter(b => b.id !== payload.old.id));
                    break;
                }
              }
            }
        )
        .subscribe((status, err) => {
          console.log('Subscription status:', status);
          if (err) {
            console.error('Subscription error:', err);
            setError("Real-time connection failed");
          }
        });

    channelRef.current = channel;
    return channel;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (userId) {
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  if (loading && !refreshing) {
    return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#A6192E" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchBookings}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#A6192E"]}
            />
          }
      >
        {/* Booked Requests */}
        {bookedRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Booked Services</Text>
              {bookedRequests.map((item) => (
                  <RequestCard
                      key={item.request_id}
                      item={item}
                      onTagPress={(tag) => console.log("Filter on:", tag)}
                  />
              ))}
            </View>
        )}

        {/* Scheduled Appointments */}
        {bookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Appointments</Text>
              {bookings.map((booking) => (
                  <BookingCard
                      key={booking.id}
                      booking={booking}
                      onPress={() => handleBookingPress(booking)}
                  />
              ))}
            </View>
        )}

        {bookedRequests.length === 0 && bookings.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No bookings or appointments yet</Text>
            </View>
        )}

        {/* Status Update Modal */}
        <Modal
            visible={showStatusModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Update Booking</Text>

              <View style={styles.statusButtonsContainer}>
                <Pressable
                    style={[styles.statusButton, styles.pendingButton]}
                    onPress={() => updateBookingStatus("pending")}
                >
                  <Text style={styles.statusButtonText}>Pending</Text>
                </Pressable>

                <Pressable
                    style={[styles.statusButton, styles.confirmedButton]}
                    onPress={() => updateBookingStatus("confirmed")}
                >
                  <Text style={styles.statusButtonText}>Confirm</Text>
                </Pressable>

                <Pressable
                    style={[styles.statusButton, styles.canceledButton]}
                    onPress={() => updateBookingStatus("canceled")}
                >
                  <Text style={styles.statusButtonText}>Cancel</Text>
                </Pressable>
              </View>

              <Pressable
                  style={styles.closeButton}
                  onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
  );
}

// ... (keep the styles the same)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
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
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  timeButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  statusButtonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  statusButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  pendingButton: {
    backgroundColor: '#FFF3E0',
  },
  confirmedButton: {
    backgroundColor: '#E8F5E9',
  },
  canceledButton: {
    backgroundColor: '#FFEBEE',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#A6192E',
    fontWeight: 'bold',
  },
});