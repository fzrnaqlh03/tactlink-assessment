// Vite reads the API URL from .env locally or from Vercel's build environment.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/';

export async function graphqlRequest(query, variables = {}, token = '') {
  // Both apps use the same GraphQL operations and Bearer token format.
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    // Variables hold input values separately from the GraphQL operation text.
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('Cannot reach the server. Please try again.');
  }

  const result = await response.json();
  // A successful HTTP response can still contain a GraphQL error.
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}
