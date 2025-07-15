import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";

const Field = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fields = [
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Software Development",
    "Chemical Engineering",
    "Biomedical Engineering",
    "Environmental Science",
    "Aerospace Engineering",
    "Industrial Engineering",
    "Nuclear Physics",
    "Data Science",
    "Artificial Intelligence",
    "Robotics",
    "Cybersecurity",
    "Network Engineering",
    "Telecommunications",
  ];

  const filteredFields = fields.filter(
    (item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Choose Your Field of Study</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      <FlatList
        data={filteredFields}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push({ pathname: "../courses", params: { field: item } });
              }}
            >
              <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 10 }}
        style={{
          backgroundColor: "#e2e2e2",
          borderRadius: 10,
          padding: 10,
        }}
      />
    </SafeAreaView>
  );
};

export default Field;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e2e2e2",
  },
  heading: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#F6F7F9",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#6d2077",
  },
  text: {
    color: "#212529",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
  },
  searchBar: {
    height: 40,
    borderColor: "#6d2077",
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
});
