# Dev Note

---

## firebase Note

```
# `npm run build` then ...
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only hosting:jukebox
firebase deploy --only hosting:jukebox-host
firebase deploy --only hosting:space-radio
```

---

## env

Space-radio

```
VITE_BASE_URI= <PKCE auth redirect url>
VITE_CLIENT_ID= <Spotify client id>

VITE_FIREBASE_APIKEY=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_AUTHDOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

jukebox

- redirect to `<VITE_BASE_URI>/search` after login

```
VITE_BASE_URI= <PKCE auth redirect url>
VITE_CLIENT_ID= <Spotify client id>
VITE_JUKEBOX_SERVER_URL= <Google cloud function url>
```

jukebox-host

```
VITE_BASE_URI= <PKCE auth redirect url>
VITE_CLIENT_ID= <Spotify client id>
VITE_JUKEBOX_SERVER_URL= <Google cloud function url>

VITE_FIREBASE_APIKEY=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_AUTHDOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

jukebox-server

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```
