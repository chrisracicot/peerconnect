import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { Link } from 'expo-router';





// Define validation schema using Yup
const validationSchema = Yup.object().shape({
  saitId: Yup.string()
    .required("SAIT ID is required")
    .matches(/^\d{9}$/, "Must be a 9-digit number"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Must be at least 8 characters"),
  agreeToPolicy: Yup.boolean().oneOf(
    [true],
    "You must agree to the privacy policy"
  ),
});

const LoginScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Your logo and title here */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Peer Connect</Text>
      <Text style={styles.title2}>Connecting Students.</Text>

      <Formik
        initialValues={{
          saitId: "",
          password: "",
          agreeToPolicy: false,
          rememberMe: false,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // Handle form submission here
          console.log("Submitting:", values);
          router.push("/field");
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
        }) => (
          <>
            {/* SAIT ID Input */}
            <Text style={styles.label}>SAIT ID</Text>
            <TextInput
              style={[
                styles.input,
                touched.saitId && errors.saitId && styles.errorInput,
              ]}
              placeholder="000123456"
              keyboardType="numeric"
              onChangeText={handleChange("saitId")}
              onBlur={handleBlur("saitId")}
              value={values.saitId}
            />
            {touched.saitId && errors.saitId && (
              <Text style={styles.errorText}>{errors.saitId}</Text>
            )}

            {/* Password Input */}
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
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                !values.agreeToPolicy && styles.disabledButton,
              ]}
              onPress={() => {
                handleSubmit();
              }}
              disabled={!values.agreeToPolicy}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            
            {/* Somewhere in your JSX */}
<Link href="/signup" style={{marginTop: 5, marginBottom: 10}}>
  <Text style={{ color: 'blue' }}>Go to Signup</Text>
</Link>
            <View style={styles.checker}>
              {/* Privacy Policy Checkbox */}
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
                  privacy policy.
                </Text>
              </Text>
            </View>
            {/* Remember Me Checkbox */}
            <View style={styles.checker}>
              <Checkbox
                value={values.rememberMe}
                onValueChange={() =>
                  setFieldValue("rememberMe", !values.rememberMe)
                }
                style={styles.checkbox}
              />
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </View>
          </>
        )}
      </Formik>
    </View>
  );
};

// Add error styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    justifyContent: "center",
  },
  logo: {
    alignSelf: "center",
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

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
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
  // ... existing styles ...
  errorInput: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  checker: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
});

export default LoginScreen;


