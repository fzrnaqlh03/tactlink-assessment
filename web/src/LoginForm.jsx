import { useState } from 'react';
import { graphqlRequest } from './api';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    // Handle the form in React instead of letting the browser reload the page.
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await graphqlRequest(
        `mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) { token }
        }`,
        { email: email.trim(), password },
      );
      // Pass the token to App so it can show the task screen.
      onLogin(data.login.token);
    } catch (err) {
      setError(err.message);
    } finally {
      // Re-enable the form whether login succeeds or fails.
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Welcome back</h1>
      <p className="description">Log in to see your to-do list.</p>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} />

        {error && <p className="error" role="alert">{error}</p>}
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </>
  );
}
