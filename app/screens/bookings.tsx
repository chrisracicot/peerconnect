import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useFormData } from "@context/FormContext";
import RequestCard from "@components/ui/RequestCard";

export default function BookingsScreen() {
  const { requests } = useFormData();

  // Filter only booked requests
  const bookedRequests = requests.filter(
    (request) => request.status === "booked"
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {bookedRequests.map((item) => (
          <RequestCard
            key={item.id}
            item={item}
            onTagPress={(tag) => console.log("Filter on:", tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
});
