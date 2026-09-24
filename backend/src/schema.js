// The schema lists the data and operations available to both apps.
export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Todo {
    id: ID!
    title: String!
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTodo(title: String!): Todo!
    updateTodo(id: ID!, title: String!): Todo!
    deleteTodo(id: ID!): Boolean!
  }
`;
