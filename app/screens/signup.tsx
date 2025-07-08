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
import { supabase } from "../../lib/supabase";

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
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
                  fullName: "",
                  email: "",
                  password: "",
                  autoLogin: false,
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setSubmitError("");
                  setSubmitting(true);

                  try {
                    // Sign up with Supabase Auth
                    const { data: { user, session }, error: signUpError } =
                        await supabase.auth.signUp({
                          email: values.email,
                          password: values.password,
                          options: {
                            data: {
                              full_name: values.fullName
                            }
                          }
                        });

                    if (signUpError) {
                      throw signUpError;
                    }

                    if (!user) {
                      throw new Error("User creation failed - no user returned");
                    }

                    // The trigger will automatically create the profile record
                    // Wait a moment to ensure the trigger completes
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Verify profile was created
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profileError || !profile) {
                      throw new Error("Profile creation failed");
                    }

                    // Auto-login if checked
                    if (values.autoLogin && session) {
                      router.replace("/(tabs)/browse");
                    } else {
                      setSubmitError("Account created! Please check your email to verify.");
                      router.push("/");
                    }

                  } catch (error: any) {
                    console.error("Signup error:", error);
                    setSubmitError(error.message || "Signup failed. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
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
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        placeholder="Your full name"
                        style={[
                          styles.input,
                          touched.fullName && errors.fullName && styles.errorInput,
                        ]}
                        value={values.fullName}
                        onChangeText={handleChange("fullName")}
                        onBlur={handleBlur("fullName")}
                        autoCapitalize="words"
                    />
                    {touched.fullName && errors.fullName && (
                        <Text style={styles.errorText}>{errors.fullName}</Text>
                    )}

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