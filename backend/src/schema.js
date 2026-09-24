// The schema lists the data and operations available to both apps.
export const typeDefs = `#graphql
  # ! means the field must have a value. ID is a unique identifier.
  type User {
    id: ID!
    email: String!
  }

  # The result returned after signup or login.
  type AuthPayload {
    token: String!
    user: User!
  }

  type Todo {
    id: ID!
    title: String!
  }

  # Queries read data. [Todo!]! is a list of tasks; it can be empty.
  type Query {
    todos: [Todo!]!
  }

  # Mutations perform actions, such as logging in or changing tasks.
  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTodo(title: String!): Todo!
    updateTodo(id: ID!, title: String!): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;
