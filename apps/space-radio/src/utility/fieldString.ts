const getPlaylist = [
  // 'id',
  'name',
  // 'images',
  {
    items: [
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
  // 'limit',
  'next',
  'offset',
  'previous',
  'total',
]

export const playlistFields = JSON.stringify(getPlaylist)
  .slice(1, -1)
  .replace(/"/g, '')
  .replace(/:\[/g, '(')
  .replace(/{/g, '')
  .replace(/}/g, '')
  .replace(/]/g, ')')
