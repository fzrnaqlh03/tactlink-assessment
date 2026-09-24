import { randomUUID } from 'node:crypto';
import { ApolloServer } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { typeDefs } from './schema.js';

export function createServer() {
  // These arrays reset whenever the server restarts, as allowed by the task.
  const users = [{ id: 'demo-user', email: 'demo@example.com', password: 'password123' }];
  const todos = [];
  const sessions = new Map();

  function createSession(user) {
    const token = randomUUID();
    sessions.set(token, user.id);
    return { token, user };
  }

  function requireUser(userId) {
    if (!userId) {
      throw new GraphQLError('Please log in first.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
  }

  function checkTitle(title) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new GraphQLError('Please enter a task.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    return trimmedTitle;
  }

  function findTodo(id, userId) {
    // Check both fields so a user cannot change somebody else's task by ID.
    const todo = todos.find((item) => item.id === id && item.userId === userId);
    if (!todo) {
      throw new GraphQLError('Task not found.', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
    return todo;
  }

  const resolvers = {
    Query: {
      todos: (_, args, { userId }) => {
        requireUser(userId);
        return todos.filter((todo) => todo.userId === userId);
      },
    },
    Mutation: {
      signup: (_, { email, password }) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !password.trim()) {
          throw new GraphQLError('Enter a valid email and a non-empty password.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        if (users.some((user) => user.email === cleanEmail)) {
          throw new GraphQLError('This email is already registered.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        // Dummy auth only: passwords are kept in memory for this assignment.
        const user = { id: randomUUID(), email: cleanEmail, password };
        users.push(user);
        return createSession(user);
      },
      login: (_, { email, password }) => {
        const user = users.find(
          (item) => item.email === email.trim().toLowerCase() && item.password === password,
        );
        if (!user) {
          throw new GraphQLError('Incorrect email or password.', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }
        return createSession(user);
      },
      createTodo: (_, { title }, { userId }) => {
        requireUser(userId);
        const todo = { id: randomUUID(), title: checkTitle(title), userId };
        todos.push(todo);
        return todo;
      },
      updateTodo: (_, { id, title }, { userId }) => {
        requireUser(userId);
        const todo = findTodo(id, userId);
        todo.title = checkTitle(title);
        return todo;
      },
      deleteTodo: (_, { id }, { userId }) => {
        requireUser(userId);
        const todo = findTodo(id, userId);
        todos.splice(todos.indexOf(todo), 1);
        return true;
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  // Resolve the token on the server; never trust a user ID supplied by the app.
  async function context({ req }) {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    return { userId: sessions.get(token) };
  }

  return { server, context };
}
