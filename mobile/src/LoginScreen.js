import { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput } from 'react-native';
import { graphqlRequest } from './api';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // Check both fields before sending a request to the backend.
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await graphqlRequest(
        `mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) { token }
        }`,
        { email: email.trim(), password },
      );
      // Keep the token in memory and use it for the user's task requests.
      onLogin(data.login.token);
    } catch (err) {
      setError(err.message);
    } finally {
      // Re-enable the inputs after the request, including when it fails.
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.description}>Log in to see your to-do list.</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!loading}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!loading}
        onSubmitEditing={loading ? undefined : handleLogin}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Button title={loading ? 'Logging in...' : 'Log in'} onPress={handleLogin} disabled={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#555', marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 16, color: '#111' },
  error: { color: '#b42318', marginBottom: 16 },
});
