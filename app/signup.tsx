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
import { supabase } from "../lib/supabase";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters"),
  autoLogin: Yup.boolean(),
});

export default function Signup() {
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

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
              autoLogin: false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitError("");

              // 1. Sign up with Supabase
              const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
              });

              if (error) {
                setSubmitError(error.message);
                setSubmitting(false);
                return;
              }

              // 2. Send confirmation email (done automatically by Supabase)

              // 3. Auto-login if checked, else go to login screen
              if (values.autoLogin) {
                const { error: loginError } =
                  await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                  });

                if (loginError) {
                  setSubmitError("Account created, but login failed.");
                  router.push("/");
                } else {
                  router.replace("/field");
                }
              } else {
                router.push("/"); // Go to login
              }

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

                {/* Sign me in after checkbox */}
                <View style={styles.checker}>
                  <Checkbox
                    value={values.autoLogin}
                    onValueChange={() =>
                      setFieldValue("autoLogin", !values.autoLogin)
                    }
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>Sign me in after</Text>
                </View>

                {submitError && (
                  <Text style={styles.errorText}>{submitError}</Text>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
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
                  <Text style={styles.link}>Already have an account? Sign in</Text>
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
    backgroundColor: "#F5F5F5",
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
