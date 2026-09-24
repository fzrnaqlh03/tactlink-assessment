// Expo includes this public .env value in the app; do not put a secret here.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/';

// GraphQL sends the operation and its variables in one POST request.
export async function graphqlRequest(query, variables = {}, token = '') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    // Variables hold values such as the task title, separate from the query text.
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('Cannot reach the server. Please try again.');
  }

  const result = await response.json();

  // GraphQL can return an error even when the HTTP request succeeds.
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}
