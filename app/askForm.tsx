// askForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useFormData } from "./context/FormContext";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

// Sample data for dropdowns - sorted alphabetically
const courses = ["Select", "COMM 238", "CPNT 217", "CPRG 213"].sort((a, b) => {
  if (a === "Select") return -1;
  if (b === "Select") return 1;
  return a.localeCompare(b);
});

// Define the form values interface
interface FormValues {
  course: string;
  title: string;
  description: string;
}

const validationSchema = Yup.object().shape({
  course: Yup.string().test(
    "course-check",
    "Please select a course",
    (value) => value !== "Select"
  ),
  title: Yup.string()
    .required("Title is required")
    .max(50, "Title must be 50 characters or less"),
  description: Yup.string()
    .required("Description is required")
    .max(200, "Description must be 200 characters or less"),
});

const FormScreen = () => {
  const router = useRouter();
  const { addRequest, loading } = useFormData();

  const initialValues: FormValues = {
    course: "Select",
    title: "",
    description: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    await addRequest({
      title: values.title,
      description: values.description,
      course: values.course,
    });
    resetForm();
    router.push("./ask");
  };

  const handleCancel = () => {
    router.push("./ask");
  };

  return (
    <ScrollView style={styles.container}>
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
            <View style={styles.fieldRow}>
              <Text style={styles.label}>COURSE</Text>
              <Picker
                selectedValue={values.course}
                onValueChange={(value) => setFieldValue("course", value)}
                style={styles.input}
                enabled={!loading}
              >
                {courses.map((course) => (
                  <Picker.Item key={course} label={course} value={course} />
                ))}
              </Picker>
            </View>
            {touched.course && errors.course && (
              <Text style={styles.error}>{errors.course}</Text>
            )}

            {/* TITLE */}
            <View style={styles.titleContainer}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                style={styles.textArea}
                numberOfLines={1}
                value={values.title}
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                placeholder="Enter title (max 50 characters)"
                editable={!loading}
              />
              <Text style={styles.charCount}>
                {`${values.title.length}/50`}
              </Text>
            </View>
            {touched.title && errors.title && (
              <Text style={styles.error}>{errors.title}</Text>
            )}

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
                placeholder="Enter description (max 200 characters)"
                editable={!loading}
              />
              <Text style={styles.charCount}>
                {`${values.description.length}/200`}
              </Text>
            </View>
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit as any}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={styles.submitText.color} />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={[styles.cancelText, loading && styles.disabledText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  formContainer: {
    marginBottom: 20,
    padding: 20,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
    width: 80,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  titleContainer: {
    marginBottom: 20,
    position: "relative",
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
    position: "relative",
  },
  charCount: {
    position: "absolute",
    right: 10,
    bottom: 5,
    color: "#999",
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 10,
  },
  cancelText: {
    color: "#888",
  },
  disabledText: {
    color: "#cccccc",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 80,
  },
});

export default FormScreen;
