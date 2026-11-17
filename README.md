# VJTI Lost & Found

A campus lost & found app for VJTI students. When anyone posts a lost or found item, every student gets a push notification.

- **frontend/**: React Native (Expo SDK 58, Expo Router)
- **backend/**: Node.js + Express + MongoDB (Mongoose) + Cloudinary

## 1. Backend setup

```bash
cd backend
npm install
copy .env.example .env      # then fill in the values
npm run dev                 # starts on http://localhost:5000
```

`.env` values:

| Key | Where to get it |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Any long random string |
| `CLOUDINARY_*` | Cloudinary dashboard → API Keys |
| `ALLOWED_EMAIL_DOMAIN` | `vjti.ac.in` to allow only college emails (leave empty while testing) |

## 2. Frontend setup

```bash
cd frontend
npm install
copy .env.example .env      # set EXPO_PUBLIC_API_IP to your PC's IP (or "auto")
npx expo start -c
```

Scan the QR code with **Expo Go**. Your phone and PC must be on the **same Wi-Fi**.

**Changed network/IP?** Put your PC's new IP in `frontend/.env` (`EXPO_PUBLIC_API_IP=...`), then restart Expo with `npx expo start -c`.
The backend prints the correct IP when it starts. If it still can't connect, allow Node.js through Windows Firewall (port 5000).

## 3. Push notifications

Push notifications **do not work in Expo Go on Android** (an Expo limitation since SDK 53). Everything else works in Expo Go.
To test notifications you need a development build:

1. `npx eas-cli@latest login` (free Expo account)
2. `npx eas-cli@latest init` adds the `projectId` to app.json
3. Set up Firebase (FCM) for Android: https://docs.expo.dev/push-notifications/fcm-credentials/
4. `npx eas-cli@latest build --profile development --platform android`, then install the APK on your phone
5. `npx expo start` and open the app in the development build

## API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| PUT / DELETE | `/api/auth/push-token` | Save / remove phone's push token |
| GET | `/api/items?type=&category=&search=&page=` | Feed (open items) |
| GET | `/api/items/mine` | My posts |
| GET | `/api/items/upload-signature` | Signature for the app to upload a photo directly to Cloudinary |
| GET | `/api/items/:id` | Item details |
| POST | `/api/items` | Create post (JSON with optional `imageUrl` + `imagePublicId`) and notify all students |
| PATCH | `/api/items/:id/resolve` | Mark resolved (owner only) |
| DELETE | `/api/items/:id` | Delete (owner only) |
