import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { graphqlRequest } from './api';

export default function TodoScreen({ token, onLogout }) {
  // State holds the displayed tasks, the typed title and the request status.
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Disable action buttons while an add or delete request is running.
  const [saving, setSaving] = useState(false);

  async function loadTodos() {
    setLoading(true);
    setError('');
    try {
      const data = await graphqlRequest('query { todos { id title } }', {}, token);
      setTodos(data.todos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch this user's tasks when the screen opens or the login token changes.
  useEffect(() => {
    loadTodos();
  }, [token]);

  async function addTodo() {
    if (!title.trim()) {
      setError('Please enter a task.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const data = await graphqlRequest(
        `mutation CreateTodo($title: String!) {
          createTodo(title: $title) { id title }
        }`,
        { title: title.trim() },
        token,
      );
      // Add the server's saved task to the list only after the request succeeds.
      setTodos((currentTodos) => [...currentTodos, data.createTodo]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTodo(id) {
    setSaving(true);
    setError('');
    try {
      await graphqlRequest(
        'mutation DeleteTodo($id: ID!) { deleteTodo(id: $id) }',
        { id },
        token,
      );
      // Keep every other task after the server confirms this one was deleted.
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Text style={styles.label}>New task</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          accessibilityLabel="New task"
          placeholder="What do you need to do?"
          value={title}
          onChangeText={setTitle}
          editable={!saving && !loading}
          onSubmitEditing={saving || loading ? undefined : addTodo}
        />
        <Button title="Add" onPress={addTodo} disabled={saving || loading} />
      </View>
      {error ? (
        <View>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <Button title="Reload tasks" onPress={loadTodos} disabled={loading || saving} />
        </View>
      ) : null}
      {loading ? <ActivityIndicator accessibilityLabel="Loading tasks" /> : (
        <FlatList
          data={todos}
          keyExtractor={(todo) => todo.id}
          ListEmptyComponent={<Text style={styles.empty}>{error ? 'Tasks could not be displayed.' : 'No tasks yet. Add your first task above.'}</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Button title="Delete" accessibilityLabel={`Delete ${item.title}`} color="#b42318" onPress={() => deleteTodo(item.id)} disabled={saving} />
            </View>
          )}
        />
      )}
      <View style={styles.footer}>
        <Button title="Log out" onPress={onLogout} disabled={saving || loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 8 },
  form: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 12, fontSize: 16, color: '#111' },
  error: { color: '#b42318', marginBottom: 12 },
  empty: { color: '#555', marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  title: { flex: 1, fontSize: 16, marginRight: 12 },
  footer: { marginTop: 20 },
});
