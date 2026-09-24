# Software Engineer Assessment — Submission

The four tasks are included in the repository below. The web app and GraphQL backend are deployed and available for testing.

## Project links

| Item | Link |
| --- | --- |
| GitHub repository | [tactlink-assessment](https://github.com/fzrnaqlh03/tactlink-assessment) |
| Live web app | [tactlink-assessment.vercel.app](https://tactlink-assessment.vercel.app/) |
| AWS GraphQL backend | [https://52.73.18.155/](https://52.73.18.155/) |
| Setup, architecture decisions and time taken | [README.md](README.md) |
| AWS deployment steps and estimated cost | [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md) |

## Demo account

Use the same account on the web and mobile apps:

```text
Email: demo@example.com
Password: password123
```

## Completed tasks

1. **Mobile — React Native + Expo:** login, create/view/delete tasks, React Navigation and GraphQL integration. Source: [mobile/](mobile/).
2. **Backend — Node.js + GraphQL:** dummy signup/login and user-scoped task CRUD using Apollo Server and in-memory storage. Source: [backend/](backend/).
3. **Web — React + Vercel:** login and create/view/delete tasks using the same backend. Source: [web/](web/).
4. **Cloud — AWS:** backend deployed on EC2 with HTTPS. Deployment details and costs are in [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md).

## Testing the apps

Open the live web app, log in with the demo account, add a task and delete it. For the mobile app, follow the Expo setup in the README and use `EXPO_PUBLIC_API_URL=https://52.73.18.155/`.

Backend tests and the web build passed. Login, adding, viewing and deleting tasks were checked on the live website and in Expo Go on a phone.

The AWS link opens the GraphQL API landing page. Use the web app link to see the to-do interface. Data is stored in memory and resets when the backend restarts, as permitted by the assessment.
