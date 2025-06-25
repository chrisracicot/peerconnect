import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useFormData } from '@context/FormContext';
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

const courses = ["Select", "CPRG 213", "CPNT 217", "COMM 238"];
const weeks = ["Select", "Week 1", "Week 2", "Week 3"];
const tags = ["Select", "Programming", "Networking", "Design"];

interface FormValues {
  course: string;
  week: string;
  description: string;
  tags: string[];
}

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

export default function AskScreen() {
  const router = useRouter();
  const { addRequest } = useFormData(); // use addRequest as per best-practice FormContext

  const initialValues: FormValues = {
    course: "Select",
    week: "Select",
    description: "",
    tags: ["Select"],
  };

const handleSubmit = (
  values: FormValues,
  { resetForm }: FormikHelpers<FormValues>
) => {
  const requestData = {
    ...values,
    id: Date.now(), // ✅ now a number
    title: `${values.course} - ${values.week}`,
  };
  addRequest(requestData);
  resetForm();
  router.push("/(tabs)/browse");
};


  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.avatar}
        />
        <Text style={styles.username}>User</Text>
      </View>

      <Formik<FormValues>
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
                {courses.map((course) => (
                  <Picker.Item key={course} label={course} value={course} />
                ))}
              </Picker>
            </View>
            {touched.course && errors.course && (
              <Text style={styles.error}>{errors.course}</Text>
            )}

            {/* WEEK */}
            <View style={styles.fieldRow}>
              <Text style={styles.label}>WEEK</Text>
              <Picker
                selectedValue={values.week}
                onValueChange={(value) => setFieldValue("week", value)}
                style={styles.input}
              >
                {weeks.map((week) => (
                  <Picker.Item key={week} label={week} value={week} />
                ))}
              </Picker>
            </View>
            {touched.week && errors.week && (
              <Text style={styles.error}>{errors.week}</Text>
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
              />
              <Text style={styles.charCount}>{`${values.description.length}/200`}</Text>
            </View>
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            {/* TAGS */}
            <View style={styles.tagsContainer}>
              <Text style={[styles.label, { color: "#0066CC" }]}>TAGS</Text>
              <Picker
                selectedValue={values.tags[0]}
                style={[styles.input, { borderColor: "#DDD" }]}
                onValueChange={(value) => setFieldValue("tags", [value])}
              >
                {tags.map((tag) => (
                  <Picker.Item key={tag} label={tag} value={tag} />
                ))}
              </Picker>
            </View>
            {touched.tags && errors.tags && (
              <Text style={styles.error}>{errors.tags}</Text>
            )}

            {/* SUBMIT */}
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
              <Text style={styles.submitText}>Submit</Text>
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
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 138,
    height: 138,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
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
  descriptionContainer: {
    marginBottom: 20,
  },
  textArea: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 100,
  },
  charCount: {
    position: "absolute",
    right: 10,
    bottom: 5,
    color: "#999",
  },
  tagsContainer: {
    marginBottom: 40,
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
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 80,
  },
});
