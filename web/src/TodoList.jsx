import { useEffect, useState } from 'react';
import { graphqlRequest } from './api';

export default function TodoList({ token, onLogout }) {
  // State holds the displayed tasks, the typed title and the request status.
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Disable action buttons while an add or delete request is running.
  const [saving, setSaving] = useState(false);

  async function loadTodos() {
    setError('');
    setLoading(true);
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

  async function addTodo(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const data = await graphqlRequest(
        `mutation CreateTodo($title: String!) {
          createTodo(title: $title) { id title }
        }`,
        { title: title.trim() },
        token,
      );
      // Use the ID returned by the backend when displaying and deleting tasks.
      setTodos((currentTodos) => [...currentTodos, data.createTodo]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTodo(id) {
    setError('');
    setSaving(true);
    try {
      await graphqlRequest('mutation DeleteTodo($id: ID!) { deleteTodo(id: $id) }', { id }, token);
      // Keep every other task. Do this only after the server confirms deletion.
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header>
        <h1>My tasks</h1>
        <button className="secondary" type="button" onClick={onLogout} disabled={saving || loading}>Log out</button>
      </header>
      <form onSubmit={addTodo}>
        <label htmlFor="task">New task</label>
        <div className="task-form">
          <input id="task" placeholder="What do you need to do?" value={title} onChange={(event) => setTitle(event.target.value)} disabled={saving || loading} required />
          <button type="submit" disabled={saving || loading}>Add</button>
        </div>
      </form>

      {error && (
        <div>
          <p className="error" role="alert">{error}</p>
          <button className="secondary" type="button" onClick={loadTodos} disabled={loading || saving}>Reload tasks</button>
        </div>
      )}

      {loading ? <p role="status">Loading tasks...</p> : (
        <ul className="task-list">
          {/* map() creates one row per task. Its ID keeps the React row identifiable. */}
          {todos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.title}</span>
              <button className="delete" type="button" aria-label={`Delete ${todo.title}`} onClick={() => deleteTodo(todo.id)} disabled={saving}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && todos.length === 0 && <p className="description">No tasks yet. Add your first task above.</p>}
    </>
  );
}
