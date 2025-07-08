// app/(tabs)/_askForm.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

import { courses, weeks, tags as tagOptions } from "@constants/formOptions";
import { FormValues } from "@constants/types";
import TagSelector from "@components/TagSelector";


const validationSchema = Yup.object().shape({
  course: Yup.string().test("course-check", "Please select a course", (value) => value !== "Select"),
  week: Yup.string().test("week-check", "Please select a week", (value) => value !== "Select"),
  description: Yup.string()
    .required("Description is required")
    .max(200, "Description must be 200 characters or less"),
  tags: Yup.array()
    .of(Yup.string().notOneOf(["Select"], "Please select a valid tag"))
    .min(1, "Please select a tag"),
});

export default function AskFormScreen() {
  const router = useRouter();
  const { addRequest } = useFormData();

  const initialValues: FormValues = {
    course: "Select",
    week: "Select",
    title: "",
    description: "",
    tags: [],
  };

  const handleSubmit = (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    const newRequest = {
      id: Date.now(),
      ...values,
    };
    addRequest(newRequest);
    resetForm();
    router.push("/(tabs)/ask");
  };

  const handleCancel = () => {
    router.push("/(tabs)/ask");
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
              >
                {courses.map((course: string) => (
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
              <Text style={styles.charCount}>{`${values.description.length}/200`}</Text>
            </View>
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            {/* TAGS */}
            <TagSelector
              selectedTags={values.tags}
              setSelectedTags={(tags) => setFieldValue("tags", tags)}
              availableTags={tagOptions}
            />
            {touched.tags && errors.tags && (
              <Text style={styles.error}>{errors.tags}</Text>
            )}

            {/* SUBMIT */}
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

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
    marginLeft: 80,
  },
});
