import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useAuth } from "context/AuthContext";
import { fetchRequests } from "@lib/services/requestsService";
import {
  getProfileById,
  updateProfileById,
} from "@lib/services/profileService";
import type { UserProfile } from "@models/profile";
import Header from "@components/ui/Header";

function Icon(props: any) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
}

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("Placeholder Bio");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [postedRequests, setPostedRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Sample data (replace with actual data)
  const schedule = [
    {
      id: 1,
      course: "CPRG303 (Placeholder data)",
      day: "Monday",
      time: "9:00 AM - 11:00 AM",
    },
    // Add more schedule items...
  ];

  useEffect(() => {
    fetchRequests()
      .then(setPostedRequests)
      .catch((err) => console.error(err))
      .finally(() => setLoadingRequests(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    getProfileById(user.id)
      .then(setProfile)
      .catch((err) => console.error(err))
      .finally(() => setLoadingProfile(false));
  }, [user?.id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This feature is not available yet. Contact admin or implement a server function.",
      [{ text: "OK" }]
    );
  };

  const handleEdit = async () => {
    if (editMode && user?.id && profile) {
      const { error } = await updateProfileById(user.id, {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });

      if (error) {
        console.warn("Failed to update profile:", error);
        Alert.alert("Error", "Profile update failed.");
      } else {
        Alert.alert("Success", "Profile updated.");
      }
    }

    setEditMode((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Icon name={editMode ? "check" : "pencil"} color="#0066CC" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {loadingProfile ? "Loading..." : profile?.full_name ?? user?.email}
        </Text>
        {profile?.verified && (
          <Text style={{ color: "green" }}>✔ Verified</Text>
        )}
        <Text style={styles.studentId}>{user?.id.slice(0, 8)}</Text>
      </View>

      {/* Bio section */}
      {editMode && (
        <View style={styles.editFields}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={profile?.full_name ?? ""}
            onChangeText={(text) =>
              setProfile((prev) => prev && { ...prev, full_name: text })
            }
          />

          {/* Avatar Upload Placeholder */}
          <TouchableOpacity
            onPress={() => {
              // optionally launch image picker
            }}
            style={styles.avatarEditButton}
          >
            <Text style={{ color: "#0066CC", fontWeight: "bold" }}>
              Change Avatar (TODO)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Schedule */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Schedule</Text>
        <FlatList
          data={schedule}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleCourse}>{item.course}</Text>
              <Text style={styles.scheduleDetails}>
                {item.day} | {item.time}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Posted Requests */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Posted Requests</Text>
        <FlatList
          data={postedRequests.filter((req) => req.user_id === user?.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity>
                  <Icon name="comment-o" color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.tagsContainer}>
                {item.tags?.map((tag: string) => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.request_id.toString()}
          ListEmptyComponent={
            !loadingRequests
              ? () => (
                  <Text
                    style={{
                      color: "#999",
                      fontStyle: "italic",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    No requests posted yet.
                  </Text>
                )
              : null
          }
        />
      </View>

      {/* Temporary Logout */}
      <TouchableOpacity
        style={{
          backgroundColor: "#FF6B6B",
          padding: 15,
          margin: 20,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={async () => {
          await signOut();
          router.replace("/");
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDelete}
        style={{
          padding: 15,
          backgroundColor: "#ccc",
          marginTop: 10,
          margin: 20,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#333" }}>Delete Account (Provisional)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  studentId: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  editFields: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bioSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bioText: {
    fontSize: 14,
    color: "#666",
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scheduleItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  scheduleCourse: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scheduleDetails: {
    fontSize: 14,
    color: "#666",
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    color: "#666",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#EAEAEA",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 12,
    color: "#666",
  },
  avatarEditButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0066CC",
    alignItems: "center",
    alignSelf: "center",
  },
});

export default ProfileScreen;
