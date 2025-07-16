// app/(tabs)/ask/form.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter } from "expo-router";
import { useFormData } from "@context/FormContext";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import Header from "@components/ui/Header";
import { FormValues } from "@constants/types";
import { getCurrentUserId } from "@lib/services/userService";
import { createRequest } from "@lib/services/requestsService";
import { getCourses } from "@lib/services/courseService";
import type { NewRequest } from "@models/request";

const validationSchema = Yup.object().shape({
  course: Yup.string().required("Please select a course"),
  title: Yup.string()
    .required("Title is required")
    .max(50, "Title must be 50 characters or less"),
  description: Yup.string()
    .required("Description is required")
    .max(200, "Description must be 200 characters or less"),
});

export default function AskFormScreen() {
  const router = useRouter();
  const { addRequest } = useFormData();

  const initialValues: FormValues = {
    course: "",
    title: "",
    description: "",
  };

  // Dropdown state for react-native-dropdown-picker
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getCourses();
        const formatted = courses.map((course: { course_id: string }) => ({
          label: course.course_id,
          value: course.course_id,
        }));
        setItems(formatted);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    fetchCourses();
  }, []);

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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      <ScrollView style={styles.scrollView}>
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
              <View style={styles.dropdownContainer}>
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
                  style={styles.dropdown}
                  listMode="MODAL"
                  modalProps={{
                    animationType: "slide",
                  }}
                  closeAfterSelecting={true}
                  searchable={true}
                  modalTitle="Select a Course"
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
                  maxLength={50}
                />
                <Text
                  style={styles.charCount}
                >{`${values.title.length}/50`}</Text>
              </View>
              {touched.title && errors.title && (
                <Text style={styles.error}>{errors.title}</Text>
              )}

              {/* DESCRIPTION */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput
                  style={styles.descriptionArea}
                  multiline
                  numberOfLines={4}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  maxLength={200}
                />
                <Text style={styles.charCount}>
                  {`${values.description.length}/200`}
                </Text>
              </View>
              {touched.description && errors.description && (
                <Text style={styles.error}>{errors.description}</Text>
              )}

              {/* SUBMIT */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.submitText}>SUBMIT</Text>
              </TouchableOpacity>

              {/* CANCEL */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 15,
    fontWeight: "bold",
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdown: {
    borderColor: "#DDD",
    marginTop: 10,
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
    textAlignVertical: "top",
  },
  descriptionArea: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlignVertical: "top",
    minHeight: 150,
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
    marginTop: 50,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#888",
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
});
