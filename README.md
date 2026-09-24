# To-do assignment

A small to-do application for the four tasks in the supplied software engineer test.

## Task status

| Task | Result |
| --- | --- |
| 1. Mobile | Expo app with email/password login, React Navigation, and create/view/delete tasks through GraphQL. |
| 2. Backend | Apollo GraphQL server with dummy signup/login and user-scoped task CRUD. |
| 3. Web | React app with the same login and task features. Builds locally; Vercel deployment is pending account access and a hosted backend. |
| 4. AWS | Written deployment plan, including architecture, services and cost, in [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md). |

## Project folders

```text
mobile/                React Native + Expo app
backend/               Node.js + Apollo GraphQL API
web/                   React + Vite web app
AWS-DEPLOYMENT.md      AWS deployment plan
```

## Setup

Use Node.js 24 LTS and npm. Run the backend, web and mobile commands in separate terminals, starting from this repository's root.

### Backend

```sh
cd backend
npm ci
npm start
```

The API is available at `http://localhost:4000/`. Keep it running while using either app. `npm run dev` restarts the server when backend files change.

Demo login for both apps:

```text
Email: demo@example.com
Password: password123
```

### Mobile

```sh
cd mobile
npm ci
cp .env.example .env
# Set EXPO_PUBLIC_API_URL in .env for your device before starting Expo.
npm start
```

Open the QR code in an Expo Go version that supports SDK 57, or use an iOS/Android development environment compatible with that SDK.

- iOS Simulator on this computer: `http://localhost:4000/`.
- Android emulator: `http://10.0.2.2:4000/`.
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:4000/`. Keep the phone and computer on the same Wi-Fi and allow the backend port through your local firewall.
- Hosted backend: use its public HTTPS URL.

Restart Expo after changing `.env`. Expo uses the `EXPO_PUBLIC_` prefix to include this value in the app. The URL is not a secret.

### Web

```sh
cd web
npm ci
cp .env.example .env
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. `VITE_API_URL` defaults to `http://localhost:4000/`. Restart Vite after changing `.env`.

```sh
# Run these inside web/ to build and preview the production app.
npm run build
npm run preview
```

## How the code works

- Each app keeps the login token in React state and sends it in the `Authorization: Bearer ...` header.
- React Navigation switches the mobile app between login and tasks. The web app conditionally shows those same two views.
- Each app has a small `src/api.js` helper that sends GraphQL requests with `fetch`. A larger client library is not needed for these few operations.
- `backend/src/schema.js` defines the API. `backend/src/server.js` contains the in-memory data, dummy authentication and resolvers. `backend/src/index.js` starts the HTTP server.
- The server looks up the user from its session token. It filters tasks by that user and checks task ownership before updating or deleting.
- Signup and task updates are available through GraphQL, as requested for the backend. The app screens implement login and create/view/delete, as requested for mobile and web.

The code uses plain JavaScript and comments at the main steps. JavaScript comments use `//` or `/* ... */`; shell and environment-file comments use `#`.

### Deliberate limits

Authentication is dummy authentication: passwords and session tokens are held in memory for this assessment. Do not use real passwords. All accounts, sessions and tasks reset when the backend restarts, apart from the seeded demo account. Refreshing the web page or restarting the mobile app requires logging in again. Logging out clears the app's token.

There is no database, offline support, signup screen, task-editing screen, or UI component library. These are not required for the app screens.

## Try backend signup and updates

The Apollo Sandbox at `http://localhost:4000/` can run these operations. Start by creating a user:

```graphql
mutation {
  signup(email: "student@example.com", password: "test123") {
    token
    user { id email }
  }
}
```

For task operations, add an HTTP header named `Authorization` with the value `Bearer YOUR_TOKEN` in Sandbox. The same account can log in through either app.

```graphql
mutation {
  createTodo(title: "Read the requirements") { id title }
}
```

```graphql
query {
  todos { id title }
}
```

```graphql
# Replace TASK_ID with the ID from createTodo or todos.
mutation {
  updateTodo(id: "TASK_ID", title: "Finish the first task") { id title }
}
```

```graphql
mutation {
  deleteTodo(id: "TASK_ID")
}
```

## Checks

```sh
cd backend
npm test
```

The four automated API tests cover signup/login, full task CRUD, user isolation, missing/invalid tokens, invalid credentials, duplicate accounts and blank input.

Local verification completed:

- All four backend tests passed.
- Expo exported Android and iOS bundles successfully (`cd mobile` then `npx expo export --platform all`).
- The mobile app's actual GraphQL helper passed login/create/list/delete against the running backend.
- The web production build passed.
- Chrome checks passed for invalid login, login, empty lists, blank task input, creation, loading saved tasks after logging in again, failed deletion, successful deletion, logout and page refresh. A 375px viewport had no horizontal overflow.

The mobile UI still needs a hands-on check on a phone or simulator. No live deployment has been verified. During installation, npm reported 10 moderate findings in Expo's transitive Xcode/UUID tooling; its suggested fix would downgrade Expo to SDK 46, so that breaking change was not applied. Backend and web installation audits reported no vulnerabilities.

## Vercel deployment

1. Publish these folders to the GitHub repository once access is provided.
2. Make the backend reachable over HTTPS. [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md) describes how to host the existing backend on EC2.
3. Import the GitHub repository into Vercel. Select **Vite** and set the **Root Directory** to `web`.
4. Use build command `npm run build` and output directory `dist`.
5. Add `VITE_API_URL` with the backend's public HTTPS URL for the deployment environment, then deploy. Redeploy if this value changes because Vite embeds it during the build.
6. Test login, add and delete on the live site, then record the live URL below.

The hosted web app must not use `localhost` as its API URL: that would point at the visitor's computer. See [Vercel's Vite deployment documentation](https://vercel.com/docs/frameworks/frontend/vite).

## Submission links

- GitHub repository: [fzrnaqlh03/tactlink-assessment](https://github.com/fzrnaqlh03/tactlink-assessment) (upload pending GitHub authentication).
- Live Vercel app: pending deployment access and a public HTTPS backend.
- AWS backend link: not deployed; the permitted written-plan option is provided.

## Time taken

Approximately 20 minutes for AI-assisted implementation and local verification on 24 September 2026. This excludes GitHub/Vercel publishing, AWS provisioning and the candidate's own review. Record any additional time spent before submitting.
