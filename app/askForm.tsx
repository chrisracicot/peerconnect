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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
<<<<<<<< HEAD:app/askForm.tsx
import { useFormData } from "./context/FormContext";
========
import { useFormData } from '@context/FormContext';
>>>>>>>> main:app/screens/ask.tsx
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

const courses = ["Select", "CPRG 213", "CPNT 217", "COMM 238"];
const weeks = ["Select", "Week 1", "Week 2", "Week 3"];
const tags = ["Select", "Programming", "Networking", "Design"];

<<<<<<<< HEAD:app/askForm.tsx
// Define the form values interface
interface FormValues {
  course: string;
  week: string;
  title: string;
========
interface FormValues {
  course: string;
  week: string;
>>>>>>>> main:app/screens/ask.tsx
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
<<<<<<<< HEAD:app/askForm.tsx
  const { addRequest } = useFormData();
========
  const { addRequest } = useFormData(); // use addRequest as per best-practice FormContext
>>>>>>>> main:app/screens/ask.tsx

  const initialValues: FormValues = {
    course: "Select",
    week: "Select",
    title: "",
    description: "",
    tags: [],
  };

<<<<<<<< HEAD:app/askForm.tsx
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
    router.push( "./ask"); 
  };

  const handleCancel = () => {
    router.push("./ask"); 
  };

  // Tag selector component with proper typing
  interface TagSelectorProps {
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
  }

  const TagSelector: React.FC<TagSelectorProps> = ({
    selectedTags,
    setSelectedTags,
  }) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [pickerValue, setPickerValue] = useState(tags[0]);

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
            <TouchableOpacity
              onPress={() => setPickerVisible(true)}
              style={styles.tagButton}
            >
              <Text style={styles.tagText}>Add a tag +</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.tagPickerContainer}>
              <Picker
                selectedValue={pickerValue}
                style={styles.tagPicker}
                onValueChange={(itemValue) =>
                  setPickerValue(itemValue as string)
                }
              >
                {tags
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
========
const handleSubmit = (
  values: FormValues,
  { resetForm }: FormikHelpers<FormValues>
) => {
  const requestData = {
    ...values,
    id: Date.now(), // ✅ now a number
    title: `${values.course} - ${values.week}`,
>>>>>>>> main:app/screens/ask.tsx
  };
  addRequest(requestData);
  resetForm();
  router.push("/(tabs)/browse");
};


  return (
    <ScrollView style={styles.container}>
<<<<<<<< HEAD:app/askForm.tsx
      <Formik
========
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.avatar}
        />
        <Text style={styles.username}>User</Text>
      </View>

      <Formik<FormValues>
>>>>>>>> main:app/screens/ask.tsx
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
            />
            {touched.tags && errors.tags && (
              <Text style={styles.error}>{errors.tags}</Text>
            )}

<<<<<<<< HEAD:app/askForm.tsx
            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit as any}
            >
========
            {/* SUBMIT */}
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
>>>>>>>> main:app/screens/ask.tsx
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
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
