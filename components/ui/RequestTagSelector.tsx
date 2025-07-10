import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TagSelectorProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

const MAX_SELECTED = 3;

export default function RequestTagSelector({
  selectedTags,
  setSelectedTags,
  availableTags,
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < MAX_SELECTED) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.tagContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.tagLabel}>TAGS</Text>
        {selectedTags.length > 0 && (
          <TouchableOpacity onPress={() => setSelectedTags([])}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tagRow}>
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[
                styles.tagButton,
                isSelected && styles.tagButtonSelected,
                !isSelected &&
                  selectedTags.length >= MAX_SELECTED &&
                  styles.tagDisabled,
              ]}
              disabled={!isSelected && selectedTags.length >= MAX_SELECTED}
            >
              <Text
                style={[styles.tagText, isSelected && styles.tagTextSelected]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tagLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  clearText: {
    fontSize: 12,
    color: "#0066CC",
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
  tagButtonSelected: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  tagDisabled: {
    opacity: 0.4,
  },
  tagText: {
    fontSize: 12,
    color: "#000",
  },
  tagTextSelected: {
    color: "#FFF",
  },
});
