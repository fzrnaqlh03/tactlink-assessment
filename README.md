# To-do App — Software Engineer Assessment

A simple to-do app with a React Native mobile app, a React website and a shared GraphQL backend. Both apps let users log in, add tasks, view their list and delete tasks.

## Live links

- [Web app](https://tactlink-assessment.vercel.app/)
- [GraphQL backend](https://52.73.18.155/)
- [GitHub repository](https://github.com/fzrnaqlh03/tactlink-assessment)

Use this demo account on either app:

```text
Email: demo@example.com
Password: password123
```

The backend link opens an Apollo API page, not the to-do screen. The web app link above opens the actual app.

## Project structure

```text
mobile/               React Native + Expo
backend/              Node.js + Apollo GraphQL
web/                  React + Vite
AWS-DEPLOYMENT.md     AWS setup, costs and server instructions
```

## Run locally

Install Node.js 24 and npm first. Run each part in a separate terminal, starting from the project folder.

### 1. Backend

```sh
cd backend
npm ci
npm start
```

The backend runs at `http://localhost:4000/`. Keep this terminal running when using the local API. Use `npm run dev` if you want the server to restart when you edit a backend file.

### 2. Web

```sh
cd web
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173/`, or the address printed in the terminal. The default API address is `http://localhost:4000/`.

To use the deployed backend instead, set this in `web/.env` and restart Vite:

```env
VITE_API_URL=https://52.73.18.155/
```

To check the production build, run `npm run build` inside `web/`.

### 3. Mobile

```sh
cd mobile
npm ci
cp .env.example .env
```

Set this in `mobile/.env` to use the deployed backend:

```env
EXPO_PUBLIC_API_URL=https://52.73.18.155/
```

Then start Expo:

```sh
npm start -- --lan
```

Connect your phone and computer to the same Wi-Fi, then scan the QR code with an Expo Go version that supports SDK 57. Restart Expo after changing `.env`.

To use a local backend instead, change the API URL to:

- Physical phone: `http://YOUR_COMPUTER_WIFI_IP:4000/`
- Android emulator: `http://10.0.2.2:4000/`
- iOS Simulator on the same computer: `http://localhost:4000/`

Your computer's Wi-Fi IP may change when you move to another network. The deployed backend URL stays the same.

## Main decisions

- **One backend for both apps:** mobile and web use the same GraphQL operations and user accounts.
- **In-memory storage:** the assessment allows this, so users, sessions and tasks are stored in memory without a database.
- **Dummy authentication:** login returns a token. The apps send it with task requests, and the server checks which user it belongs to.
- **User-scoped tasks:** users only see their own tasks. The backend also checks ownership before updating or deleting a task.
- **Simple frontend state:** React state holds the token, form inputs and task list. React Navigation handles the two mobile screens. Requests use `fetch`.
- **EC2 for the backend:** one running server suits the in-memory storage. Nginx provides HTTPS, and systemd starts the backend after a reboot.

The backend supports signup, login and full task CRUD, including updating a title. The mobile and web screens contain login and create/view/delete, as requested.

## Try the GraphQL API

With the backend running locally, open `http://localhost:4000/` to use Apollo Sandbox. Run this first:

```graphql
mutation {
  login(email: "demo@example.com", password: "password123") {
    token
  }
}
```

Copy the returned token and add an HTTP header in Sandbox:

```text
Authorization: Bearer YOUR_TOKEN
```

Then run:

```graphql
query {
  todos {
    id
    title
  }
}
```

All available operations and their inputs are listed in `backend/src/schema.js`. A token from the local backend only works locally; use a login token from the hosted backend when querying the hosted API.

## Testing

Run the backend tests with:

```sh
cd backend
npm test
```

The four tests cover login/signup, task CRUD, user isolation and invalid input or tokens.

The web production build and Android/iOS bundle exports passed. Login, adding, viewing and deleting tasks were checked on the live website and manually in Expo Go on a phone. The mobile API requests also passed against the hosted backend.

## Deployment

The web app is hosted on Vercel with these settings:

- Framework: Vite
- Root directory: `web`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://52.73.18.155/`

The backend runs on an AWS EC2 `t3.micro` instance in `us-east-1`. It has a stable public IP and an HTTPS certificate with automatic renewal. See [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md) for the deployment steps, estimated cost and cleanup instructions.

## Limitations

- Restarting the backend clears tasks, new accounts and sessions. The demo account is recreated on startup.
- Refreshing the website or restarting the mobile app requires logging in again.
- Authentication is only for this assessment. Use dummy passwords.
- Expo's dependency audit reported moderate findings in its Xcode/UUID tooling. The suggested automatic fix would downgrade Expo, so it was not applied.

## Time taken

The project was worked on during 24 September 2026, from around 11 AM to 6 PM. That is roughly 7 hours elapsed, including setup, implementation, testing, deployment, sign-in delays and troubleshooting. Active coding time was not tracked separately.
