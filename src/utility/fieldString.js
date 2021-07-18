const getPlaylist = [
  // 'id',
  'name',
  // 'images',
  'limit',
  'next',
  'offset',
  'previous',
  'total',
  {
    'tracks.items': [
      {
        track: [
          {
            album: [
              // 'id',
              'external_urls',
              'images',
              'name',
              // 'release_date',
            ],
          },
          {
            artists: [
              // 'external_urls',
              // 'id',
              'name',
            ],
          },
          // 'duration_ms',
          'id',
          'name',
          // 'preview_url',
          // 'popularity',
        ],
      },
    ],
  },
]

export const playListFields = JSON.stringify(getPlaylist)
  .slice(1, -1)
  .replace(/"/g, '')
  .replace(/:\[/g, '(')
  .replace(/{/g, '')
  .replace(/}/g, '')
  .replace(/]/g, ')')
