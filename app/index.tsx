import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters"),
  staySignedIn: Yup.boolean(),
  agreeToPolicy: Yup.boolean().oneOf(
    [true],
    "You must agree to the privacy policy"
  ),
});

const LoginScreen = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  // Auto-redirect if already signed in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        router.replace("/field");
      }
    };

    const timeout = setTimeout(checkSession, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Peer Connect</Text>
          <Text style={styles.title2}>Connecting Students.</Text>

          <Formik
            initialValues={{
              email: "",
              password: "",
              agreeToPolicy: false,
              staySignedIn: false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitError("");

              const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
              });

              if (error) {
                if (error.message.includes("Invalid login credentials")) {
                  setSubmitError("Invalid email or password.");
                } else if (error.message.includes("Email not confirmed")) {
                  setSubmitError("Please confirm your email before logging in.");
                } else {
                  setSubmitError("Login failed. Please try again.");
                }
                setSubmitting(false);
                return;
              }

              const user = data?.user;
              if (user && !user.email_confirmed_at) {
                setSubmitError("Email not confirmed. Check your inbox.");
                setSubmitting(false);
                return;
              }

              router.push("/field");
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
              setFieldValue,
              isSubmitting,
            }) => (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.email && errors.email && styles.errorInput,
                  ]}
                  placeholder="your.email@example.com"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.password && errors.password && styles.errorInput,
                  ]}
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  autoComplete="password"
                  textContentType="password"
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {submitError !== "" && (
                  <Text style={styles.errorText}>{submitError}</Text>
                )}

                {/* Resend email confirmation link */}
                {submitError.includes("confirm your email") && (
                  <TouchableOpacity
                    onPress={async () => {
                      const { error } = await supabase.auth.resend({
                        type: "signup",
                        email: values.email,
                      });
                      if (!error) {
                        alert("Confirmation email resent.");
                      }
                    }}
                  >
                    <Text style={styles.link}>Resend confirmation email</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    !values.agreeToPolicy && styles.disabledButton,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={!values.agreeToPolicy || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/signup")}
                  style={{ marginTop: 5, marginBottom: 10 }}
                >
                  <Text style={styles.link}>Go to Signup</Text>
                </TouchableOpacity>

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

                <View style={styles.checker}>
                  <Checkbox
                    value={values.staySignedIn}
                    onValueChange={() =>
                      setFieldValue("staySignedIn", !values.staySignedIn)
                    }
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>Stay signed in</Text>
                </View>
              </>
            )}
          </Formik>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    alignSelf: "center",
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  title2: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  loginButton: {
    backgroundColor: "#0066CC",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 15,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
  },
  checker: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  link: {
    color: "blue",
    fontSize: 13,
    textAlign: "center",
  },
});

export default LoginScreen;
