import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";
import { isRequestExpired } from "@lib/utils/requestUtils";
import Header from "@components/ui/Header";

function Icon(props: React.ComponentProps<typeof FontAwesome>) {
  return <FontAwesome size={25} style={{ marginBottom: -3 }} {...props} />;
}

export default function BrowseScreen() {
  const { requests } = useFormData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [filteredRequests, setFilteredRequests] = useState(requests);

  const categories = ["All", "Math", "Programming", "Business", "Language", "Science"];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    let results = requests;


    // Filter expired requests
    results = results.filter(
      (request) => !isRequestExpired(request.create_date)
    );

    if (selectedTag !== "All") {
      results = results.filter(
        (request) =>
          request.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
          request.description.toLowerCase().includes(selectedTag.toLowerCase()) ||
          request.course_id.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(
        (request) =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.course_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(results);
  }, [searchQuery, requests]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Requests"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" color="#005EB8" />
        </TouchableOpacity>
      </View>

      {/* Filter Tags */}
      <View style={styles.tagsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tagPill, selectedTag === cat && styles.tagPillActive]}
              onPress={() => setSelectedTag(cat)}
            >
              <Text style={[styles.tagText, selectedTag === cat && styles.tagTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Booking List */}
      <ScrollView>
        {filteredRequests.map((item) => (
          <RequestCard
            key={item.request_id}
            item={item}
            showCommentIcon={true}
            showDetailsButton={true}
            pageContext="browse"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f6f7f9",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
  },
  tagsWrapper: {
    height: 50,
    marginBottom: 10,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagPillActive: {
    backgroundColor: "#E6F0FA",
    borderColor: "#005EB8",
  },
  tagText: {
    color: "#666",
    fontWeight: "600",
  },
  tagTextActive: {
    color: "#005EB8",
  }
});
