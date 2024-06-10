interface ImageObj {
  height?: number
  url: string
  width?: number
}

export function spotifyCoverPicker(imagesUrl: ImageObj[] | null): string | undefined {
  if (!imagesUrl) return undefined
  return imagesUrl.length ? imagesUrl[0].url : undefined
}
