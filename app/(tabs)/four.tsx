import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams } from "expo-router";

function Icon(props: any) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
}

const ProfileScreen = () => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    studentId: "00123456",
    bio: "Computer Science Student at SAIT",
  });

  // Sample data (replace with actual data)
  const schedule = [
    {
      id: 1,
      course: "CPRG303",
      day: "Monday",
      time: "9:00 AM - 11:00 AM",
    },
    // Add more schedule items...
  ];

  const postedRequests = [
    {
      id: 1,
      course: "CPRG303",
      title: "Web Development Help",
      description: "Need assistance with assignment 2",
      tags: ["#assignment2", "#CPRG303"],
    },
    // Add more request items...
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Icon name={editMode ? "check" : "pencil"} color="#0066CC" />
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.studentId}>{profileData.studentId}</Text>
      </View>

      {/* Editable Fields */}
      {editMode && (
        <View style={styles.editFields}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={profileData.name}
            onChangeText={(text) =>
              setProfileData({ ...profileData, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={profileData.email}
            onChangeText={(text) =>
              setProfileData({ ...profileData, email: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Bio"
            value={profileData.bio}
            onChangeText={(text) =>
              setProfileData({ ...profileData, bio: text })
            }
          />
        </View>
      )}

      {/* Bio Section */}
      {!editMode && (
        <View style={styles.bioSection}>
          <Text style={styles.bioLabel}>Bio:</Text>
          <Text style={styles.bioText}>{profileData.bio}</Text>
        </View>
      )}

      {/* Schedule Section */}
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

      {/* Posted Requests Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Posted Requests</Text>
        <FlatList
          data={postedRequests}
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
                {item.tags.map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
});

export default ProfileScreen;
