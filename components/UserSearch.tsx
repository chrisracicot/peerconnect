import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string;
}

export default function UserSearch({
  onSelectUser,
}: {
  onSelectUser: (userId: string) => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", user.id)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading verified users...</Text>
      ) : profiles.length === 0 ? (
        <Text>No verified users found</Text>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => onSelectUser(item.id)}
            >
              <Text style={styles.userName}>{item.full_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  userItem: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
