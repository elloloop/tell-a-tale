# Tell-a-Tale App

This is a Next.js application for creating and sharing stories. It uses Firebase for authentication and data storage.

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Register a web app in your Firebase project
   - Get your Firebase configuration values
   - Create a `.env.local` file in the root of the project with the following content:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Development

Run the development server:

```bash
npm run dev
```

The application should be available at [http://localhost:3000](http://localhost:3000).

## Firebase Emulators (Optional)

To use Firebase emulators for local development:

1. Install the Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase:

   ```bash
   firebase init
   ```

3. Start the emulators:

   ```bash
   firebase emulators:start
   ```

4. Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   ```

## Features

- Anonymous authentication
- Create and publish stories
- View community stories
- React to stories with emojis
- Daily story prompts
- Share stories with others

## Troubleshooting

If you encounter a Firebase authentication error (auth/invalid-api-key), ensure that:

1. You have set up your Firebase configuration in `.env.local`
2. The API key and other Firebase configuration values are correct
3. Your Firebase project is properly set up and has the Firebase Authentication service enabled
