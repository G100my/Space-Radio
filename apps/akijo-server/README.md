# `akijo-server`

## Firebase

```JSON
{
  [space_name/spotify_user_id]: {
    "auth": spotify_auth_response,
    "data": {
      "sites": {
        [site_id]: {
          "name": string,
          "need_review": boolean,
        }
      },
      "settings": {
        "all_pass": boolean,
      },
      "queue": {
        [hash]: TrackBaseInfo & { site_id: string }
      },
    }
  },
}
```

## TODO:

- 擴充介面(擴充店家 / 座位管理)
