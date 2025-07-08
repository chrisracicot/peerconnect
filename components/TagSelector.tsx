import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface TagSelectorProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

export default function TagSelector({
  selectedTags,
  setSelectedTags,
  availableTags,
}: TagSelectorProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState(availableTags[0]);

  const handleAddTag = () => {
    if (pickerValue !== "Select" && !selectedTags.includes(pickerValue)) {
      setSelectedTags([...selectedTags, pickerValue]);
    }
    setPickerVisible(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <View style={styles.tagContainer}>
      <Text style={styles.tagLabel}>TAGS</Text>
      <View style={styles.tagRow}>
        {selectedTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => handleRemoveTag(tag)}
            style={styles.tagButton}
          >
            <Text style={styles.tagText}>{tag} ×</Text>
          </TouchableOpacity>
        ))}
        {!isPickerVisible ? (
          <TouchableOpacity onPress={() => setPickerVisible(true)} style={styles.tagButton}>
            <Text style={styles.tagText}>Add a tag +</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tagPickerContainer}>
            <Picker
              selectedValue={pickerValue}
              style={styles.tagPicker}
              onValueChange={(itemValue) => setPickerValue(itemValue as string)}
            >
              {availableTags
                .filter((tag) => !selectedTags.includes(tag))
                .map((tag) => (
                  <Picker.Item key={tag} label={tag} value={tag} />
                ))}
            </Picker>
            <TouchableOpacity onPress={handleAddTag} style={styles.tagButton}>
              <Text style={styles.tagText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    marginBottom: 20,
  },
  tagLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontWeight: "bold",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  tagButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#000",
  },
  tagPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagPicker: {
    height: Platform.OS === "android" ? 40 : undefined,
    width: 150,
  },
});
