import { useState } from 'react';
import LoginForm from './LoginForm';
import TodoList from './TodoList';

export default function App() {
  // Keeping the token here means refreshing the page logs the user out.
  const [token, setToken] = useState('');

  return (
    <main className="card">
      {token ? (
        <TodoList token={token} onLogout={() => setToken('')} />
      ) : (
        <LoginForm onLogin={setToken} />
      )}
    </main>
  );
}
