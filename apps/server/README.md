# `jukebox-server`

## Firebase

```JSON
{
  [space_name/firebase_auth_uid]: {
    "auth": spotify_auth_response,
    "sites": {
      [site_id]: {
        "name": string,
        "need_review": boolean,
      }
    },
    "settings": {
      "top_switch": boolean,
      "display_name": string,
      "welcome_message": string,
      "rules": {
        [hash]: string
      },
      "admin_email": string
    },
    "queue": {
      [hash]: TrackBaseInfo & { site_id: string }
    },
  },
}
```

## TODO:

- 擴充介面(擴充店家 / 座位管理)
