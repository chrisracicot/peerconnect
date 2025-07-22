import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Yup from "yup";
import { Formik } from "formik";
import { useAuth } from "context/AuthContext";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters"),
  agreeToPolicy: Yup.boolean().oneOf(
    [true],
    "You must agree to the privacy policy"
  ),
});

export default function Signup() {
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const { signUp } = useAuth();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.heading}>Create Account</Text>

          <Formik
            initialValues={{
              email: "",
              password: "",
              agreeToPolicy: false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitError("");

              const { error } = await signUp(values.email, values.password);

              if (error) {
                setSubmitError(error.message);
                setSubmitting(false);
                return;
              }

              setSubmitError(
                "Account created! Please check your email to verify."
              );
              router.push("/");

              setSubmitting(false);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }) => (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="your@email.com"
                  style={[
                    styles.input,
                    touched.email && errors.email && styles.errorInput,
                  ]}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Password"
                  style={[
                    styles.input,
                    touched.password && errors.password && styles.errorInput,
                  ]}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                  autoComplete="password"
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Agree to privacy policy */}
                <View style={styles.checker}>
                  <Checkbox
                    value={values.agreeToPolicy}
                    onValueChange={() =>
                      setFieldValue("agreeToPolicy", !values.agreeToPolicy)
                    }
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>
                    You agree to our{" "}
                    <Text
                      style={{ color: "#007AFF" }}
                      onPress={() => console.log("Privacy Policy")}
                    >
                      privacy policy
                    </Text>
                    .
                  </Text>
                </View>
                {touched.agreeToPolicy && errors.agreeToPolicy && (
                  <Text style={styles.errorText}>{errors.agreeToPolicy}</Text>
                )}

                {/* Auto login */}
                {/* <View style={styles.checker}>
                  <Checkbox
                    value={values.autoLogin}
                    onValueChange={() =>
                      setFieldValue("autoLogin", !values.autoLogin)
                    }
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>Sign me in after</Text>
                </View> */}

                {submitError && (
                  <Text style={styles.errorText}>{submitError}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    !values.agreeToPolicy && styles.disabledButton,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={!values.agreeToPolicy || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/")}
                  style={{ marginTop: 10 }}
                >
                  <Text style={styles.link}>
                    Already have an account? Sign in
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  heading: {
    fontSize: 28,
    marginBottom: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  checker: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#0066CC",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "blue",
    textAlign: "center",
  },
});
