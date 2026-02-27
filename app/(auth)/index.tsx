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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "context/AuthContext";
import { registerForPushNotificationsAsync } from "@lib/services/notificationService";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters"),
});

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [rememberMePref, setRememberMePref] = useState(false);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberedEmail");
        if (savedEmail) {
          setInitialEmail(savedEmail);
          setRememberMePref(true);
        }
      } catch (e) {
        console.error("Failed to load remembered email", e);
      }
    };
    loadRememberedEmail();
  }, []);

  const DismissKeyboard = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') return <>{children}</>;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {children}
      </TouchableWithoutFeedback>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <DismissKeyboard>
        <View style={styles.container}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Peer Connect</Text>
          <Text style={styles.title2}>Learn Together, Grow Together</Text>

          <Formik
            enableReinitialize
            initialValues={{
              email: initialEmail,
              password: "",
              rememberMe: rememberMePref,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitError("");

              const { user: signedInUser, error } = await signIn(
                values.email,
                values.password
              );

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

              if (signedInUser && !signedInUser.email_confirmed_at) {
                setSubmitError("Email not confirmed. Check your inbox.");
                setSubmitting(false);
                return;
              }

              if (signedInUser) {
                registerForPushNotificationsAsync(signedInUser.id).catch(console.error);
              }

              if (values.rememberMe) {
                await AsyncStorage.setItem("rememberedEmail", values.email);
              } else {
                await AsyncStorage.removeItem("rememberedEmail");
              }

              if (values.email.toLowerCase() === "admin@peerconnect.com") {
                router.replace("/admin");
              } else {
                router.replace("/(tabs)/browse");
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
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {submitError !== "" && (
                  <Text style={styles.errorText}>{submitError}</Text>
                )}

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
                  style={styles.loginButton}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/(auth)/signup")}
                  style={{ marginTop: 5, marginBottom: 10 }}
                >
                  <Text style={styles.link}>Go to Signup</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFieldValue("email", "admin@peerconnect.com");
                    setFieldValue("password", "password123");
                  }}
                  style={{ marginBottom: 15 }}
                >
                  <Text style={[styles.link, { color: "gray" }]}>Use Demo Admin Account</Text>
                </TouchableOpacity>

                <View style={styles.checker}>
                  <Checkbox
                    value={values.rememberMe}
                    onValueChange={() =>
                      setFieldValue("rememberMe", !values.rememberMe)
                    }
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>
              </>
            )}
          </Formik>
        </View>
      </DismissKeyboard>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
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
