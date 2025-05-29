import { View, Text, TextInput, Button, Switch } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <View style={{ padding: 24, flex: 1, justifyContent: 'center' as const }}>
      <Text style={{ fontSize: 28, marginBottom: 24, fontWeight: 'bold' }}>Welcome Back</Text>

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

      <View style={styles.rememberRow}>
        <Text>Remember me</Text>
        <Switch value={remember} onValueChange={setRemember} />
      </View>

      <Button title="Log In" onPress={() => {}} />

      <Link href="/signup">
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
      </Link>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  rememberRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginVertical: 12,
  },
  link: {
    marginTop: 16,
    color: 'blue',
    textAlign: 'center' as const,
  },
};
