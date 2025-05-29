import { View, Text, TextInput, Button, Switch } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <View style={{ padding: 24, flex: 1, justifyContent: 'center' as const }}>
      <Text style={{ fontSize: 28, marginBottom: 60, fontWeight: 'bold' }}>Welcome</Text>

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


      <Button title="Sign Up" onPress={() => {}} />

      <Link href="/">
        <Text style={styles.link}>Already have an account? Sign in</Text>
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
