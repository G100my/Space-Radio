# `akijo-server`

## Firebase

```JSON
{
  [space_name]: {
    "sites": {
      [site_id]: {
        "need_review": boolean,
        "name": string,
      }
    },
    "all_pass": boolean,
    "host": string
    "queue": {
      [hash]: TrackBaseInfo & { site_id: string }
    }
  },
}
```

## TODO:

- 擴充介面(擴充店家 / 座位管理)
