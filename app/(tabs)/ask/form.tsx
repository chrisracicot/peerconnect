import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

import { courses, tags as tagOptions } from "@constants/formOptions";
import { FormValues } from "@constants/types";
//import TagSelector from "@components/TagSelector";
import RequestTagSelector from "@components/ui/RequestTagSelector";
import { getCurrentUserId } from "@lib/supabase/userService";
import { createRequest } from "@lib/supabase/requestsService";
import type { NewRequest } from "@models/request";

const validationSchema = Yup.object().shape({
  course: Yup.string().required("Please select a course"),
  description: Yup.string()
    .required("Description is required")
    .max(200, "Description must be 200 characters or less"),
  tags: Yup.array().of(Yup.string()).min(1, "Please select at least one tag"),
});

export default function AskFormScreen() {
  const router = useRouter();
  const { addRequest } = useFormData();

  const initialValues: FormValues = {
    course: "",
    week: "Select",
    title: "",
    description: "",
    tags: [],
  };

  // Dropdown state for react-native-dropdown-picker
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    courses.map((course) => ({ label: course, value: course }))
  );

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const user_id = await getCurrentUserId();
      if (!user_id) throw new Error("User ID not found");

      const newRequest: NewRequest = {
        user_id,
        course_id: values.course,
        title: values.title,
        description: values.description,
        tags: values.tags,
        status: "pending",
        create_date: new Date().toISOString(),
      };

      const insertedRequest = await createRequest(newRequest);
      addRequest(insertedRequest);

      resetForm();
      router.push("/(tabs)/ask");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        console.error((err as { message: string }).message);
      } else {
        console.error("Unknown error", err);
      }
    }
  };

  const handleCancel = () => {
    router.push("/(tabs)/ask");
  };

  return (
    <View style={{ flex: 1 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.formContainer}>
            {/* COURSE */}
            <View style={{ marginBottom: 20, zIndex: 1000 }}>
              <Text style={styles.label}>COURSE</Text>
              <DropDownPicker
                open={open}
                value={values.course}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  const selectedValue = callback(values.course);
                  setFieldValue("course", selectedValue);
                }}
                setItems={setItems}
                placeholder="Select a course"
                style={{ borderColor: "#000" }}
                containerStyle={{ marginTop: 10 }}
                dropDownContainerStyle={{ borderColor: "#000" }}
              />
              {touched.course && errors.course && (
                <Text style={styles.error}>{errors.course}</Text>
              )}
            </View>

            {/* TITLE */}
            <View style={styles.titleContainer}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                style={styles.textArea}
                numberOfLines={1}
                value={values.title}
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
              />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
              />
              <Text style={styles.charCount}>
                {`${values.description.length}/200`}
              </Text>
            </View>
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            {/* TAGS */}
            <RequestTagSelector
              selectedTags={values.tags}
              setSelectedTags={(tags) => setFieldValue("tags", tags)}
              availableTags={tagOptions}
            />
            {touched.tags && errors.tags && (
              <Text style={styles.error}>{errors.tags}</Text>
            )}

            {/* Selected tags as chips */}
            <View style={styles.tagsPreview}>
              {values.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* SUBMIT */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  formContainer: {
    marginBottom: 20,
    padding: 20,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    fontWeight: "bold",
  },
  titleContainer: {
    marginBottom: 20,
  },
  textArea: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  charCount: {
    position: "absolute",
    right: 10,
    bottom: 5,
    color: "#999",
  },
  tagsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
  },
  tagChip: {
    backgroundColor: "#E0ECFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginTop: 6,
  },
  tagChipText: {
    fontSize: 12,
    color: "#003366",
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#888",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
});
