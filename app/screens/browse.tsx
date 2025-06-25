import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFormData } from "@context/FormContext";
import RequestCard from "../../components/ui/RequestCard";

function Icon(props: React.ComponentProps<typeof FontAwesome>) {
  return <FontAwesome size={25} style={{ marginBottom: -3 }} {...props} />;
}

export default function BrowseScreen() {
  const { requests } = useFormData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filteredRequests, setFilteredRequests] = useState(requests);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = requests.filter(
      (request) =>
        request.course.toLowerCase().includes(text.toLowerCase()) ||
        request.tags.some((tag) => tag.includes(text))
    );
    setFilteredRequests(filtered);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter((request) =>
        activeFilters.every((filter) => request.tags.includes(filter))
      );
      setFilteredRequests(filtered);
    }
  }, [activeFilters, requests]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/sait.png")}
          style={styles.logo}
        />
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="bell" color="#1f1f1f" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="comment-o" color="#1f1f1f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {activeFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={styles.filterTag}
            onPress={() => toggleFilter(filter)}
          >
            <Text style={styles.filterText}>{filter}</Text>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addFilterButton}
          onPress={() => console.log("Add filter")}
        >
          <Text style={styles.addFilterText}>+ Add Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Request List */}
      <FlatList
        data={filteredRequests}
        renderItem={({ item }) => (
          <RequestCard item={item} onTagPress={toggleFilter} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
        style={{ marginTop: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E2E2E2",
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
    marginBottom: 3,
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    flexWrap: "wrap",
  },
  filterTag: {
    backgroundColor: "#6e2076",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
  },
  closeIcon: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  addFilterButton: {
    backgroundColor: "#6e2076",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  addFilterText: {
    color: "#fff",
    fontSize: 14,
  },
});
