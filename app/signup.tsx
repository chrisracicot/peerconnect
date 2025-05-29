import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <View style={{ padding: 24, flex: 1, justifyContent: "center" as const }}>
      <Text style={{ fontSize: 28, marginBottom: 40, fontWeight: "bold" }}>
        Welcome
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoComplete="password"
      />

      <TouchableOpacity style={styles.loginButton} onPress={() => {}}>
        <Text style={styles.loginButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <Link href="/" style={{ marginTop: 5 }}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  link: {
    color: "blue",
    textAlign: "center" as const,
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
});
