import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createServer } from '../src/server.js';

const { server, context } = createServer();
let url;

before(async () => {
  // Port 0 lets the operating system choose a free port for the tests.
  ({ url } = await startStandaloneServer(server, { listen: { port: 0, host: '127.0.0.1' }, context }));
});

after(async () => {
  await server.stop();
});

async function request(query, variables = {}, token = '') {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

const signup = `mutation Signup($email: String!, $password: String!) {
  signup(email: $email, password: $password) { token user { id email } }
}`;
const login = `mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) { token }
}`;
const create = `mutation Create($title: String!) { createTodo(title: $title) { id title } }`;
const update = `mutation Update($id: ID!, $title: String!) { updateTodo(id: $id, title: $title) { id title } }`;
const remove = `mutation Delete($id: ID!) { deleteTodo(id: $id) }`;
const list = 'query { todos { id title } }';

test('signup, login and the full task CRUD flow', async () => {
  const account = await request(signup, { email: ' First@example.com ', password: 'test123' });
  assert.equal(account.data.signup.user.email, 'first@example.com');
  assert.ok(account.data.signup.token);

  const signedIn = await request(login, { email: 'FIRST@example.com', password: 'test123' });
  const token = signedIn.data.login.token;
  assert.ok(token);
  assert.deepEqual((await request(list, {}, token)).data.todos, []);

  const added = await request(create, { title: ' Read the requirements ' }, token);
  const todo = added.data.createTodo;
  assert.equal(todo.title, 'Read the requirements');
  assert.deepEqual((await request(list, {}, token)).data.todos, [todo]);

  const changed = await request(update, { id: todo.id, title: 'Finish task one' }, token);
  assert.equal(changed.data.updateTodo.title, 'Finish task one');
  assert.equal((await request(list, {}, token)).data.todos[0].title, 'Finish task one');
  assert.equal((await request(remove, { id: todo.id }, token)).data.deleteTodo, true);
  assert.deepEqual((await request(list, {}, token)).data.todos, []);
});

test('users cannot view, update or delete another user\'s tasks', async () => {
  const first = await request(signup, { email: 'owner@example.com', password: 'test123' });
  const second = await request(signup, { email: 'other@example.com', password: 'test123' });
  const ownerToken = first.data.signup.token;
  const otherToken = second.data.signup.token;
  const added = await request(create, { title: 'Private task' }, ownerToken);
  const id = added.data.createTodo.id;

  assert.deepEqual((await request(list, {}, otherToken)).data.todos, []);
  assert.equal((await request(update, { id, title: 'Changed' }, otherToken)).errors[0].extensions.code, 'NOT_FOUND');
  assert.equal((await request(remove, { id }, otherToken)).errors[0].extensions.code, 'NOT_FOUND');
  assert.equal((await request(list, {}, ownerToken)).data.todos[0].title, 'Private task');
});

test('every task operation rejects missing or invented tokens', async () => {
  const operations = [[list, {}], [create, { title: 'Task' }], [update, { id: '1', title: 'Task' }], [remove, { id: '1' }]];
  for (const token of ['', 'not-a-real-token']) {
    for (const [query, variables] of operations) {
      const result = await request(query, variables, token);
      assert.equal(result.errors[0].extensions.code, 'UNAUTHENTICATED');
    }
  }
});

test('invalid credentials, duplicate accounts and blank tasks are rejected', async () => {
  const wrong = await request(login, { email: 'demo@example.com', password: 'wrong' });
  assert.equal(wrong.errors[0].extensions.code, 'UNAUTHENTICATED');
  const duplicate = await request(signup, { email: ' DEMO@example.com ', password: 'test123' });
  assert.equal(duplicate.errors[0].extensions.code, 'BAD_USER_INPUT');
  const invalid = await request(signup, { email: 'not-an-email', password: 'test123' });
  assert.equal(invalid.errors[0].extensions.code, 'BAD_USER_INPUT');
  const blankPassword = await request(signup, { email: 'blank@example.com', password: ' ' });
  assert.equal(blankPassword.errors[0].extensions.code, 'BAD_USER_INPUT');

  const signedIn = await request(login, { email: 'demo@example.com', password: 'password123' });
  const token = signedIn.data.login.token;
  assert.equal((await request(create, { title: ' ' }, token)).errors[0].extensions.code, 'BAD_USER_INPUT');
  const added = await request(create, { title: 'Keep this title' }, token);
  const id = added.data.createTodo.id;
  assert.equal((await request(update, { id, title: ' ' }, token)).errors[0].extensions.code, 'BAD_USER_INPUT');
  assert.equal((await request(list, {}, token)).data.todos[0].title, 'Keep this title');
  assert.equal((await request(remove, { id: 'missing' }, token)).errors[0].extensions.code, 'NOT_FOUND');
});
